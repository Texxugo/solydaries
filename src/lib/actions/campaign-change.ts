"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import { canModerate } from "@/lib/authz";
import {
  campaignNotificationRecipients,
  canManageCampaign,
} from "@/lib/campaign-authz";
import {
  campaignWritableFields,
  editCampaignSchema,
  hasAnyChange,
  hasMaterialChange,
  readCampaignFormData,
} from "@/lib/campaign-form";
import type { CampaignFormState } from "@/lib/actions/campaign";

const idSchema = z.string().min(1);

const reasonSchema = z
  .string()
  .trim()
  .min(5, "Informe o motivo (mínimo de 5 caracteres).")
  .max(1000, "O motivo pode ter no máximo 1000 caracteres.");

async function notifyCampaignOwners(
  campaign: Parameters<typeof campaignNotificationRecipients>[0],
  title: string,
  body: string
) {
  const recipients = await campaignNotificationRecipients(campaign);
  if (recipients.length === 0) return;
  await prisma.notification.createMany({
    data: recipients.map((personId) => ({
      personId,
      title,
      body,
      href: `/campanhas/${campaign.id}`,
    })),
  });
}

// Edição de campanha pelos responsáveis. Rascunho/rejeitada são editados
// livremente; em campanha publicada, mudanças materiais viram uma alteração
// pendente (a versão pública só muda após aprovação), enquanto mudanças não
// materiais são aplicadas direto.
export async function editCampaignAction(
  _prevState: CampaignFormState,
  formData: FormData
): Promise<CampaignFormState> {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  const campaignId = idSchema.parse(formData.get("campaignId"));
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });
  if (!campaign) return { error: "Campanha não encontrada." };
  if (!(await canManageCampaign(person, campaign))) {
    return { error: "Você não é responsável por esta campanha." };
  }

  const editable =
    campaign.status === "DRAFT" ||
    campaign.status === "REJECTED" ||
    campaign.status === "PUBLISHED";
  if (!editable) {
    return {
      error:
        "Esta campanha não pode ser editada no estado atual (em revisão, encerrada ou suspensa).",
    };
  }

  const parsed = editCampaignSchema.safeParse(readCampaignFormData(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const fields = campaignWritableFields(parsed.data);

  // Rascunho ou rejeitada: edição livre, aplicada direto.
  if (campaign.status !== "PUBLISHED") {
    await prisma.$transaction([
      prisma.campaign.update({
        where: { id: campaign.id },
        data: { ...fields, lastActivityAt: new Date() },
      }),
      prisma.auditLog.create({
        data: {
          actorId: person.id,
          action: "campaign.edited",
          targetType: "Campaign",
          targetId: campaign.id,
        },
      }),
    ]);
    revalidatePath(`/campanhas/${campaign.id}`);
    redirect(`/campanhas/${campaign.id}`);
  }

  // Publicada: precisa haver alguma mudança.
  const current = campaignWritableFields({
    title: campaign.title,
    description: campaign.description,
    category: campaign.category,
    locality: campaign.locality,
    latitude: campaign.latitude ?? 0,
    longitude: campaign.longitude ?? 0,
    logisticsDetails: campaign.logisticsDetails ?? undefined,
    // Doação financeira saiu do MVP; campanhas atuais só têm os tipos
    // selecionáveis. O cast cobre o enum legado do Prisma.
    supportTypes: campaign.supportTypes as ("ITEM_DONATION" | "VOLUNTEER")[],
    goalDescription: campaign.goalDescription,
    supportInstructions: campaign.supportInstructions,
    deadlineMode: campaign.deadline ? "date" : "none",
    deadline: campaign.deadline
      ? campaign.deadline.toISOString().slice(0, 10)
      : undefined,
  });

  if (!hasAnyChange(current, fields)) {
    return { error: "Nenhuma alteração foi feita." };
  }

  // Mudança material exige revisão; só não-material aplica direto.
  if (!hasMaterialChange(current, fields)) {
    await prisma.$transaction([
      prisma.campaign.update({
        where: { id: campaign.id },
        data: { ...fields, lastActivityAt: new Date() },
      }),
      prisma.auditLog.create({
        data: {
          actorId: person.id,
          action: "campaign.edited",
          targetType: "Campaign",
          targetId: campaign.id,
        },
      }),
    ]);
    revalidatePath(`/campanhas/${campaign.id}`);
    redirect(`/campanhas/${campaign.id}`);
  }

  const existing = await prisma.campaignChangeRequest.findFirst({
    where: { campaignId: campaign.id, status: "PENDING" },
  });
  if (existing) {
    return {
      error:
        "Já existe uma alteração aguardando revisão para esta campanha. Aguarde a decisão antes de enviar outra.",
    };
  }

  const change = await prisma.campaignChangeRequest.create({
    data: {
      campaignId: campaign.id,
      submittedById: person.id,
      title: fields.title,
      description: fields.description,
      category: fields.category,
      supportTypes: fields.supportTypes,
      goalDescription: fields.goalDescription,
      supportInstructions: fields.supportInstructions,
      locality: fields.locality,
      latitude: fields.latitude,
      longitude: fields.longitude,
      logisticsDetails: fields.logisticsDetails,
      deadline: fields.deadline,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: person.id,
      action: "campaign_change.submitted",
      targetType: "CampaignChangeRequest",
      targetId: change.id,
    },
  });

  revalidatePath(`/campanhas/${campaign.id}`);
  redirect(`/campanhas/${campaign.id}`);
}

// Moderação aprova a alteração: os campos propostos passam a valer e a
// campanha continua publicada.
export async function approveCampaignChangeAction(
  _prevState: CampaignFormState,
  formData: FormData
): Promise<CampaignFormState> {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");
  if (!canModerate(person)) redirect("/painel");

  const changeId = idSchema.parse(formData.get("changeId"));
  const change = await prisma.campaignChangeRequest.findUnique({
    where: { id: changeId },
    include: { campaign: true },
  });
  if (!change || change.status !== "PENDING") {
    return { error: "Alteração não encontrada ou já decidida." };
  }

  await prisma.$transaction([
    prisma.campaign.update({
      where: { id: change.campaignId },
      data: {
        title: change.title,
        description: change.description,
        category: change.category,
        supportTypes: change.supportTypes,
        goalDescription: change.goalDescription,
        supportInstructions: change.supportInstructions,
        locality: change.locality,
        latitude: change.latitude,
        longitude: change.longitude,
        logisticsDetails: change.logisticsDetails,
        deadline: change.deadline,
        lastActivityAt: new Date(),
      },
    }),
    prisma.campaignChangeRequest.update({
      where: { id: change.id },
      data: { status: "APPROVED", decidedById: person.id, decidedAt: new Date() },
    }),
    prisma.auditLog.create({
      data: {
        actorId: person.id,
        action: "campaign_change.approved",
        targetType: "CampaignChangeRequest",
        targetId: change.id,
      },
    }),
  ]);
  await notifyCampaignOwners(
    change.campaign,
    "Alteração aprovada",
    `As alterações da campanha "${change.title}" foram aprovadas e já estão públicas.`
  );

  revalidatePath("/moderacao/alteracoes");
  redirect("/moderacao/alteracoes");
}

// Moderação rejeita a alteração com motivo; a versão pública permanece.
export async function rejectCampaignChangeAction(
  _prevState: CampaignFormState,
  formData: FormData
): Promise<CampaignFormState> {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");
  if (!canModerate(person)) redirect("/painel");

  const changeId = idSchema.parse(formData.get("changeId"));
  const parsedReason = reasonSchema.safeParse(formData.get("reason"));
  if (!parsedReason.success) {
    return { error: parsedReason.error.issues[0].message };
  }
  const reason = parsedReason.data;

  const change = await prisma.campaignChangeRequest.findUnique({
    where: { id: changeId },
    include: { campaign: true },
  });
  if (!change || change.status !== "PENDING") {
    return { error: "Alteração não encontrada ou já decidida." };
  }

  await prisma.$transaction([
    prisma.campaignChangeRequest.update({
      where: { id: change.id },
      data: {
        status: "REJECTED",
        decisionReason: reason,
        decidedById: person.id,
        decidedAt: new Date(),
      },
    }),
    prisma.auditLog.create({
      data: {
        actorId: person.id,
        action: "campaign_change.rejected",
        targetType: "CampaignChangeRequest",
        targetId: change.id,
        reason,
      },
    }),
  ]);
  await notifyCampaignOwners(
    change.campaign,
    "Alteração rejeitada",
    `As alterações propostas para a campanha "${change.campaign.title}" foram rejeitadas. A versão pública permanece inalterada. Motivo: ${reason}`
  );

  revalidatePath("/moderacao/alteracoes");
  redirect("/moderacao/alteracoes");
}

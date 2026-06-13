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

// Dono/representante envia rascunho (ou campanha rejeitada) para revisão.
export async function submitCampaignForReviewAction(
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
  if (campaign.status !== "DRAFT" && campaign.status !== "REJECTED") {
    return { error: "Esta campanha não pode ser enviada para revisão." };
  }

  await prisma.$transaction([
    prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        status: "PENDING_REVIEW",
        statusReason: null,
        lastActivityAt: new Date(),
      },
    }),
    prisma.auditLog.create({
      data: {
        actorId: person.id,
        action: "campaign.submitted_for_review",
        targetType: "Campaign",
        targetId: campaign.id,
      },
    }),
  ]);

  revalidatePath(`/campanhas/${campaign.id}`);
  return {};
}

// Moderação aprova: campanha vai ao ar.
export async function approveCampaignAction(
  _prevState: CampaignFormState,
  formData: FormData
): Promise<CampaignFormState> {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");
  if (!canModerate(person)) redirect("/painel");

  const campaignId = idSchema.parse(formData.get("campaignId"));
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });
  if (!campaign || campaign.status !== "PENDING_REVIEW") {
    return { error: "Campanha não encontrada ou fora da fila de revisão." };
  }

  await prisma.$transaction([
    prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        status: "PUBLISHED",
        statusReason: null,
        lastActivityAt: new Date(),
      },
    }),
    prisma.auditLog.create({
      data: {
        actorId: person.id,
        action: "campaign.approved",
        targetType: "Campaign",
        targetId: campaign.id,
      },
    }),
  ]);
  await notifyCampaignOwners(
    campaign,
    "Campanha publicada 🎉",
    `A campanha "${campaign.title}" passou pela revisão e está pública.`
  );

  revalidatePath("/moderacao/revisao");
  redirect("/moderacao/revisao");
}

// Moderação rejeita com motivo obrigatório.
export async function rejectCampaignAction(
  _prevState: CampaignFormState,
  formData: FormData
): Promise<CampaignFormState> {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");
  if (!canModerate(person)) redirect("/painel");

  const campaignId = idSchema.parse(formData.get("campaignId"));
  const parsedReason = reasonSchema.safeParse(formData.get("reason"));
  if (!parsedReason.success) {
    return { error: parsedReason.error.issues[0].message };
  }
  const reason = parsedReason.data;

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });
  if (!campaign || campaign.status !== "PENDING_REVIEW") {
    return { error: "Campanha não encontrada ou fora da fila de revisão." };
  }

  await prisma.$transaction([
    prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: "REJECTED", statusReason: reason },
    }),
    prisma.auditLog.create({
      data: {
        actorId: person.id,
        action: "campaign.rejected",
        targetType: "Campaign",
        targetId: campaign.id,
        reason,
      },
    }),
  ]);
  await notifyCampaignOwners(
    campaign,
    "Campanha rejeitada",
    `A campanha "${campaign.title}" foi rejeitada na revisão e pode ser corrigida e reenviada. Motivo: ${reason}`
  );

  revalidatePath("/moderacao/revisao");
  redirect("/moderacao/revisao");
}

// Moderação suspende campanha publicada (sai do ar) com motivo.
export async function suspendCampaignAction(
  _prevState: CampaignFormState,
  formData: FormData
): Promise<CampaignFormState> {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");
  if (!canModerate(person)) redirect("/painel");

  const campaignId = idSchema.parse(formData.get("campaignId"));
  const parsedReason = reasonSchema.safeParse(formData.get("reason"));
  if (!parsedReason.success) {
    return { error: parsedReason.error.issues[0].message };
  }
  const reason = parsedReason.data;

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });
  if (!campaign || campaign.status !== "PUBLISHED") {
    return { error: "Somente campanhas publicadas podem ser suspensas." };
  }

  await prisma.$transaction([
    prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: "SUSPENDED", statusReason: reason },
    }),
    prisma.auditLog.create({
      data: {
        actorId: person.id,
        action: "campaign.suspended",
        targetType: "Campaign",
        targetId: campaign.id,
        reason,
      },
    }),
  ]);
  await notifyCampaignOwners(
    campaign,
    "Campanha suspensa",
    `A campanha "${campaign.title}" foi suspensa pela moderação e saiu do ar. Motivo: ${reason}`
  );

  revalidatePath(`/campanhas/${campaign.id}`);
  return {};
}

// Responsáveis encerram a campanha manualmente.
export async function closeCampaignAction(
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
  if (campaign.status !== "PUBLISHED") {
    return { error: "Somente campanhas publicadas podem ser encerradas." };
  }

  await prisma.$transaction([
    prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: "CLOSED", lastActivityAt: new Date() },
    }),
    prisma.auditLog.create({
      data: {
        actorId: person.id,
        action: "campaign.closed",
        targetType: "Campaign",
        targetId: campaign.id,
      },
    }),
  ]);

  revalidatePath(`/campanhas/${campaign.id}`);
  return {};
}

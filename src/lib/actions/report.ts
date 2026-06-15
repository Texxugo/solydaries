"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import { canModerate } from "@/lib/authz";
import {
  campaignNotificationRecipients,
  canManageCampaign,
} from "@/lib/campaign-authz";

export type ReportFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

const idSchema = z.string().min(1);
const reasonSchema = z
  .string()
  .trim()
  .min(10, "Descreva o motivo da denúncia (mínimo de 10 caracteres).")
  .max(1000, "O motivo pode ter no máximo 1000 caracteres.");

// Avisa moderadores e administradores sobre uma nova denúncia.
async function notifyModerators(body: string) {
  const moderators = await prisma.person.findMany({
    where: { role: { in: ["MODERATOR", "ADMIN"] }, isActive: true },
    select: { id: true },
  });
  if (moderators.length === 0) return;
  await prisma.notification.createMany({
    data: moderators.map((m) => ({
      personId: m.id,
      title: "Nova denúncia",
      body,
      href: "/moderacao/denuncias",
    })),
  });
}

async function auditReport(actorId: string, reportId: string) {
  await prisma.auditLog.create({
    data: {
      actorId,
      action: "report.created",
      targetType: "Report",
      targetId: reportId,
    },
  });
}

// Doador denuncia uma campanha publicada.
export async function reportCampaignAction(
  _prevState: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  const campaignId = idSchema.parse(formData.get("campaignId"));
  const parsed = reasonSchema.safeParse(formData.get("reason"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });
  if (!campaign || campaign.status !== "PUBLISHED") {
    return { error: "Só é possível denunciar campanhas publicadas." };
  }

  const existing = await prisma.report.findFirst({
    where: { reporterId: person.id, campaignId, status: "OPEN" },
    select: { id: true },
  });
  if (existing) {
    return { error: "Você já tem uma denúncia em aberto para esta campanha." };
  }

  const report = await prisma.report.create({
    data: {
      reporterId: person.id,
      targetType: "CAMPAIGN",
      campaignId,
      reason: parsed.data,
    },
  });
  await auditReport(person.id, report.id);
  await notifyModerators(`Campanha denunciada: "${campaign.title}".`);

  revalidatePath(`/campanhas/${campaignId}`);
  return { success: true };
}

// Doador denuncia um post de organização publicado.
export async function reportPostAction(
  _prevState: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  const postId = idSchema.parse(formData.get("postId"));
  const parsed = reasonSchema.safeParse(formData.get("reason"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const post = await prisma.organizationPost.findUnique({
    where: { id: postId },
  });
  if (!post || post.status !== "PUBLISHED") {
    return { error: "Só é possível denunciar posts publicados." };
  }

  const existing = await prisma.report.findFirst({
    where: { reporterId: person.id, organizationPostId: postId, status: "OPEN" },
    select: { id: true },
  });
  if (existing) {
    return { error: "Você já tem uma denúncia em aberto para este post." };
  }

  const report = await prisma.report.create({
    data: {
      reporterId: person.id,
      targetType: "ORGANIZATION_POST",
      organizationPostId: postId,
      reason: parsed.data,
    },
  });
  await auditReport(person.id, report.id);
  await notifyModerators("Um post de organização foi denunciado.");

  revalidatePath(`/organizacoes/${post.organizationId}`);
  return { success: true };
}

// Responsável/Gestor denuncia uma oferta de apoio recebida.
export async function reportOfferAction(
  _prevState: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  const offerId = idSchema.parse(formData.get("offerId"));
  const parsed = reasonSchema.safeParse(formData.get("reason"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const offer = await prisma.supportOffer.findUnique({
    where: { id: offerId },
    include: { campaign: true },
  });
  if (!offer) return { error: "Oferta não encontrada." };
  if (!(await canManageCampaign(person, offer.campaign))) {
    return { error: "Você não é responsável por esta campanha." };
  }

  const existing = await prisma.report.findFirst({
    where: { reporterId: person.id, supportOfferId: offerId, status: "OPEN" },
    select: { id: true },
  });
  if (existing) {
    return { error: "Você já tem uma denúncia em aberto para esta oferta." };
  }

  const report = await prisma.report.create({
    data: {
      reporterId: person.id,
      targetType: "SUPPORT_OFFER",
      supportOfferId: offerId,
      reason: parsed.data,
    },
  });
  await auditReport(person.id, report.id);
  await notifyModerators(
    `Uma oferta de apoio da campanha "${offer.campaign.title}" foi denunciada.`
  );

  revalidatePath(`/campanhas/${offer.campaignId}/apoios`);
  return { success: true };
}

// Moderação resolve a denúncia: arquiva (improcedente) ou acata (procedente),
// suspendendo o conteúdo quando necessário. Sempre com motivo.
export async function resolveReportAction(
  _prevState: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");
  if (!canModerate(person)) redirect("/painel");

  const reportId = idSchema.parse(formData.get("reportId"));
  const outcome = formData.get("outcome")?.toString();
  if (outcome !== "dismiss" && outcome !== "uphold") {
    return { error: "Escolha uma decisão." };
  }
  const parsed = reasonSchema.safeParse(formData.get("reason"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const note = parsed.data;

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: { campaign: true, organizationPost: true, supportOffer: true },
  });
  if (!report || report.status !== "OPEN") {
    return { error: "Denúncia não encontrada ou já resolvida." };
  }

  const upheld = outcome === "uphold";
  const now = new Date();
  const actions: Prisma.PrismaPromise<unknown>[] = [
    prisma.report.update({
      where: { id: report.id },
      data: {
        status: "RESOLVED",
        resolution: upheld ? "UPHELD" : "DISMISSED",
        resolutionNote: note,
        resolvedById: person.id,
        resolvedAt: now,
      },
    }),
    prisma.auditLog.create({
      data: {
        actorId: person.id,
        action: upheld ? "report.upheld" : "report.dismissed",
        targetType: "Report",
        targetId: report.id,
        reason: note,
      },
    }),
    prisma.notification.create({
      data: {
        personId: report.reporterId,
        title: upheld ? "Denúncia acatada" : "Denúncia analisada",
        body: upheld
          ? `Sua denúncia foi acatada e a moderação tomou as devidas providências.`
          : `Sua denúncia foi analisada e considerada improcedente. ${note}`,
        href: "/painel",
      },
    }),
  ];

  // Ao acatar, suspende/remove o conteúdo denunciado e avisa os envolvidos.
  if (upheld) {
    if (report.campaign && report.campaign.status === "PUBLISHED") {
      actions.push(
        prisma.campaign.update({
          where: { id: report.campaign.id },
          data: { status: "SUSPENDED", statusReason: note },
        })
      );
      const recipients = await campaignNotificationRecipients(report.campaign);
      if (recipients.length > 0) {
        actions.push(
          prisma.notification.createMany({
            data: recipients.map((personId) => ({
              personId,
              title: "Campanha suspensa",
              body: `A campanha "${report.campaign!.title}" foi suspensa após denúncia. Motivo: ${note}`,
              href: `/campanhas/${report.campaign!.id}`,
            })),
          })
        );
      }
    }
    if (report.organizationPost && report.organizationPost.status !== "SUSPENDED") {
      actions.push(
        prisma.organizationPost.update({
          where: { id: report.organizationPost.id },
          data: { status: "SUSPENDED", statusReason: note },
        })
      );
      const reps = await prisma.organizationMember.findMany({
        where: {
          organizationId: report.organizationPost.organizationId,
          role: "REPRESENTATIVE",
        },
        select: { personId: true },
      });
      if (reps.length > 0) {
        actions.push(
          prisma.notification.createMany({
            data: reps.map((rep) => ({
              personId: rep.personId,
              title: "Post suspenso pela moderação",
              body: `Um post foi suspenso após denúncia. Motivo: ${note}`,
              href: `/organizacoes/${report.organizationPost!.organizationId}`,
            })),
          })
        );
      }
    }
    if (report.supportOffer && report.supportOffer.status === "PENDING") {
      actions.push(
        prisma.supportOffer.update({
          where: { id: report.supportOffer.id },
          data: {
            status: "MANAGER_DECLINED",
            declineReason: note,
            decidedById: person.id,
            decidedAt: now,
          },
        }),
        prisma.notification.create({
          data: {
            personId: report.supportOffer.donorId,
            title: "Oferta de apoio recusada",
            body: `Sua oferta de apoio foi recusada pela moderação após denúncia. Motivo: ${note}`,
            href: `/campanhas/${report.supportOffer.campaignId}`,
          },
        })
      );
    }
  }

  await prisma.$transaction(actions);

  revalidatePath("/moderacao/denuncias");
  redirect("/moderacao/denuncias");
}

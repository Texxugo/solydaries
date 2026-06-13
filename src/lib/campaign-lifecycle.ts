import "server-only";

import { prisma } from "@/lib/prisma";

// Encerramento por prazo sem workers: quando páginas relevantes carregam,
// campanhas publicadas com prazo vencido são encerradas, com auditoria e
// notificação aos responsáveis.
export async function closeExpiredCampaigns() {
  const expired = await prisma.campaign.findMany({
    where: { status: "PUBLISHED", deadline: { lt: new Date() } },
    include: {
      ownerOrganization: {
        include: {
          members: {
            where: { role: "REPRESENTATIVE" },
            select: { personId: true },
          },
        },
      },
    },
  });

  for (const campaign of expired) {
    const recipients = campaign.ownerPersonId
      ? [campaign.ownerPersonId]
      : (campaign.ownerOrganization?.members.map((m) => m.personId) ?? []);

    await prisma.$transaction([
      prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: "CLOSED" },
      }),
      prisma.auditLog.create({
        data: {
          actorId: null,
          action: "campaign.closed_by_deadline",
          targetType: "Campaign",
          targetId: campaign.id,
        },
      }),
      ...(recipients.length > 0
        ? [
            prisma.notification.createMany({
              data: recipients.map((personId) => ({
                personId,
                title: "Campanha encerrada pelo prazo",
                body: `A campanha "${campaign.title}" atingiu o prazo definido e foi encerrada.`,
                href: `/campanhas/${campaign.id}`,
              })),
            }),
          ]
        : []),
    ]);
  }
}

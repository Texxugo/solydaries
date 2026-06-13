import "server-only";

import { prisma } from "@/lib/prisma";

export const INACTIVITY_DAYS = 30;

function inactivityCutoff() {
  return new Date(Date.now() - INACTIVITY_DAYS * 24 * 60 * 60 * 1000);
}

// Sem workers em background no MVP, a checagem de inatividade é
// "preguiçosa": roda quando páginas relevantes são carregadas. Notifica o
// dono (ou os representantes da organização dona) uma única vez por período
// parado — se a campanha voltar a ter movimentação (lastActivityAt avança),
// um novo período parado gera novo aviso.
export async function processInactiveCampaigns() {
  const cutoff = inactivityCutoff();

  const inactive = await prisma.campaign.findMany({
    where: {
      status: { in: ["DRAFT", "PUBLISHED"] },
      lastActivityAt: { lt: cutoff },
      OR: [
        { inactivityNotifiedAt: null },
        {
          inactivityNotifiedAt: {
            lt: prisma.campaign.fields.lastActivityAt,
          },
        },
      ],
    },
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

  for (const campaign of inactive) {
    const recipients = campaign.ownerPersonId
      ? [campaign.ownerPersonId]
      : (campaign.ownerOrganization?.members.map((m) => m.personId) ?? []);
    if (recipients.length === 0) continue;

    await prisma.$transaction([
      prisma.notification.createMany({
        data: recipients.map((personId) => ({
          personId,
          title: "Campanha sem movimentação",
          body: `A campanha "${campaign.title}" está há mais de ${INACTIVITY_DAYS} dias sem movimentação. Deseja mantê-la ou encerrá-la?`,
          href: `/campanhas/${campaign.id}`,
        })),
      }),
      prisma.campaign.update({
        where: { id: campaign.id },
        data: { inactivityNotifiedAt: new Date() },
      }),
    ]);
  }
}

// Campanhas paradas para a fila de moderação, da mais antiga para a mais
// recente.
export async function findInactiveCampaigns() {
  return prisma.campaign.findMany({
    where: {
      status: { in: ["DRAFT", "PUBLISHED"] },
      lastActivityAt: { lt: inactivityCutoff() },
    },
    orderBy: { lastActivityAt: "asc" },
    include: {
      ownerPerson: { select: { name: true } },
      ownerOrganization: { select: { name: true } },
    },
  });
}

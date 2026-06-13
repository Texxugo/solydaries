import "server-only";

import { prisma } from "@/lib/prisma";
import type { Campaign, Person } from "@/generated/prisma/client";

// Responsáveis pela campanha: dono pessoa ou representante da organização
// dona. São quem pode enviar para revisão, encerrar etc.
export async function canManageCampaign(person: Person, campaign: Campaign) {
  if (campaign.ownerPersonId === person.id) return true;
  if (!campaign.ownerOrganizationId) return false;

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_personId: {
        organizationId: campaign.ownerOrganizationId,
        personId: person.id,
      },
    },
  });
  return membership?.role === "REPRESENTATIVE";
}

// Destinatários de notificações sobre a campanha: dono pessoa ou todos os
// representantes da organização dona.
export async function campaignNotificationRecipients(campaign: Campaign) {
  if (campaign.ownerPersonId) return [campaign.ownerPersonId];
  if (!campaign.ownerOrganizationId) return [];

  const representatives = await prisma.organizationMember.findMany({
    where: {
      organizationId: campaign.ownerOrganizationId,
      role: "REPRESENTATIVE",
    },
    select: { personId: true },
  });
  return representatives.map((member) => member.personId);
}

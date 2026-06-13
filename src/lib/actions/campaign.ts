"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import {
  campaignWritableFields,
  createCampaignSchema,
  readCampaignFormData,
} from "@/lib/campaign-form";

export type CampaignFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createCampaignAction(
  _prevState: CampaignFormState,
  formData: FormData
): Promise<CampaignFormState> {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  const parsed = createCampaignSchema.safeParse({
    context: formData.get("context"),
    ...readCampaignFormData(formData),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const data = parsed.data;

  // Contexto de atuação: define o dono exclusivo da campanha.
  let ownerPersonId: string | null = null;
  let ownerOrganizationId: string | null = null;

  if (data.context === "self") {
    // Campanha em nome próprio exige Validação de Pessoa aprovada.
    if (!person.validatedAt) {
      return {
        error:
          "Sua conta ainda não está validada. Solicite a Validação de Pessoa para criar campanhas em seu nome.",
      };
    }
    ownerPersonId = person.id;
  } else {
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_personId: {
          organizationId: data.context,
          personId: person.id,
        },
      },
      include: { organization: true },
    });
    if (!membership || membership.role !== "REPRESENTATIVE") {
      return { error: "Você não representa esta organização." };
    }
    if (!membership.organization.isActive) {
      return { error: "Esta organização está desativada." };
    }
    // Campanha em nome de organização exige Validação de Organização.
    if (!membership.organization.validatedAt) {
      return {
        error:
          "Esta organização ainda não foi validada e não pode ter campanhas em seu nome.",
      };
    }
    ownerOrganizationId = membership.organization.id;
  }

  const campaign = await prisma.campaign.create({
    data: {
      ...campaignWritableFields(data),
      ownerPersonId,
      ownerOrganizationId,
      createdById: person.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: person.id,
      action: "campaign.created",
      targetType: "Campaign",
      targetId: campaign.id,
    },
  });

  revalidatePath("/campanhas");
  redirect(`/campanhas/${campaign.id}`);
}

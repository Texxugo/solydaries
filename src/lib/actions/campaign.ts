"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import type { CampaignCategory, SupportType } from "@/generated/prisma/client";

export type CampaignFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

const CATEGORIES = [
  "FOOD",
  "CLOTHING",
  "HEALTH",
  "EDUCATION",
  "HOUSING",
  "ANIMALS",
  "ENVIRONMENT",
  "OTHER",
] as const;

const SUPPORT_TYPES = ["ITEM_DONATION", "VOLUNTEER"] as const;

const campaignSchema = z
  .object({
    context: z.string().min(1, "Escolha em nome de quem a campanha será criada."),
    title: z
      .string()
      .trim()
      .min(5, "O título deve ter pelo menos 5 caracteres.")
      .max(140, "O título pode ter no máximo 140 caracteres."),
    description: z
      .string()
      .trim()
      .min(30, "Descreva a campanha com pelo menos 30 caracteres.")
      .max(5000, "A descrição pode ter no máximo 5000 caracteres."),
    category: z.enum(CATEGORIES, "Escolha uma categoria."),
    locality: z
      .string()
      .trim()
      .min(3, "Informe a localidade (cidade/UF).")
      .max(120, "A localidade pode ter no máximo 120 caracteres."),
    // Preprocess: input oculto vazio ("") viraria 0 com coerce — precisa
    // virar undefined para o erro "escolha o pin" disparar.
    latitude: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.coerce
        .number({ error: "Clique no mapa para escolher o pin público." })
        .min(-90)
        .max(90)
    ),
    longitude: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.coerce
        .number({ error: "Clique no mapa para escolher o pin público." })
        .min(-180)
        .max(180)
    ),
    logisticsDetails: z
      .string()
      .trim()
      .max(1000, "O ponto logístico pode ter no máximo 1000 caracteres.")
      .optional(),
    supportTypes: z
      .array(z.enum(SUPPORT_TYPES))
      .min(1, "Escolha pelo menos um tipo de apoio."),
    goalDescription: z
      .string()
      .trim()
      .min(10, "Descreva a necessidade ou meta com pelo menos 10 caracteres.")
      .max(1000, "A meta pode ter no máximo 1000 caracteres."),
    supportInstructions: z
      .string()
      .trim()
      .min(10, "Explique como apoiar com pelo menos 10 caracteres.")
      .max(2000, "As instruções podem ter no máximo 2000 caracteres."),
    deadlineMode: z.enum(["none", "date"], "Indique se a campanha tem prazo."),
    deadline: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.deadlineMode === "date") {
      if (!data.deadline) {
        ctx.addIssue({
          code: "custom",
          path: ["deadline"],
          message: "Informe a data do prazo.",
        });
        return;
      }
      const date = new Date(`${data.deadline}T23:59:59`);
      if (Number.isNaN(date.getTime()) || date < new Date()) {
        ctx.addIssue({
          code: "custom",
          path: ["deadline"],
          message: "O prazo deve ser uma data futura.",
        });
      }
    }
  });

export async function createCampaignAction(
  _prevState: CampaignFormState,
  formData: FormData
): Promise<CampaignFormState> {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  const parsed = campaignSchema.safeParse({
    context: formData.get("context"),
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    locality: formData.get("locality"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    logisticsDetails: formData.get("logisticsDetails")?.toString(),
    supportTypes: formData.getAll("supportTypes").map(String),
    goalDescription: formData.get("goalDescription"),
    supportInstructions: formData.get("supportInstructions"),
    deadlineMode: formData.get("deadlineMode"),
    deadline: formData.get("deadline")?.toString(),
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
      title: data.title,
      description: data.description,
      category: data.category as CampaignCategory,
      locality: data.locality,
      // Arredonda também no servidor: o pin público é aproximado (~100 m)
      // mesmo que o cliente envie coordenadas precisas.
      latitude: Math.round(data.latitude * 1000) / 1000,
      longitude: Math.round(data.longitude * 1000) / 1000,
      logisticsDetails: data.logisticsDetails || null,
      supportTypes: data.supportTypes as SupportType[],
      goalDescription: data.goalDescription,
      supportInstructions: data.supportInstructions,
      deadline:
        data.deadlineMode === "date"
          ? new Date(`${data.deadline}T23:59:59`)
          : null,
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

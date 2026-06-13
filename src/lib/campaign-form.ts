import { z } from "zod";
import type { CampaignCategory, SupportType } from "@/generated/prisma/client";

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

// Campos comuns a criação e edição (sem o contexto/dono, que só existe na
// criação e não muda depois).
const campaignFieldsShape = {
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
  // Input oculto vazio ("") viraria 0 com coerce — precisa virar undefined
  // para o erro "escolha o pin" disparar.
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
};

function deadlineRefine(
  data: { deadlineMode: "none" | "date"; deadline?: string },
  ctx: z.RefinementCtx
) {
  if (data.deadlineMode !== "date") return;
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

export const createCampaignSchema = z
  .object({
    context: z.string().min(1, "Escolha em nome de quem a campanha será criada."),
    ...campaignFieldsShape,
  })
  .superRefine(deadlineRefine);

export const editCampaignSchema = z
  .object(campaignFieldsShape)
  .superRefine(deadlineRefine);

export type CampaignFieldsInput = z.infer<typeof editCampaignSchema>;

// Lê os campos do formulário (sem contexto) em formato cru para validação.
export function readCampaignFormData(formData: FormData) {
  return {
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
  };
}

// Converte os dados validados em campos prontos para o banco.
export function campaignWritableFields(data: CampaignFieldsInput) {
  return {
    title: data.title,
    description: data.description,
    category: data.category as CampaignCategory,
    locality: data.locality,
    // Pin público sempre aproximado (~100 m), arredondado no servidor.
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
  };
}

type CampaignWritable = ReturnType<typeof campaignWritableFields>;

function sameSupportTypes(a: SupportType[], b: SupportType[]) {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((type) => setB.has(type));
}

function sameDeadline(a: Date | null, b: Date | null) {
  if (a === null || b === null) return a === b;
  return a.getTime() === b.getTime();
}

// Campos materiais: afetam propósito, apresentação pública ou localidade.
// Mudanças neles em campanha publicada exigem revisão de alteração.
export function hasMaterialChange(
  current: CampaignWritable,
  proposed: CampaignWritable
) {
  return (
    current.title !== proposed.title ||
    current.description !== proposed.description ||
    current.category !== proposed.category ||
    current.goalDescription !== proposed.goalDescription ||
    current.locality !== proposed.locality ||
    current.latitude !== proposed.latitude ||
    current.longitude !== proposed.longitude ||
    !sameSupportTypes(current.supportTypes, proposed.supportTypes)
  );
}

// Qualquer mudança (material ou não), para evitar "salvar" sem alteração.
export function hasAnyChange(
  current: CampaignWritable,
  proposed: CampaignWritable
) {
  return (
    hasMaterialChange(current, proposed) ||
    current.supportInstructions !== proposed.supportInstructions ||
    current.logisticsDetails !== proposed.logisticsDetails ||
    !sameDeadline(current.deadline, proposed.deadline)
  );
}

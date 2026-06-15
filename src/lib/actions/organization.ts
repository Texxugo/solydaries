"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import { isAdmin } from "@/lib/authz";
import { formatPersonName } from "@/lib/format";
import {
  allowedDocumentMimeTypes,
  maxDocumentSizeBytes,
  savePrivateFile,
} from "@/lib/private-files";
import {
  allowedImageMimeTypes,
  maxImageSizeBytes,
  savePublicImage,
} from "@/lib/public-files";

export type OrganizationFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

const createOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "O nome da organização deve ter pelo menos 3 caracteres.")
    .max(120, "O nome pode ter no máximo 120 caracteres."),
  description: z
    .string()
    .trim()
    .max(2000, "A descrição pode ter no máximo 2000 caracteres.")
    .optional(),
});

export async function createOrganizationAction(
  _prevState: OrganizationFormState,
  formData: FormData
): Promise<OrganizationFormState> {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  const parsed = createOrganizationSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description")?.toString(),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  // Trava anti-abuso: uma pessoa não pode acumular mais de 2 organizações
  // ativas ainda não validadas como representante (decisão de produto para
  // proteger a fila de validação dos administradores).
  const unvalidatedCount = await prisma.organizationMember.count({
    where: {
      personId: person.id,
      role: "REPRESENTATIVE",
      organization: { validatedAt: null, isActive: true },
    },
  });
  if (unvalidatedCount >= 2) {
    return {
      error:
        "Você já tem 2 organizações aguardando validação. Conclua a validação de uma delas antes de criar outra.",
    };
  }

  const organization = await prisma.organization.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      members: {
        create: { personId: person.id, role: "REPRESENTATIVE" },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: person.id,
      action: "organization.created",
      targetType: "Organization",
      targetId: organization.id,
    },
  });

  revalidatePath("/organizacoes");
  redirect(`/organizacoes/${organization.id}`);
}

// Converte "" em undefined para validar campos opcionais corretamente.
const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const updateOrgProfileSchema = z.object({
  description: z
    .string()
    .trim()
    .max(2000, "A descrição pode ter no máximo 2000 caracteres.")
    .optional(),
  publicEmail: z.preprocess(
    emptyToUndefined,
    z.string().trim().email("Informe um e-mail válido.").max(200).optional()
  ),
  phone: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(40, "O telefone pode ter no máximo 40 caracteres.").optional()
  ),
  website: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(200, "O site pode ter no máximo 200 caracteres.").optional()
  ),
});

// Lê uma imagem opcional do formulário. Retorna a URL salva (nova imagem),
// null (nenhum arquivo enviado) ou um erro de validação.
async function readOptionalImage(
  formData: FormData,
  field: string,
  folder: string
): Promise<string | null | { error: string }> {
  const file = formData.get(field);
  if (!(file instanceof File) || file.size === 0) return null;
  if (!allowedImageMimeTypes.includes(file.type)) {
    return { error: "Imagem inválida. Use JPG, PNG ou WebP." };
  }
  if (file.size > maxImageSizeBytes) {
    return { error: "A imagem excede o limite de 5 MB." };
  }
  return savePublicImage(folder, file);
}

// Representante edita o perfil público (descrição, contatos e imagens).
export async function updateOrganizationProfileAction(
  _prevState: OrganizationFormState,
  formData: FormData
): Promise<OrganizationFormState> {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  const organizationId = formData.get("organizationId")?.toString() ?? "";
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_personId: { organizationId, personId: person.id },
    },
  });
  if (!membership || membership.role !== "REPRESENTATIVE") {
    return { error: "Você não é representante desta organização." };
  }

  const parsed = updateOrgProfileSchema.safeParse({
    description: formData.get("description")?.toString(),
    publicEmail: formData.get("publicEmail")?.toString(),
    phone: formData.get("phone")?.toString(),
    website: formData.get("website")?.toString(),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  // Imagens são opcionais: ausência mantém a atual; arquivo novo substitui.
  const logo = await readOptionalImage(formData, "logo", "org-logos");
  if (logo && typeof logo === "object") return { error: logo.error };
  const cover = await readOptionalImage(formData, "cover", "org-covers");
  if (cover && typeof cover === "object") return { error: cover.error };

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      description: parsed.data.description || null,
      publicEmail: parsed.data.publicEmail || null,
      phone: parsed.data.phone || null,
      website: parsed.data.website || null,
      ...(typeof logo === "string" ? { logoUrl: logo } : {}),
      ...(typeof cover === "string" ? { coverUrl: cover } : {}),
    },
  });

  revalidatePath(`/organizacoes/${organizationId}`);
  redirect(`/organizacoes/${organizationId}`);
}

const MAX_DOCUMENTS = 5;

export async function submitOrgValidationAction(
  _prevState: OrganizationFormState,
  formData: FormData
): Promise<OrganizationFormState> {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  const organizationId = formData.get("organizationId")?.toString() ?? "";
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_personId: { organizationId, personId: person.id },
    },
    include: { organization: true },
  });

  // Apenas representantes podem solicitar a validação da organização.
  if (!membership || membership.role !== "REPRESENTATIVE") {
    return { error: "Você não é representante desta organização." };
  }

  const organization = membership.organization;
  if (!organization.isActive) {
    return { error: "Esta organização está desativada." };
  }
  if (organization.validatedAt) {
    return { error: "Esta organização já está validada." };
  }

  const open = await prisma.organizationValidationRequest.findFirst({
    where: { organizationId, status: "PENDING" },
  });
  if (open) {
    return { error: "Já existe uma solicitação pendente para esta organização." };
  }

  if (formData.get("documentConsent") !== "on") {
    return {
      error:
        "É necessário consentir com o envio e a análise dos documentos para continuar.",
    };
  }

  const note = z
    .string()
    .trim()
    .max(1000)
    .optional()
    .parse(formData.get("note")?.toString());

  const files = formData
    .getAll("documents")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length === 0) {
    return { error: "Envie pelo menos um documento institucional." };
  }
  if (files.length > MAX_DOCUMENTS) {
    return { error: `Envie no máximo ${MAX_DOCUMENTS} documentos.` };
  }
  for (const file of files) {
    if (!allowedDocumentMimeTypes.includes(file.type)) {
      return {
        error: `Formato não aceito (${file.name}). Use PDF, JPG, PNG ou WebP.`,
      };
    }
    if (file.size > maxDocumentSizeBytes) {
      return { error: `O arquivo ${file.name} excede o limite de 10 MB.` };
    }
  }

  const documents = [];
  for (const file of files) {
    const storedName = await savePrivateFile("validation-documents", file);
    documents.push({
      fileName: file.name,
      storedName,
      mimeType: file.type,
      sizeBytes: file.size,
    });
  }

  const request = await prisma.organizationValidationRequest.create({
    data: {
      organizationId,
      submittedById: person.id,
      note: note || null,
      documentConsentAt: new Date(),
      documents: { create: documents },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: person.id,
      action: "organization_validation.submitted",
      targetType: "OrganizationValidationRequest",
      targetId: request.id,
    },
  });

  const admins = await prisma.person.findMany({
    where: { role: "ADMIN", isActive: true },
    select: { id: true },
  });
  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        personId: admin.id,
        title: "Nova validação de organização",
        body: `${formatPersonName(person.name)} enviou a validação da organização "${organization.name}".`,
        href: "/admin/validacoes-organizacoes",
      })),
    });
  }

  revalidatePath(`/organizacoes/${organizationId}`);
  redirect(`/organizacoes/${organizationId}`);
}

const decisionSchema = z.object({
  requestId: z.string().min(1),
  reason: z.string().trim().max(1000).optional(),
});

async function decideOrgValidation(
  formData: FormData,
  decision: "APPROVED" | "REJECTED"
): Promise<OrganizationFormState> {
  const admin = await getSessionPerson();
  if (!admin) redirect("/entrar");
  if (!isAdmin(admin)) redirect("/painel");

  const parsed = decisionSchema.safeParse({
    requestId: formData.get("requestId"),
    reason: formData.get("reason")?.toString(),
  });
  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }
  const { requestId, reason } = parsed.data;

  if (decision === "REJECTED" && !reason) {
    return { error: "Informe o motivo da rejeição." };
  }

  const request = await prisma.organizationValidationRequest.findUnique({
    where: { id: requestId },
    include: { organization: true },
  });
  if (!request || request.status !== "PENDING") {
    return { error: "Solicitação não encontrada ou já decidida." };
  }

  const representatives = await prisma.organizationMember.findMany({
    where: {
      organizationId: request.organizationId,
      role: "REPRESENTATIVE",
    },
    select: { personId: true },
  });

  const decidedAt = new Date();
  const orgName = request.organization.name;

  await prisma.$transaction([
    prisma.organizationValidationRequest.update({
      where: { id: request.id },
      data: {
        status: decision,
        decisionReason: reason || null,
        decidedById: admin.id,
        decidedAt,
      },
    }),
    ...(decision === "APPROVED"
      ? [
          prisma.organization.update({
            where: { id: request.organizationId },
            data: { validatedAt: decidedAt },
          }),
        ]
      : []),
    prisma.notification.createMany({
      data: representatives.map((rep) => ({
        personId: rep.personId,
        title:
          decision === "APPROVED"
            ? "Organização validada 🎉"
            : "Validação de organização rejeitada",
        body:
          decision === "APPROVED"
            ? `A organização "${orgName}" foi validada. A página pública e campanhas em nome dela estão habilitadas.`
            : `A validação da organização "${orgName}" foi rejeitada e pode ser reenviada com correções. Motivo: ${reason}`,
        href: `/organizacoes/${request.organizationId}`,
      })),
    }),
    prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action:
          decision === "APPROVED"
            ? "organization_validation.approved"
            : "organization_validation.rejected",
        targetType: "OrganizationValidationRequest",
        targetId: request.id,
        reason: reason || null,
      },
    }),
  ]);

  revalidatePath("/admin/validacoes-organizacoes");
  redirect("/admin/validacoes-organizacoes");
}

export async function approveOrgValidationAction(
  _prevState: OrganizationFormState,
  formData: FormData
): Promise<OrganizationFormState> {
  return decideOrgValidation(formData, "APPROVED");
}

export async function rejectOrgValidationAction(
  _prevState: OrganizationFormState,
  formData: FormData
): Promise<OrganizationFormState> {
  return decideOrgValidation(formData, "REJECTED");
}

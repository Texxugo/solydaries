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

export type ValidationFormState = {
  error?: string;
};

const MAX_DOCUMENTS = 5;

export async function submitValidationAction(
  _prevState: ValidationFormState,
  formData: FormData
): Promise<ValidationFormState> {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  if (person.validatedAt) {
    return { error: "Sua conta já está validada." };
  }

  const open = await prisma.personValidationRequest.findFirst({
    where: { personId: person.id, status: "PENDING" },
  });
  if (open) {
    return { error: "Você já tem uma solicitação pendente em análise." };
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
    .max(1000, "A mensagem pode ter no máximo 1000 caracteres.")
    .optional()
    .parse(formData.get("note")?.toString());

  const files = formData
    .getAll("documents")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length === 0) {
    return { error: "Envie pelo menos um documento." };
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

  const request = await prisma.personValidationRequest.create({
    data: {
      personId: person.id,
      note: note || null,
      documentConsentAt: new Date(),
      documents: { create: documents },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: person.id,
      action: "person_validation.submitted",
      targetType: "PersonValidationRequest",
      targetId: request.id,
    },
  });

  // Avisa os administradores de que há uma nova solicitação na fila.
  const admins = await prisma.person.findMany({
    where: { role: "ADMIN", isActive: true },
    select: { id: true },
  });
  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        personId: admin.id,
        title: "Nova solicitação de validação",
        body: `${formatPersonName(person.name)} enviou uma solicitação de Validação de Pessoa.`,
        href: "/admin/validacoes",
      })),
    });
  }

  revalidatePath("/validacao");
  redirect("/validacao");
}

const decisionSchema = z.object({
  requestId: z.string().min(1),
  reason: z.string().trim().max(1000).optional(),
});

async function decideValidation(
  formData: FormData,
  decision: "APPROVED" | "REJECTED"
): Promise<ValidationFormState> {
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

  // Decisões negativas exigem motivo (regra de domínio).
  if (decision === "REJECTED" && !reason) {
    return { error: "Informe o motivo da rejeição." };
  }

  const request = await prisma.personValidationRequest.findUnique({
    where: { id: requestId },
    include: { person: true },
  });
  if (!request || request.status !== "PENDING") {
    return { error: "Solicitação não encontrada ou já decidida." };
  }

  const decidedAt = new Date();

  await prisma.$transaction([
    prisma.personValidationRequest.update({
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
          prisma.person.update({
            where: { id: request.personId },
            data: { validatedAt: decidedAt },
          }),
        ]
      : []),
    prisma.notification.create({
      data: {
        personId: request.personId,
        title:
          decision === "APPROVED"
            ? "Validação aprovada 🎉"
            : "Validação rejeitada",
        body:
          decision === "APPROVED"
            ? "Sua Validação de Pessoa foi aprovada. Agora você pode criar campanhas em seu próprio nome."
            : `Sua Validação de Pessoa foi rejeitada e você pode corrigir e reenviar. Motivo: ${reason}`,
        href: "/validacao",
      },
    }),
    prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action:
          decision === "APPROVED"
            ? "person_validation.approved"
            : "person_validation.rejected",
        targetType: "PersonValidationRequest",
        targetId: request.id,
        reason: reason || null,
      },
    }),
  ]);

  revalidatePath("/admin/validacoes");
  redirect("/admin/validacoes");
}

export async function approveValidationAction(
  _prevState: ValidationFormState,
  formData: FormData
): Promise<ValidationFormState> {
  return decideValidation(formData, "APPROVED");
}

export async function rejectValidationAction(
  _prevState: ValidationFormState,
  formData: FormData
): Promise<ValidationFormState> {
  return decideValidation(formData, "REJECTED");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import { canModerate } from "@/lib/authz";
import {
  allowedImageMimeTypes,
  maxImageSizeBytes,
  savePublicImage,
} from "@/lib/public-files";

export type PostFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

const idSchema = z.string().min(1);
const MAX_IMAGES = 4;

const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Escreva o conteúdo do post.")
    .max(5000, "O post pode ter no máximo 5000 caracteres."),
  videoUrl: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z
      .url("Informe um link de vídeo válido (começando com http).")
      .max(500)
      .optional()
  ),
});

// Representante de organização validada publica um Post.
export async function createOrganizationPostAction(
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  const organizationId = formData.get("organizationId")?.toString() ?? "";
  const membership = await prisma.organizationMember.findUnique({
    where: { organizationId_personId: { organizationId, personId: person.id } },
    include: { organization: true },
  });
  if (!membership || membership.role !== "REPRESENTATIVE") {
    return { error: "Você não é representante desta organização." };
  }
  if (!membership.organization.isActive || !membership.organization.validatedAt) {
    return {
      error: "Apenas organizações validadas e ativas podem publicar posts.",
    };
  }

  const parsed = createPostSchema.safeParse({
    content: formData.get("content"),
    videoUrl: formData.get("videoUrl")?.toString(),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const files = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (files.length > MAX_IMAGES) {
    return { error: `Envie no máximo ${MAX_IMAGES} imagens.` };
  }
  for (const file of files) {
    if (!allowedImageMimeTypes.includes(file.type)) {
      return { error: `Formato de imagem não aceito (${file.name}). Use JPG, PNG ou WebP.` };
    }
    if (file.size > maxImageSizeBytes) {
      return { error: `A imagem ${file.name} excede o limite de 5 MB.` };
    }
  }

  const imageUrls: string[] = [];
  for (const file of files) {
    imageUrls.push(await savePublicImage("org-posts", file));
  }

  const post = await prisma.organizationPost.create({
    data: {
      organizationId,
      authorId: person.id,
      content: parsed.data.content,
      videoUrl: parsed.data.videoUrl ?? null,
      imageUrls,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: person.id,
      action: "organization_post.created",
      targetType: "OrganizationPost",
      targetId: post.id,
    },
  });

  revalidatePath(`/organizacoes/${organizationId}`);
  return { success: true };
}

// Representante oculta (ou reexibe) o próprio post. Posts suspensos pela
// moderação não podem ser reexibidos pelo representante.
export async function togglePostHiddenAction(
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  const postId = idSchema.parse(formData.get("postId"));
  const post = await prisma.organizationPost.findUnique({ where: { id: postId } });
  if (!post) return { error: "Post não encontrado." };

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_personId: {
        organizationId: post.organizationId,
        personId: person.id,
      },
    },
  });
  if (!membership || membership.role !== "REPRESENTATIVE") {
    return { error: "Você não é representante desta organização." };
  }
  if (post.status === "SUSPENDED") {
    return { error: "Posts suspensos pela moderação não podem ser alterados." };
  }

  const newStatus = post.status === "PUBLISHED" ? "HIDDEN" : "PUBLISHED";
  await prisma.organizationPost.update({
    where: { id: post.id },
    data: { status: newStatus },
  });

  revalidatePath(`/organizacoes/${post.organizationId}`);
  return { success: true };
}

const reasonSchema = z
  .string()
  .trim()
  .min(5, "Informe o motivo (mínimo de 5 caracteres).")
  .max(1000, "O motivo pode ter no máximo 1000 caracteres.");

// Moderação suspende um post (sai do ar), com motivo.
export async function suspendPostAction(
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");
  if (!canModerate(person)) redirect("/painel");

  const postId = idSchema.parse(formData.get("postId"));
  const parsedReason = reasonSchema.safeParse(formData.get("reason"));
  if (!parsedReason.success) {
    return { error: parsedReason.error.issues[0].message };
  }
  const reason = parsedReason.data;

  const post = await prisma.organizationPost.findUnique({ where: { id: postId } });
  if (!post || post.status === "SUSPENDED") {
    return { error: "Post não encontrado ou já suspenso." };
  }

  const representatives = await prisma.organizationMember.findMany({
    where: { organizationId: post.organizationId, role: "REPRESENTATIVE" },
    select: { personId: true },
  });

  await prisma.$transaction([
    prisma.organizationPost.update({
      where: { id: post.id },
      data: { status: "SUSPENDED", statusReason: reason },
    }),
    prisma.auditLog.create({
      data: {
        actorId: person.id,
        action: "organization_post.suspended",
        targetType: "OrganizationPost",
        targetId: post.id,
        reason,
      },
    }),
    prisma.notification.createMany({
      data: representatives.map((rep) => ({
        personId: rep.personId,
        title: "Post suspenso pela moderação",
        body: `Um post da organização foi suspenso. Motivo: ${reason}`,
        href: `/organizacoes/${post.organizationId}`,
      })),
    }),
  ]);

  revalidatePath(`/organizacoes/${post.organizationId}`);
  return { success: true };
}

// Doador reage (ou desfaz a reação) a um post publicado. No máximo uma por
// doador por post.
export async function togglePostReactionAction(
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  const postId = idSchema.parse(formData.get("postId"));
  const post = await prisma.organizationPost.findUnique({ where: { id: postId } });
  if (!post || post.status !== "PUBLISHED") {
    return { error: "Só é possível reagir a posts publicados." };
  }

  const existing = await prisma.postReaction.findUnique({
    where: { postId_donorId: { postId, donorId: person.id } },
  });
  if (existing) {
    await prisma.postReaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.postReaction.create({
      data: { postId, donorId: person.id },
    });
  }

  revalidatePath(`/organizacoes/${post.organizationId}`);
  return { success: true };
}

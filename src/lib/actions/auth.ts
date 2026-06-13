"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/session";

export type AuthFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Informe seu nome completo."),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Informe um e-mail válido."),
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres."),
    confirmPassword: z.string(),
    acceptTerms: z.literal("on", {
      error: "Você precisa aceitar os termos de uso e a política de privacidade.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
});

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptTerms: formData.get("acceptTerms"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.person.findUnique({ where: { email } });
  if (existing) {
    return { fieldErrors: { email: ["Já existe uma conta com este e-mail."] } };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const person = await prisma.person.create({
    data: {
      name,
      email,
      passwordHash,
      termsAcceptedAt: new Date(),
    },
  });

  await createSession(person.id);
  redirect("/painel");
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { email, password } = parsed.data;

  const person = await prisma.person.findUnique({ where: { email } });
  const passwordOk =
    person !== null && (await bcrypt.compare(password, person.passwordHash));

  if (!passwordOk) {
    return { error: "E-mail ou senha inválidos." };
  }

  if (!person.isActive) {
    return { error: "Esta conta está desativada e não pode acessar a plataforma." };
  }

  await createSession(person.id);
  redirect("/painel");
}

export async function logoutAction() {
  await destroySession();
  redirect("/entrar");
}

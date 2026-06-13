"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type AuthFormState } from "@/lib/actions/auth";
import {
  FieldErrors,
  formCardClassName,
  inputClassName,
  labelClassName,
  primaryButtonClassName,
} from "@/components/form-field";

const initialState: AuthFormState = {};

export function CadastroForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className={`flex flex-col gap-5 ${formCardClassName}`}
      noValidate
    >
      <div>
        <label htmlFor="name" className={labelClassName}>
          Nome completo
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Maria da Silva"
          required
          className={inputClassName}
        />
        <FieldErrors errors={state.fieldErrors?.name} />
      </div>

      <div>
        <label htmlFor="email" className={labelClassName}>
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          required
          className={inputClassName}
        />
        <FieldErrors errors={state.fieldErrors?.email} />
      </div>

      <div>
        <label htmlFor="password" className={labelClassName}>
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          required
          className={inputClassName}
        />
        <FieldErrors errors={state.fieldErrors?.password} />
      </div>

      <div>
        <label htmlFor="confirmPassword" className={labelClassName}>
          Confirmar senha
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repita a senha"
          required
          className={inputClassName}
        />
        <FieldErrors errors={state.fieldErrors?.confirmPassword} />
      </div>

      <div>
        <label className="flex items-start gap-3 rounded-xl bg-brand-50 p-4 text-sm text-stone-700">
          <input
            type="checkbox"
            name="acceptTerms"
            className="mt-0.5 size-4 accent-brand-600"
            required
          />
          <span>
            Li e aceito os{" "}
            <Link
              href="/termos"
              className="font-semibold text-brand-700 underline"
              target="_blank"
            >
              termos de uso
            </Link>{" "}
            e a{" "}
            <Link
              href="/privacidade"
              className="font-semibold text-brand-700 underline"
              target="_blank"
            >
              política de privacidade
            </Link>
            .
          </span>
        </label>
        <FieldErrors errors={state.fieldErrors?.acceptTerms} />
      </div>

      {state.error && (
        <p className="text-sm font-medium text-coral-500" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={primaryButtonClassName}>
        {pending ? "Criando conta..." : "Criar conta"}
      </button>

      <p className="text-center text-sm text-stone-600">
        Já tem uma conta?{" "}
        <Link href="/entrar" className="font-semibold text-brand-700 underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}

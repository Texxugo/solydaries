"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthFormState } from "@/lib/actions/auth";
import {
  FieldErrors,
  formCardClassName,
  inputClassName,
  labelClassName,
  primaryButtonClassName,
} from "@/components/form-field";

const initialState: AuthFormState = {};

export function EntrarForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className={`flex flex-col gap-5 ${formCardClassName}`}
      noValidate
    >
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
          autoComplete="current-password"
          placeholder="Sua senha"
          required
          className={inputClassName}
        />
        <FieldErrors errors={state.fieldErrors?.password} />
      </div>

      {state.error && (
        <p className="text-sm font-medium text-coral-500" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={primaryButtonClassName}>
        {pending ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-center text-sm text-stone-600">
        Ainda não tem conta?{" "}
        <Link
          href="/cadastro"
          className="font-semibold text-brand-700 underline"
        >
          Criar conta
        </Link>
      </p>
    </form>
  );
}

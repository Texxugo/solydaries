"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  updateOrganizationProfileAction,
  type OrganizationFormState,
} from "@/lib/actions/organization";
import {
  FieldErrors,
  formCardClassName,
  inputClassName,
  labelClassName,
  primaryButtonClassName,
} from "@/components/form-field";

const initialState: OrganizationFormState = {};

export function EditarOrganizacaoForm({
  organizationId,
  defaults,
}: {
  organizationId: string;
  defaults: {
    description: string;
    publicEmail: string;
    phone: string;
    website: string;
    logoUrl: string;
    coverUrl: string;
  };
}) {
  const [state, formAction, pending] = useActionState(
    updateOrganizationProfileAction,
    initialState
  );

  return (
    <form action={formAction} className={`flex flex-col gap-5 ${formCardClassName}`} noValidate>
      <input type="hidden" name="organizationId" value={organizationId} />

      <div>
        <label htmlFor="logo" className={labelClassName}>
          Logo / avatar (opcional)
        </label>
        <input
          id="logo"
          name="logo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
        />
        <p className="mt-1 text-xs text-stone-400">
          {defaults.logoUrl ? "Já existe um logo. Envie um novo para substituir." : "JPG, PNG ou WebP, até 5 MB."}
        </p>
      </div>

      <div>
        <label htmlFor="cover" className={labelClassName}>
          Imagem de capa (opcional)
        </label>
        <input
          id="cover"
          name="cover"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
        />
        <p className="mt-1 text-xs text-stone-400">
          {defaults.coverUrl ? "Já existe uma capa. Envie uma nova para substituir." : "JPG, PNG ou WebP, até 5 MB."}
        </p>
      </div>

      <div>
        <label htmlFor="description" className={labelClassName}>
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={2000}
          defaultValue={defaults.description}
          placeholder="O que a organização faz, onde atua..."
          className={inputClassName}
        />
        <FieldErrors errors={state.fieldErrors?.description} />
      </div>

      <div>
        <label htmlFor="publicEmail" className={labelClassName}>
          E-mail de contato público (opcional)
        </label>
        <input
          id="publicEmail"
          name="publicEmail"
          type="email"
          defaultValue={defaults.publicEmail}
          placeholder="contato@organizacao.org"
          className={inputClassName}
        />
        <FieldErrors errors={state.fieldErrors?.publicEmail} />
      </div>

      <div>
        <label htmlFor="phone" className={labelClassName}>
          Telefone público (opcional)
        </label>
        <input
          id="phone"
          name="phone"
          type="text"
          defaultValue={defaults.phone}
          placeholder="(11) 99999-0000"
          className={inputClassName}
        />
        <FieldErrors errors={state.fieldErrors?.phone} />
      </div>

      <div>
        <label htmlFor="website" className={labelClassName}>
          Site (opcional)
        </label>
        <input
          id="website"
          name="website"
          type="text"
          defaultValue={defaults.website}
          placeholder="https://organizacao.org"
          className={inputClassName}
        />
        <FieldErrors errors={state.fieldErrors?.website} />
      </div>

      {state.error && (
        <p className="text-sm font-medium text-coral-500" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={primaryButtonClassName}>
          {pending ? "Salvando..." : "Salvar perfil"}
        </button>
        <Link
          href={`/organizacoes/${organizationId}`}
          className="text-sm font-semibold text-stone-500 hover:text-stone-700"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

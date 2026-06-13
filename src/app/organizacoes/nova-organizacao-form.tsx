"use client";

import { useActionState } from "react";
import {
  createOrganizationAction,
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

export function NovaOrganizacaoForm() {
  const [state, formAction, pending] = useActionState(
    createOrganizationAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className={`flex flex-col gap-5 ${formCardClassName}`}
      noValidate
    >
      <h2 className="font-display text-lg font-bold text-stone-900">
        Criar organização
      </h2>
      <p className="-mt-3 text-sm text-stone-500">
        Você será o(a) representante inicial. A organização só aparece
        publicamente depois de validada.
      </p>

      <div>
        <label htmlFor="name" className={labelClassName}>
          Nome da organização
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Ex.: Instituto Mãos que Ajudam"
          className={inputClassName}
        />
        <FieldErrors errors={state.fieldErrors?.name} />
      </div>

      <div>
        <label htmlFor="description" className={labelClassName}>
          Descrição (opcional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={2000}
          placeholder="O que a organização faz, onde atua..."
          className={inputClassName}
        />
        <FieldErrors errors={state.fieldErrors?.description} />
      </div>

      {state.error && (
        <p className="text-sm font-medium text-coral-500" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={primaryButtonClassName}>
        {pending ? "Criando..." : "Criar organização"}
      </button>
    </form>
  );
}

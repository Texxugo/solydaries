"use client";

import { useActionState } from "react";
import {
  submitOrgValidationAction,
  type OrganizationFormState,
} from "@/lib/actions/organization";
import {
  formCardClassName,
  inputClassName,
  labelClassName,
  primaryButtonClassName,
} from "@/components/form-field";

const initialState: OrganizationFormState = {};

export function OrgValidacaoForm({
  organizationId,
  isResubmission,
}: {
  organizationId: string;
  isResubmission: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    submitOrgValidationAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className={`flex flex-col gap-5 ${formCardClassName}`}
    >
      <input type="hidden" name="organizationId" value={organizationId} />
      <h2 className="font-display text-lg font-bold text-stone-900">
        {isResubmission
          ? "Reenviar validação da organização"
          : "Solicitar validação da organização"}
      </h2>
      <p className="-mt-3 text-sm text-stone-500">
        Envie a documentação institucional (estatuto, CNPJ, ata, comprovantes).
        Grupos sem documentação institucional aceitável não podem atuar como
        organização.
      </p>

      <div>
        <label htmlFor="documents" className={labelClassName}>
          Documentos institucionais
        </label>
        <input
          id="documents"
          name="documents"
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          required
          className="w-full cursor-pointer rounded-xl border-2 border-dashed border-stone-200 px-4 py-6 text-sm text-stone-500 transition file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:border-brand-300"
        />
        <p className="mt-1.5 text-xs text-stone-400">
          Até 5 arquivos (PDF, JPG, PNG ou WebP), máximo de 10 MB cada.
        </p>
      </div>

      <div>
        <label htmlFor="note" className={labelClassName}>
          Mensagem (opcional)
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          maxLength={1000}
          placeholder={
            isResubmission
              ? "Descreva o que foi corrigido em relação à solicitação anterior."
              : "Alguma informação adicional para a análise?"
          }
          className={inputClassName}
        />
      </div>

      <label className="flex items-start gap-3 rounded-xl bg-brand-50 p-4 text-sm text-stone-700">
        <input
          type="checkbox"
          name="documentConsent"
          className="mt-0.5 size-4 accent-brand-600"
          required
        />
        <span>
          Declaro ter autorização da organização para enviar estes documentos e
          consinto com sua análise pelos administradores da Solydaries,
          exclusivamente para fins de validação. Os documentos não ficam
          visíveis publicamente.
        </span>
      </label>

      {state.error && (
        <p className="text-sm font-medium text-coral-500" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={primaryButtonClassName}>
        {pending ? "Enviando..." : "Enviar para análise"}
      </button>
    </form>
  );
}

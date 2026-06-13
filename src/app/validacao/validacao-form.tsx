"use client";

import { useActionState } from "react";
import {
  submitValidationAction,
  type ValidationFormState,
} from "@/lib/actions/validation";
import {
  formCardClassName,
  inputClassName,
  labelClassName,
  primaryButtonClassName,
} from "@/components/form-field";

const initialState: ValidationFormState = {};

export function ValidacaoForm({
  isResubmission,
}: {
  isResubmission: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    submitValidationAction,
    initialState
  );

  return (
    <form action={formAction} className={`flex flex-col gap-5 ${formCardClassName}`}>
      <h2 className="font-display text-lg font-bold text-stone-900">
        {isResubmission ? "Reenviar solicitação" : "Nova solicitação"}
      </h2>

      <div>
        <label htmlFor="documents" className={labelClassName}>
          Documentos de validação
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
          Até 5 arquivos (PDF, JPG, PNG ou WebP), máximo de 10 MB cada. Ex.:
          documento de identidade, comprovante de residência.
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
          Consinto com o envio destes documentos e autorizo sua análise pelos
          administradores da Solydaries, exclusivamente para fins de validação
          da minha conta. Os documentos não ficam visíveis publicamente.
        </span>
      </label>

      {state.error && (
        <p className="text-sm font-medium text-coral-500" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={primaryButtonClassName}>
        {pending ? "Enviando..." : "Enviar solicitação"}
      </button>
    </form>
  );
}

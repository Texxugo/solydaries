"use client";

import { useActionState, useState } from "react";
import type { ReportFormState } from "@/lib/actions/report";
import { inputClassName } from "@/components/form-field";

type ReportAction = (
  prevState: ReportFormState,
  formData: FormData
) => Promise<ReportFormState>;

const initialState: ReportFormState = {};

// Botão "Denunciar" reutilizável: abre um campo de motivo e envia para a action
// indicada (campanha, post ou oferta). O id do alvo vai no campo idName.
export function Denunciar({
  action,
  idName,
  idValue,
  label = "Denunciar",
}: {
  action: ReportAction;
  idName: string;
  idValue: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, initialState);

  if (state.success) {
    return (
      <p className="text-sm font-medium text-brand-700">
        Denúncia enviada. A moderação vai analisar. Obrigado.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-semibold text-stone-400 underline transition hover:text-rose-600"
      >
        {label}
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-2 w-full">
      <input type="hidden" name={idName} value={idValue} />
      <textarea
        name="reason"
        rows={3}
        maxLength={1000}
        required
        placeholder="Descreva o problema (spam, conteúdo irregular, abuso...)."
        className={inputClassName}
      />
      <div className="mt-2 flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Enviando..." : "Enviar denúncia"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold text-stone-500 hover:bg-stone-100"
        >
          Cancelar
        </button>
      </div>
      {state.error && (
        <p className="mt-2 text-sm font-medium text-coral-500" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}

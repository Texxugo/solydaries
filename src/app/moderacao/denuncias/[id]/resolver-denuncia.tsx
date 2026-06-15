"use client";

import { useActionState, useState } from "react";
import {
  resolveReportAction,
  type ReportFormState,
} from "@/lib/actions/report";
import { inputClassName, labelClassName } from "@/components/form-field";

const initialState: ReportFormState = {};

export function ResolverDenuncia({
  reportId,
  upholdLabel,
}: {
  reportId: string;
  upholdLabel: string;
}) {
  const [mode, setMode] = useState<"uphold" | "dismiss">("uphold");
  const [state, formAction, pending] = useActionState(
    resolveReportAction,
    initialState
  );

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl shadow-stone-200/60 ring-1 ring-stone-100">
      <h2 className="mb-4 font-display text-lg font-bold text-stone-900">
        Resolver denúncia
      </h2>

      <div className="mb-5 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("uphold")}
          className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${
            mode === "uphold"
              ? "bg-rose-600 text-white"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          Acatar
        </button>
        <button
          type="button"
          onClick={() => setMode("dismiss")}
          className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${
            mode === "dismiss"
              ? "bg-brand-600 text-white"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          Improcedente
        </button>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="reportId" value={reportId} />
        <input type="hidden" name="outcome" value={mode} />
        <div>
          <label htmlFor="reason" className={labelClassName}>
            Motivo da decisão (obrigatório)
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={3}
            maxLength={1000}
            required
            placeholder={
              mode === "uphold"
                ? "Ex.: conteúdo viola as regras da plataforma..."
                : "Ex.: denúncia sem fundamento, conteúdo está adequado..."
            }
            className={inputClassName}
          />
          <p className="mt-1.5 text-xs text-stone-400">
            {mode === "uphold"
              ? upholdLabel
              : "A denúncia é arquivada e o conteúdo permanece. O denunciante é notificado."}
          </p>
        </div>
        <button
          type="submit"
          disabled={pending}
          className={`cursor-pointer rounded-xl px-4 py-3 font-semibold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-50 ${
            mode === "uphold"
              ? "bg-rose-600 shadow-rose-200 hover:bg-rose-700"
              : "bg-gradient-to-r from-brand-500 to-brand-600 shadow-brand-200 hover:from-brand-600 hover:to-brand-700"
          }`}
        >
          {pending
            ? "Registrando..."
            : mode === "uphold"
              ? "Confirmar e acatar"
              : "Arquivar denúncia"}
        </button>
        {state.error && (
          <p className="text-sm font-medium text-coral-500" role="alert">
            {state.error}
          </p>
        )}
      </form>
    </div>
  );
}

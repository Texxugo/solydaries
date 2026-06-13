"use client";

import { useActionState, useState } from "react";
import {
  approveCampaignChangeAction,
  rejectCampaignChangeAction,
} from "@/lib/actions/campaign-change";
import type { CampaignFormState } from "@/lib/actions/campaign";
import { inputClassName, labelClassName } from "@/components/form-field";

const initialState: CampaignFormState = {};

export function AlteracaoDecisao({ changeId }: { changeId: string }) {
  const [mode, setMode] = useState<"approve" | "reject">("approve");
  const [approveState, approveAction, approving] = useActionState(
    approveCampaignChangeAction,
    initialState
  );
  const [rejectState, rejectAction, rejecting] = useActionState(
    rejectCampaignChangeAction,
    initialState
  );

  const pending = approving || rejecting;
  const error = approveState.error ?? rejectState.error;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl shadow-stone-200/60 ring-1 ring-stone-100">
      <h2 className="mb-4 font-display text-lg font-bold text-stone-900">
        Decisão sobre a alteração
      </h2>

      <div className="mb-5 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("approve")}
          className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${
            mode === "approve"
              ? "bg-brand-600 text-white"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          Aprovar
        </button>
        <button
          type="button"
          onClick={() => setMode("reject")}
          className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${
            mode === "reject"
              ? "bg-rose-600 text-white"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          Rejeitar
        </button>
      </div>

      {mode === "approve" ? (
        <form action={approveAction} className="flex flex-col gap-4">
          <input type="hidden" name="changeId" value={changeId} />
          <p className="text-sm text-stone-600">
            Os valores propostos passam a valer na campanha publicada e os
            responsáveis serão notificados.
          </p>
          <button
            type="submit"
            disabled={pending}
            className="cursor-pointer rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3 font-semibold text-white shadow-md shadow-brand-200 transition hover:from-brand-600 hover:to-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {approving ? "Aplicando..." : "Confirmar aprovação"}
          </button>
        </form>
      ) : (
        <form action={rejectAction} className="flex flex-col gap-4">
          <input type="hidden" name="changeId" value={changeId} />
          <div>
            <label htmlFor="reason" className={labelClassName}>
              Motivo da rejeição (obrigatório)
            </label>
            <textarea
              id="reason"
              name="reason"
              rows={3}
              maxLength={1000}
              required
              placeholder="Ex.: a nova descrição muda o propósito da campanha..."
              className={inputClassName}
            />
            <p className="mt-1.5 text-xs text-stone-400">
              A versão pública permanece como está; o motivo é enviado aos
              responsáveis.
            </p>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="cursor-pointer rounded-xl bg-rose-600 px-4 py-3 font-semibold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {rejecting ? "Rejeitando..." : "Confirmar rejeição"}
          </button>
        </form>
      )}

      {error && (
        <p className="mt-4 text-sm font-medium text-coral-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

"use client";

import { useActionState, useState } from "react";
import {
  approveValidationAction,
  rejectValidationAction,
  type ValidationFormState,
} from "@/lib/actions/validation";
import { inputClassName, labelClassName } from "@/components/form-field";

const initialState: ValidationFormState = {};

export function DecisaoForm({ requestId }: { requestId: string }) {
  const [mode, setMode] = useState<"approve" | "reject">("approve");
  const [approveState, approveAction, approving] = useActionState(
    approveValidationAction,
    initialState
  );
  const [rejectState, rejectAction, rejecting] = useActionState(
    rejectValidationAction,
    initialState
  );

  const pending = approving || rejecting;
  const error = approveState.error ?? rejectState.error;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl shadow-stone-200/60 ring-1 ring-stone-100">
      <h2 className="mb-4 font-display text-lg font-bold text-stone-900">
        Decisão
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
          <input type="hidden" name="requestId" value={requestId} />
          <p className="text-sm text-stone-600">
            A pessoa passará a poder criar campanhas em seu próprio nome e
            receberá uma notificação.
          </p>
          <button
            type="submit"
            disabled={pending}
            className="cursor-pointer rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3 font-semibold text-white shadow-md shadow-brand-200 transition hover:from-brand-600 hover:to-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {approving ? "Aprovando..." : "Confirmar aprovação"}
          </button>
        </form>
      ) : (
        <form action={rejectAction} className="flex flex-col gap-4">
          <input type="hidden" name="requestId" value={requestId} />
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
              placeholder="Ex.: documento ilegível, dados não conferem..."
              className={inputClassName}
            />
            <p className="mt-1.5 text-xs text-stone-400">
              O motivo é enviado à pessoa, que poderá corrigir e reenviar.
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

"use client";

import { useActionState, useState } from "react";
import {
  confirmSupportOfferAction,
  declineSupportOfferAction,
  type SupportOfferFormState,
} from "@/lib/actions/support-offer";
import { inputClassName, labelClassName } from "@/components/form-field";

const initialState: SupportOfferFormState = {};

function ErrorText({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="mt-2 text-sm font-medium text-coral-500" role="alert">
      {error}
    </p>
  );
}

// Confirmar e recusar (com motivo) uma oferta pendente, pela gestão.
export function DecisaoApoio({ offerId }: { offerId: string }) {
  const [mode, setMode] = useState<"idle" | "decline">("idle");
  const [confirmState, confirmAction, confirming] = useActionState(
    confirmSupportOfferAction,
    initialState
  );
  const [declineState, declineAction, declining] = useActionState(
    declineSupportOfferAction,
    initialState
  );

  if (mode === "decline") {
    return (
      <form action={declineAction} className="mt-3">
        <input type="hidden" name="offerId" value={offerId} />
        <label htmlFor={`reason-${offerId}`} className={labelClassName}>
          Motivo da recusa (obrigatório)
        </label>
        <textarea
          id={`reason-${offerId}`}
          name="reason"
          rows={2}
          maxLength={1000}
          required
          placeholder="Ex.: item já arrecadado, fora do que a campanha precisa..."
          className={inputClassName}
        />
        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            disabled={declining}
            className="cursor-pointer rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {declining ? "Recusando..." : "Confirmar recusa"}
          </button>
          <button
            type="button"
            onClick={() => setMode("idle")}
            className="cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold text-stone-500 hover:bg-stone-100"
          >
            Voltar
          </button>
        </div>
        <ErrorText error={declineState.error} />
      </form>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        <form action={confirmAction}>
          <input type="hidden" name="offerId" value={offerId} />
          <button
            type="submit"
            disabled={confirming}
            className="cursor-pointer rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-200 transition hover:from-brand-600 hover:to-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {confirming ? "Confirmando..." : "Confirmar apoio"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setMode("decline")}
          className="cursor-pointer rounded-xl border-2 border-stone-200 px-4 py-2 text-sm font-semibold text-stone-600 transition hover:border-rose-300 hover:text-rose-600"
        >
          Recusar
        </button>
      </div>
      <ErrorText error={confirmState.error} />
    </div>
  );
}

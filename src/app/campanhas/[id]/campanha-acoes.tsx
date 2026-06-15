"use client";

import { useActionState, useState } from "react";
import type { CampaignFormState } from "@/lib/actions/campaign";
import {
  approveCampaignAction,
  closeCampaignAction,
  rejectCampaignAction,
  submitCampaignForReviewAction,
  suspendCampaignAction,
} from "@/lib/actions/campaign-review";
import { inputClassName, labelClassName } from "@/components/form-field";

const initialState: CampaignFormState = {};

function ErrorText({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="mt-3 text-sm font-medium text-coral-500" role="alert">
      {error}
    </p>
  );
}

// Envio para revisão (dono/representante, rascunho ou rejeitada).
export function EnviarParaRevisao({
  campaignId,
  isResubmission,
}: {
  campaignId: string;
  isResubmission: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    submitCampaignForReviewAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className="rounded-2xl bg-brand-50 p-5 ring-1 ring-brand-200"
    >
      <input type="hidden" name="campaignId" value={campaignId} />
      <p className="mb-3 text-sm text-brand-800">
        {isResubmission
          ? "Corrigiu o que foi apontado? Reenvie a campanha para nova revisão."
          : "Quando estiver pronta, envie a campanha para a revisão da moderação. Ela só vai ao ar depois de aprovada."}
      </p>
      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-200 transition hover:from-brand-600 hover:to-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending
          ? "Enviando..."
          : isResubmission
            ? "Reenviar para revisão"
            : "Enviar para revisão"}
      </button>
      <ErrorText error={state.error} />
    </form>
  );
}

// Decisão da moderação sobre campanha pendente.
export function DecisaoRevisao({ campaignId }: { campaignId: string }) {
  const [mode, setMode] = useState<"approve" | "reject">("approve");
  const [approveState, approveAction, approving] = useActionState(
    approveCampaignAction,
    initialState
  );
  const [rejectState, rejectAction, rejecting] = useActionState(
    rejectCampaignAction,
    initialState
  );

  const pending = approving || rejecting;
  const error = approveState.error ?? rejectState.error;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl shadow-stone-200/60 ring-1 ring-stone-100">
      <h2 className="mb-4 font-display text-lg font-bold text-stone-900">
        Revisão da moderação
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
          Aprovar e publicar
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
          <input type="hidden" name="campaignId" value={campaignId} />
          <p className="text-sm text-stone-600">
            A campanha ficará pública e os responsáveis serão notificados.
          </p>
          <button
            type="submit"
            disabled={pending}
            className="cursor-pointer rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3 font-semibold text-white shadow-md shadow-brand-200 transition hover:from-brand-600 hover:to-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {approving ? "Publicando..." : "Confirmar publicação"}
          </button>
        </form>
      ) : (
        <form action={rejectAction} className="flex flex-col gap-4">
          <input type="hidden" name="campaignId" value={campaignId} />
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
              placeholder="Ex.: descrição insuficiente, pedido fora das regras da plataforma..."
              className={inputClassName}
            />
            <p className="mt-1.5 text-xs text-stone-400">
              O motivo é enviado aos responsáveis, que podem corrigir e
              reenviar.
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

      <ErrorText error={error} />
    </div>
  );
}

// Suspensão de campanha publicada (moderação), com motivo.
export function SuspenderCampanha({ campaignId }: { campaignId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    suspendCampaignAction,
    initialState
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-xl border-2 border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
      >
        Suspender campanha (moderação)
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl border-2 border-rose-200 p-5"
    >
      <input type="hidden" name="campaignId" value={campaignId} />
      <label htmlFor="suspend-reason" className={labelClassName}>
        Motivo da suspensão (obrigatório)
      </label>
      <textarea
        id="suspend-reason"
        name="reason"
        rows={3}
        maxLength={1000}
        required
        placeholder="Ex.: denúncia procedente, conteúdo irregular..."
        className={inputClassName}
      />
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Suspendendo..." : "Confirmar suspensão"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-stone-500 hover:bg-stone-100"
        >
          Cancelar
        </button>
      </div>
      <ErrorText error={state.error} />
    </form>
  );
}

// Encerramento manual pelos responsáveis.
export function EncerrarCampanha({ campaignId }: { campaignId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, pending] = useActionState(
    closeCampaignAction,
    initialState
  );

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:bg-sky-700"
      >
        Encerrar campanha
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl border-2 border-sky-200 p-5"
    >
      <input type="hidden" name="campaignId" value={campaignId} />
      <p className="mb-3 text-sm text-stone-600">
        Encerrar a campanha a tira do ar para novos apoios. Essa ação não pode
        ser desfeita pela plataforma. Confirmar?
      </p>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Encerrando..." : "Sim, encerrar"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-stone-500 hover:bg-stone-100"
        >
          Cancelar
        </button>
      </div>
      <ErrorText error={state.error} />
    </form>
  );
}

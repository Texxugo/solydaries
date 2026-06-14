"use client";

import { useActionState, useState } from "react";
import {
  cancelSupportOfferAction,
  createSupportOfferAction,
  type SupportOfferFormState,
} from "@/lib/actions/support-offer";
import { supportOfferTypeLabels } from "@/lib/support-offer-labels";
import { FieldErrors, inputClassName, labelClassName } from "@/components/form-field";

const initialState: SupportOfferFormState = {};

type OfferType = "ITEM_DONATION" | "VOLUNTEER";

function ErrorText({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="mt-3 text-sm font-medium text-coral-500" role="alert">
      {error}
    </p>
  );
}

// Formulário de Oferta de Apoio. Só mostra os tipos que a campanha aceita.
export function FormularioApoio({
  campaignId,
  acceptedTypes,
}: {
  campaignId: string;
  acceptedTypes: OfferType[];
}) {
  const [state, formAction, pending] = useActionState(
    createSupportOfferAction,
    initialState
  );
  const [type, setType] = useState<OfferType>(acceptedTypes[0]);

  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      className="rounded-3xl bg-white p-6 shadow-xl shadow-stone-200/60 ring-1 ring-stone-100"
    >
      <input type="hidden" name="campaignId" value={campaignId} />
      <h2 className="mb-1 font-display text-lg font-bold text-stone-900">
        Oferecer apoio
      </h2>
      <p className="mb-5 text-sm text-stone-500">
        Sua oferta vai direto para a equipe da campanha, que entra em contato
        para combinar os detalhes. Os dados abaixo não aparecem publicamente.
      </p>

      {acceptedTypes.length > 1 && (
        <div className="mb-5 flex gap-2">
          {acceptedTypes.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setType(option)}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${
                type === option
                  ? "bg-brand-600 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {supportOfferTypeLabels[option]}
            </button>
          ))}
        </div>
      )}
      <input type="hidden" name="type" value={type} />

      <div className="flex flex-col gap-4">
        {type === "ITEM_DONATION" ? (
          <>
            <div>
              <label htmlFor="itemName" className={labelClassName}>
                Item a doar
              </label>
              <input
                id="itemName"
                name="itemName"
                type="text"
                placeholder="Ex.: cestas básicas, agasalhos infantis..."
                className={inputClassName}
              />
              <FieldErrors errors={fieldErrors.itemName} />
            </div>
            <div>
              <label htmlFor="itemQuantity" className={labelClassName}>
                Quantidade
              </label>
              <input
                id="itemQuantity"
                name="itemQuantity"
                type="text"
                placeholder="Ex.: 5 unidades, 10 kg..."
                className={inputClassName}
              />
              <FieldErrors errors={fieldErrors.itemQuantity} />
            </div>
            <div>
              <label htmlFor="itemCondition" className={labelClassName}>
                Condição{" "}
                <span className="font-normal text-stone-400">(opcional)</span>
              </label>
              <input
                id="itemCondition"
                name="itemCondition"
                type="text"
                placeholder="Ex.: novos, usados em bom estado..."
                className={inputClassName}
              />
              <FieldErrors errors={fieldErrors.itemCondition} />
            </div>
            <div>
              <label htmlFor="coordinationPreference" className={labelClassName}>
                Preferência de coordenação{" "}
                <span className="font-normal text-stone-400">(opcional)</span>
              </label>
              <input
                id="coordinationPreference"
                name="coordinationPreference"
                type="text"
                placeholder="Ex.: posso entregar, prefiro que retirem..."
                className={inputClassName}
              />
              <FieldErrors errors={fieldErrors.coordinationPreference} />
            </div>
          </>
        ) : (
          <>
            <div>
              <label htmlFor="availability" className={labelClassName}>
                Disponibilidade
              </label>
              <input
                id="availability"
                name="availability"
                type="text"
                placeholder="Ex.: fins de semana, tardes durante a semana..."
                className={inputClassName}
              />
              <FieldErrors errors={fieldErrors.availability} />
            </div>
            <div>
              <label htmlFor="helpType" className={labelClassName}>
                Tipo de ajuda
              </label>
              <input
                id="helpType"
                name="helpType"
                type="text"
                placeholder="Ex.: transporte, organização de doações..."
                className={inputClassName}
              />
              <FieldErrors errors={fieldErrors.helpType} />
            </div>
            <div>
              <label htmlFor="note" className={labelClassName}>
                Observação{" "}
                <span className="font-normal text-stone-400">(opcional)</span>
              </label>
              <textarea
                id="note"
                name="note"
                rows={3}
                placeholder="Algo que a equipe deva saber sobre sua ajuda."
                className={inputClassName}
              />
              <FieldErrors errors={fieldErrors.note} />
            </div>
          </>
        )}

        <div>
          <label htmlFor="contact" className={labelClassName}>
            Contato para coordenação
          </label>
          <input
            id="contact"
            name="contact"
            type="text"
            placeholder="Telefone ou e-mail"
            className={inputClassName}
          />
          <p className="mt-1.5 text-xs text-stone-400">
            Visível apenas para a equipe da campanha, nunca em páginas públicas.
          </p>
          <FieldErrors errors={fieldErrors.contact} />
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-stone-50 p-4 text-sm text-stone-600 ring-1 ring-stone-100">
          <input
            type="checkbox"
            name="publiclyAnonymous"
            className="mt-0.5 size-4 accent-brand-600"
          />
          <span>
            Manter meu apoio <strong>anônimo publicamente</strong>. A equipe da
            campanha ainda verá seus dados para coordenar.
          </span>
        </label>

        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3 font-semibold text-white shadow-md shadow-brand-200 transition hover:from-brand-600 hover:to-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Enviando..." : "Registrar oferta de apoio"}
        </button>
      </div>

      <ErrorText error={state.error} />
    </form>
  );
}

// Botão de cancelamento da própria oferta pendente.
export function CancelarApoio({ offerId }: { offerId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, pending] = useActionState(
    cancelSupportOfferAction,
    initialState
  );

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="cursor-pointer rounded-xl border-2 border-stone-200 px-4 py-2 text-sm font-semibold text-stone-600 transition hover:border-rose-300 hover:text-rose-600"
      >
        Cancelar minha oferta
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="offerId" value={offerId} />
      <span className="text-sm text-stone-600">Cancelar esta oferta?</span>
      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Cancelando..." : "Sim, cancelar"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold text-stone-500 hover:bg-stone-100"
      >
        Voltar
      </button>
      <ErrorText error={state.error} />
    </form>
  );
}

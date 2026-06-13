"use client";

import { useActionState } from "react";
import { editCampaignAction } from "@/lib/actions/campaign-change";
import type { CampaignFormState } from "@/lib/actions/campaign";
import { CampanhaCampos, type CampanhaDefaults } from "../../campanha-campos";
import {
  formCardClassName,
  primaryButtonClassName,
} from "@/components/form-field";

const initialState: CampaignFormState = {};

export function EditarCampanhaForm({
  campaignId,
  defaults,
  isPublished,
}: {
  campaignId: string;
  defaults: CampanhaDefaults;
  isPublished: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    editCampaignAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className={`flex flex-col gap-5 ${formCardClassName}`}
      noValidate
    >
      <input type="hidden" name="campaignId" value={campaignId} />

      {isPublished && (
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200">
          Esta campanha está publicada. Alterações <strong>materiais</strong>{" "}
          (título, descrição, categoria, meta, localidade, pin ou tipos de
          apoio) passam por revisão antes de aparecer ao público; a versão
          atual continua no ar até a aprovação. Ajustes em instruções, ponto
          logístico ou prazo são aplicados na hora.
        </p>
      )}

      <CampanhaCampos state={state} defaults={defaults} />

      {state.error && (
        <p className="text-sm font-medium text-coral-500" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={primaryButtonClassName}>
        {pending ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}

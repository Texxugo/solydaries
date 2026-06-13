"use client";

import { useActionState } from "react";
import {
  createCampaignAction,
  type CampaignFormState,
} from "@/lib/actions/campaign";
import { CampanhaCampos } from "../campanha-campos";
import {
  formCardClassName,
  primaryButtonClassName,
} from "@/components/form-field";

const initialState: CampaignFormState = {};

export function NovaCampanhaForm({
  contexts,
}: {
  contexts: { value: string; label: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    createCampaignAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className={`flex flex-col gap-5 ${formCardClassName}`}
      noValidate
    >
      <CampanhaCampos state={state} contexts={contexts} />

      {state.error && (
        <p className="text-sm font-medium text-coral-500" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={primaryButtonClassName}>
        {pending ? "Criando rascunho..." : "Criar rascunho"}
      </button>
    </form>
  );
}

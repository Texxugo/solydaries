"use client";

import { useActionState, useState } from "react";
import {
  createCampaignAction,
  type CampaignFormState,
} from "@/lib/actions/campaign";
import {
  categoryLabels,
  selectableSupportTypes,
  supportTypeLabels,
} from "@/lib/campaign-labels";
import { MapPicker } from "@/components/map/map-picker";
import {
  FieldErrors,
  formCardClassName,
  inputClassName,
  labelClassName,
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
  const [deadlineMode, setDeadlineMode] = useState<"none" | "date">("none");

  return (
    <form
      action={formAction}
      className={`flex flex-col gap-5 ${formCardClassName}`}
      noValidate
    >
      <div>
        <label htmlFor="context" className={labelClassName}>
          Em nome de quem?
        </label>
        <select
          id="context"
          name="context"
          required
          className={inputClassName}
          defaultValue={contexts[0]?.value}
        >
          {contexts.map((context) => (
            <option key={context.value} value={context.value}>
              {context.label}
            </option>
          ))}
        </select>
        <FieldErrors errors={state.fieldErrors?.context} />
      </div>

      <div>
        <label htmlFor="title" className={labelClassName}>
          Título
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="Ex.: Cestas básicas para 30 famílias do Jardim Aurora"
          className={inputClassName}
        />
        <FieldErrors errors={state.fieldErrors?.title} />
      </div>

      <div>
        <label htmlFor="description" className={labelClassName}>
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          required
          placeholder="Conte a história: quem será ajudado, por que o apoio é necessário, como será usado..."
          className={inputClassName}
        />
        <FieldErrors errors={state.fieldErrors?.description} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className={labelClassName}>
            Categoria
          </label>
          <select id="category" name="category" required className={inputClassName}>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <FieldErrors errors={state.fieldErrors?.category} />
        </div>
        <div>
          <label htmlFor="locality" className={labelClassName}>
            Localidade
          </label>
          <input
            id="locality"
            name="locality"
            type="text"
            required
            placeholder="Ex.: Campinas/SP"
            className={inputClassName}
          />
          <FieldErrors errors={state.fieldErrors?.locality} />
        </div>
      </div>

      <fieldset>
        <legend className={labelClassName}>Tipos de apoio aceitos</legend>
        <div className="flex flex-col gap-2 rounded-xl border-2 border-stone-200 p-4">
          {selectableSupportTypes.map((value) => (
            <label key={value} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                name="supportTypes"
                value={value}
                className="size-4 accent-brand-600"
              />
              {supportTypeLabels[value]}
            </label>
          ))}
        </div>
        <FieldErrors errors={state.fieldErrors?.supportTypes} />
      </fieldset>

      <fieldset>
        <legend className={labelClassName}>
          Pin público no mapa
        </legend>
        <MapPicker />
        <FieldErrors errors={state.fieldErrors?.latitude} />
      </fieldset>

      <div>
        <label htmlFor="logisticsDetails" className={labelClassName}>
          Ponto logístico (privado, opcional)
        </label>
        <textarea
          id="logisticsDetails"
          name="logisticsDetails"
          rows={2}
          maxLength={1000}
          placeholder="Endereço exato, referências e horários — visível apenas para envolvidos na campanha, nunca na página pública."
          className={inputClassName}
        />
        <FieldErrors errors={state.fieldErrors?.logisticsDetails} />
      </div>

      <div>
        <label htmlFor="goalDescription" className={labelClassName}>
          Necessidade ou meta
        </label>
        <textarea
          id="goalDescription"
          name="goalDescription"
          rows={2}
          required
          placeholder="Ex.: 30 cestas básicas completas até o fim do mês"
          className={inputClassName}
        />
        <FieldErrors errors={state.fieldErrors?.goalDescription} />
      </div>

      <fieldset>
        <legend className={labelClassName}>Prazo</legend>
        <div className="flex flex-col gap-2 rounded-xl border-2 border-stone-200 p-4 text-sm">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="deadlineMode"
              value="none"
              checked={deadlineMode === "none"}
              onChange={() => setDeadlineMode("none")}
              className="size-4 accent-brand-600"
            />
            Sem prazo definido (campanha contínua até ser encerrada)
          </label>
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="deadlineMode"
              value="date"
              checked={deadlineMode === "date"}
              onChange={() => setDeadlineMode("date")}
              className="size-4 accent-brand-600"
            />
            Com prazo até:
            <input
              type="date"
              name="deadline"
              disabled={deadlineMode !== "date"}
              className="rounded-lg border-2 border-stone-200 px-2 py-1 disabled:opacity-40"
            />
          </label>
        </div>
        <FieldErrors errors={state.fieldErrors?.deadlineMode} />
        <FieldErrors errors={state.fieldErrors?.deadline} />
      </fieldset>

      <div>
        <label htmlFor="supportInstructions" className={labelClassName}>
          Instruções de apoio
        </label>
        <textarea
          id="supportInstructions"
          name="supportInstructions"
          rows={3}
          required
          placeholder="Como o doador deve proceder: onde entregar, horários, contato..."
          className={inputClassName}
        />
        <FieldErrors errors={state.fieldErrors?.supportInstructions} />
      </div>

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

"use client";

import { useActionState, useState } from "react";
import {
  createOrganizationPostAction,
  suspendPostAction,
  togglePostHiddenAction,
  togglePostReactionAction,
  type PostFormState,
} from "@/lib/actions/organization-post";
import {
  FieldErrors,
  inputClassName,
  labelClassName,
} from "@/components/form-field";

const initialState: PostFormState = {};

function ErrorText({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="mt-2 text-sm font-medium text-coral-500" role="alert">
      {error}
    </p>
  );
}

// Formulário de novo post (representante).
export function NovoPostForm({ organizationId }: { organizationId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createOrganizationPostAction,
    initialState
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-200 transition hover:from-brand-600 hover:to-brand-700"
      >
        + Novo post
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-3xl bg-white p-6 shadow-xl shadow-stone-200/60 ring-1 ring-stone-100"
    >
      <input type="hidden" name="organizationId" value={organizationId} />
      <h3 className="mb-4 font-display text-lg font-bold text-stone-900">
        Novo post
      </h3>

      <div className="mb-4">
        <label htmlFor="content" className={labelClassName}>
          Conteúdo
        </label>
        <textarea
          id="content"
          name="content"
          rows={4}
          maxLength={5000}
          required
          placeholder="Conte uma atualização, resultado ou novidade da organização..."
          className={inputClassName}
        />
        <FieldErrors errors={state.fieldErrors?.content} />
      </div>

      <div className="mb-4">
        <label htmlFor="images" className={labelClassName}>
          Imagens (opcional, até 4)
        </label>
        <input
          id="images"
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="videoUrl" className={labelClassName}>
          Link de vídeo externo (opcional)
        </label>
        <input
          id="videoUrl"
          name="videoUrl"
          type="url"
          placeholder="https://youtube.com/..."
          className={inputClassName}
        />
        <FieldErrors errors={state.fieldErrors?.videoUrl} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-200 transition hover:from-brand-600 hover:to-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Publicando..." : "Publicar post"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm font-semibold text-stone-500 hover:text-stone-700"
        >
          Cancelar
        </button>
      </div>
      <ErrorText error={state.error} />
    </form>
  );
}

// Botão de reação do doador (toggle), com contagem agregada.
export function ReagirButton({
  postId,
  count,
  reacted,
}: {
  postId: string;
  count: number;
  reacted: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    togglePostReactionAction,
    initialState
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="postId" value={postId} />
      <button
        type="submit"
        disabled={pending}
        aria-pressed={reacted}
        className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ring-1 transition disabled:opacity-50 ${
          reacted
            ? "bg-coral-50 text-coral-600 ring-coral-200"
            : "bg-stone-50 text-stone-600 ring-stone-200 hover:bg-stone-100"
        }`}
      >
        {reacted ? "♥" : "♡"} Apoiar · {count}
      </button>
      <ErrorText error={state.error} />
    </form>
  );
}

// Contagem somente leitura para visitantes (sem reagir).
export function ReacaoCount({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-stone-50 px-4 py-1.5 text-sm font-semibold text-stone-500 ring-1 ring-stone-200">
      ♥ {count}
    </span>
  );
}

// Ocultar / reexibir post (representante).
export function OcultarPost({
  postId,
  hidden,
}: {
  postId: string;
  hidden: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    togglePostHiddenAction,
    initialState
  );

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="postId" value={postId} />
      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer text-sm font-semibold text-stone-500 underline hover:text-stone-700 disabled:opacity-50"
      >
        {pending ? "..." : hidden ? "Reexibir" : "Ocultar"}
      </button>
      <ErrorText error={state.error} />
    </form>
  );
}

// Suspender post (moderação), com motivo.
export function SuspenderPost({ postId }: { postId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    suspendPostAction,
    initialState
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer text-sm font-semibold text-rose-600 underline hover:text-rose-700"
      >
        Suspender (moderação)
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-2">
      <input type="hidden" name="postId" value={postId} />
      <textarea
        name="reason"
        rows={2}
        maxLength={1000}
        required
        placeholder="Motivo da suspensão..."
        className={inputClassName}
      />
      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
        >
          {pending ? "Suspendendo..." : "Confirmar suspensão"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold text-stone-500 hover:bg-stone-100"
        >
          Cancelar
        </button>
      </div>
      <ErrorText error={state.error} />
    </form>
  );
}

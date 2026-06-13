import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import { ValidacaoForm } from "./validacao-form";

export const metadata: Metadata = {
  title: "Validação de Pessoa — Solydaries",
};

const statusInfo: Record<
  string,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Em análise",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  APPROVED: {
    label: "Aprovada",
    className: "bg-brand-50 text-brand-700 ring-brand-200",
  },
  REJECTED: {
    label: "Rejeitada",
    className: "bg-rose-50 text-rose-600 ring-rose-200",
  },
  REVOKED: {
    label: "Revogada",
    className: "bg-stone-100 text-stone-600 ring-stone-200",
  },
};

export default async function ValidacaoPage() {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  const requests = await prisma.personValidationRequest.findMany({
    where: { personId: person.id },
    orderBy: { createdAt: "desc" },
    include: { documents: { select: { id: true, fileName: true } } },
  });

  const latest = requests[0];
  const canSubmit =
    !person.validatedAt && (!latest || latest.status === "REJECTED");

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-10 border-l-4 border-brand-400 pl-5">
        <p className="mb-1 text-sm font-medium text-brand-600">
          Validação de Pessoa
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900">
          Torne-se criador(a) de campanhas
        </h1>
        <p className="mt-2 text-stone-500">
          A validação autoriza você a criar campanhas em seu próprio nome. Os
          documentos enviados são privados e analisados apenas por
          administradores.
        </p>
      </div>

      {person.validatedAt && (
        <div className="mb-8 rounded-2xl bg-brand-50 p-5 text-brand-800 ring-1 ring-brand-200">
          <p className="font-semibold">✓ Sua conta está validada</p>
          <p className="mt-1 text-sm">
            Validada em{" "}
            {person.validatedAt.toLocaleDateString("pt-BR", {
              dateStyle: "long",
            })}
            . Você pode criar campanhas em seu próprio nome.
          </p>
        </div>
      )}

      {requests.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-3 font-display text-lg font-bold text-stone-900">
            Suas solicitações
          </h2>
          <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-100">
            {requests.map((request) => {
              const status = statusInfo[request.status];
              return (
                <li key={request.id} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-stone-500">
                        Enviada em{" "}
                        {request.createdAt.toLocaleDateString("pt-BR", {
                          dateStyle: "long",
                        })}{" "}
                        · {request.documents.length} documento(s)
                      </p>
                      {request.status === "REJECTED" &&
                        request.decisionReason && (
                          <p className="mt-1 text-sm text-rose-600">
                            Motivo: {request.decisionReason}
                          </p>
                        )}
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {canSubmit && (
        <ValidacaoForm
          isResubmission={latest?.status === "REJECTED"}
        />
      )}

      {!canSubmit && !person.validatedAt && latest?.status === "PENDING" && (
        <p className="rounded-2xl bg-amber-50 p-5 text-sm text-amber-800 ring-1 ring-amber-200">
          Sua solicitação está em análise. Você receberá uma notificação assim
          que houver uma decisão.
        </p>
      )}
    </section>
  );
}

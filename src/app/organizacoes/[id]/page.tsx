import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import { formatPersonName } from "@/lib/format";
import { OrgValidacaoForm } from "./org-validacao-form";

export const metadata: Metadata = {
  title: "Organização — Solydaries",
};

const statusInfo: Record<string, { label: string; className: string }> = {
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

export default async function OrganizacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  const { id } = await params;
  const membership = await prisma.organizationMember.findUnique({
    where: { organizationId_personId: { organizationId: id, personId: person.id } },
    include: {
      organization: {
        include: {
          members: {
            include: { person: { select: { name: true } } },
            orderBy: { createdAt: "asc" },
          },
          validationRequests: {
            orderBy: { createdAt: "desc" },
            include: { documents: { select: { id: true } } },
          },
        },
      },
    },
  });

  // Organização não validada não aparece publicamente: só membros acessam.
  if (!membership) notFound();

  const organization = membership.organization;
  const isRepresentative = membership.role === "REPRESENTATIVE";
  const latest = organization.validationRequests[0];
  const canSubmit =
    isRepresentative &&
    organization.isActive &&
    !organization.validatedAt &&
    (!latest || latest.status === "REJECTED");

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-10 border-l-4 border-brand-400 pl-5">
        <p className="mb-1 text-sm font-medium text-brand-600">
          <Link href="/organizacoes" className="hover:underline">
            Organizações
          </Link>{" "}
          / Detalhes
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900">
          {organization.name}
          {organization.validatedAt && (
            <span className="ml-3 align-middle rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700 ring-1 ring-brand-200">
              ✓ Selo de validação
            </span>
          )}
        </h1>
        {organization.description && (
          <p className="mt-2 max-w-xl text-stone-500">
            {organization.description}
          </p>
        )}
      </div>

      {!organization.validatedAt && (
        <div className="mb-8 rounded-2xl bg-stone-50 p-5 text-sm text-stone-600 ring-1 ring-stone-100">
          Esta organização ainda <strong>não está validada</strong>: ela não
          aparece publicamente e não pode criar campanhas em nome próprio.
        </div>
      )}

      <div className="mb-10">
        <h2 className="mb-3 font-display text-lg font-bold text-stone-900">
          Membros
        </h2>
        <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-100">
          {organization.members.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between px-5 py-3 text-sm"
            >
              <span className="font-medium text-stone-800">
                {formatPersonName(member.person.name)}
              </span>
              <span className="text-stone-500">
                {member.role === "REPRESENTATIVE" ? "Representante" : "Membro"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {organization.validationRequests.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-3 font-display text-lg font-bold text-stone-900">
            Validação da organização
          </h2>
          <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-100">
            {organization.validationRequests.map((request) => {
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
        <OrgValidacaoForm
          organizationId={organization.id}
          isResubmission={latest?.status === "REJECTED"}
        />
      )}

      {isRepresentative &&
        !organization.validatedAt &&
        latest?.status === "PENDING" && (
          <p className="rounded-2xl bg-amber-50 p-5 text-sm text-amber-800 ring-1 ring-amber-200">
            A validação está em análise. Os representantes receberão uma
            notificação com a decisão.
          </p>
        )}

      {!isRepresentative && !organization.validatedAt && (
        <p className="rounded-2xl bg-stone-50 p-5 text-sm text-stone-500 ring-1 ring-stone-100">
          Apenas representantes podem solicitar a validação da organização.
        </p>
      )}
    </section>
  );
}

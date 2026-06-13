import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import { isAdmin } from "@/lib/authz";
import { formatPersonName } from "@/lib/format";
import { OrgDecisaoForm } from "./org-decisao-form";

export const metadata: Metadata = {
  title: "Analisar validação de organização — Solydaries",
};

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default async function AnalisarOrgValidacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");
  if (!isAdmin(person)) redirect("/painel");

  const { id } = await params;
  const request = await prisma.organizationValidationRequest.findUnique({
    where: { id },
    include: {
      organization: {
        include: {
          members: {
            where: { role: "REPRESENTATIVE" },
            include: { person: { select: { name: true, email: true } } },
          },
        },
      },
      submittedBy: { select: { name: true, email: true } },
      documents: true,
    },
  });
  if (!request) notFound();

  const organization = request.organization;

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-10 border-l-4 border-amber-400 pl-5">
        <p className="mb-1 text-sm font-medium text-amber-600">
          <Link href="/admin/validacoes-organizacoes" className="hover:underline">
            Validações de organizações
          </Link>{" "}
          / Análise
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900">
          {organization.name}
        </h1>
        <p className="mt-2 text-stone-500">
          enviada por {formatPersonName(request.submittedBy.name)} (
          {request.submittedBy.email}) em{" "}
          {request.createdAt.toLocaleDateString("pt-BR")}
        </p>
      </div>

      {organization.description && (
        <div className="mb-8 rounded-2xl bg-stone-50 p-5 text-sm text-stone-700 ring-1 ring-stone-100">
          <p className="mb-1 font-semibold text-stone-900">
            Descrição da organização
          </p>
          <p className="whitespace-pre-line">{organization.description}</p>
        </div>
      )}

      <div className="mb-8">
        <h2 className="mb-3 font-display text-lg font-bold text-stone-900">
          Representantes
        </h2>
        <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-100">
          {organization.members.map((member) => (
            <li key={member.id} className="px-5 py-3 text-sm">
              <span className="font-medium text-stone-800">
                {formatPersonName(member.person.name)}
              </span>{" "}
              <span className="text-stone-500">· {member.person.email}</span>
            </li>
          ))}
        </ul>
      </div>

      {request.note && (
        <div className="mb-8 rounded-2xl bg-stone-50 p-5 text-sm text-stone-700 ring-1 ring-stone-100">
          <p className="mb-1 font-semibold text-stone-900">
            Mensagem de quem enviou
          </p>
          <p className="whitespace-pre-line">{request.note}</p>
        </div>
      )}

      <div className="mb-8">
        <h2 className="mb-3 font-display text-lg font-bold text-stone-900">
          Documentos ({request.documents.length})
        </h2>
        <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-100">
          {request.documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-4 px-5 py-3"
            >
              <div>
                <p className="text-sm font-medium text-stone-800">
                  {doc.fileName}
                </p>
                <p className="text-xs text-stone-400">
                  {doc.mimeType} · {formatSize(doc.sizeBytes)}
                </p>
              </div>
              <a
                href={`/api/validacao/documentos-organizacao/${doc.id}`}
                target="_blank"
                className="shrink-0 text-sm font-semibold text-brand-700 underline"
              >
                Abrir
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-stone-400">
          Documentos privados — acessíveis apenas a administradores.
        </p>
      </div>

      {request.status === "PENDING" ? (
        <OrgDecisaoForm requestId={request.id} />
      ) : (
        <p className="rounded-2xl bg-stone-50 p-5 text-sm text-stone-600 ring-1 ring-stone-100">
          Esta solicitação já foi decidida ({request.status}).
        </p>
      )}
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import { isAdmin } from "@/lib/authz";
import { formatPersonName } from "@/lib/format";

export const metadata: Metadata = {
  title: "Validações de organizações — Solydaries",
};

export default async function ValidacoesOrganizacoesPage() {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");
  if (!isAdmin(person)) redirect("/painel");

  const pending = await prisma.organizationValidationRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      organization: { select: { name: true } },
      submittedBy: { select: { name: true } },
      documents: { select: { id: true } },
    },
  });

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-10 border-l-4 border-amber-400 pl-5">
        <p className="mb-1 text-sm font-medium text-amber-600">
          <Link href="/admin" className="hover:underline">
            Administração
          </Link>{" "}
          / Validações de Organizações
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900">
          Validações de organizações
        </h1>
        <p className="mt-2 max-w-xl text-stone-500">
          Solicitações aguardando análise, da mais antiga para a mais recente.
        </p>
      </div>

      {pending.length === 0 ? (
        <p className="rounded-2xl border border-stone-100 p-8 text-center text-stone-500">
          Nenhuma solicitação pendente no momento. 🎉
        </p>
      ) : (
        <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-100">
          {pending.map((request) => (
            <li key={request.id}>
              <Link
                href={`/admin/validacoes-organizacoes/${request.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-stone-50"
              >
                <div>
                  <p className="font-medium text-stone-900">
                    {request.organization.name}
                  </p>
                  <p className="text-sm text-stone-500">
                    enviada por {formatPersonName(request.submittedBy.name)} ·{" "}
                    {request.documents.length} documento(s) ·{" "}
                    {request.createdAt.toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <span className="text-sm font-semibold text-brand-700">
                  Analisar →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

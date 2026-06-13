import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import { NovaOrganizacaoForm } from "./nova-organizacao-form";

export const metadata: Metadata = {
  title: "Organizações — Solydaries",
};

export default async function OrganizacoesPage() {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  const memberships = await prisma.organizationMember.findMany({
    where: { personId: person.id },
    orderBy: { createdAt: "asc" },
    include: { organization: true },
  });

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10 border-l-4 border-brand-400 pl-5">
        <p className="mb-1 text-sm font-medium text-brand-600">
          Organizações
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900">
          Suas organizações
        </h1>
        <p className="mt-2 max-w-xl text-stone-500">
          Organizações são operadas por seus membros e precisam de validação
          para ter página pública e criar campanhas em nome próprio.
        </p>
      </div>

      {memberships.length > 0 && (
        <ul className="mb-10 divide-y divide-stone-100 rounded-2xl border border-stone-100">
          {memberships.map((membership) => (
            <li key={membership.id}>
              <Link
                href={`/organizacoes/${membership.organizationId}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-stone-50"
              >
                <div>
                  <p className="font-medium text-stone-900">
                    {membership.organization.name}
                    {membership.organization.validatedAt && (
                      <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
                        ✓ Validada
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-stone-500">
                    {membership.role === "REPRESENTATIVE"
                      ? "Representante"
                      : "Membro"}
                  </p>
                </div>
                <span className="text-sm font-semibold text-brand-700">
                  Abrir →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <NovaOrganizacaoForm />
    </section>
  );
}

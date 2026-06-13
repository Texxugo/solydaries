import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import { NovaCampanhaForm } from "./nova-campanha-form";

export const metadata: Metadata = {
  title: "Nova campanha — Solydaries",
};

export default async function NovaCampanhaPage() {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  const validatedOrgs = await prisma.organizationMember.findMany({
    where: {
      personId: person.id,
      role: "REPRESENTATIVE",
      organization: { validatedAt: { not: null }, isActive: true },
    },
    include: { organization: { select: { id: true, name: true } } },
  });

  const contexts = [
    ...(person.validatedAt
      ? [{ value: "self", label: "Em meu próprio nome" }]
      : []),
    ...validatedOrgs.map((m) => ({
      value: m.organization.id,
      label: `Organização: ${m.organization.name}`,
    })),
  ];

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-10 border-l-4 border-brand-400 pl-5">
        <p className="mb-1 text-sm font-medium text-brand-600">
          <Link href="/campanhas" className="hover:underline">
            Campanhas
          </Link>{" "}
          / Nova
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900">
          Nova campanha
        </h1>
        <p className="mt-2 max-w-xl text-stone-500">
          A campanha começa como rascunho e só vai ao ar depois de passar pela
          revisão.
        </p>
      </div>

      {contexts.length === 0 ? (
        <div className="rounded-2xl bg-amber-50 p-6 text-amber-800 ring-1 ring-amber-200">
          <p className="font-semibold">
            Você ainda não pode criar campanhas.
          </p>
          <p className="mt-1 text-sm">
            Para criar campanhas em seu nome,{" "}
            <Link href="/validacao" className="font-semibold underline">
              solicite a Validação de Pessoa
            </Link>
            . Para criar em nome de uma organização, você precisa ser
            representante de uma{" "}
            <Link href="/organizacoes" className="font-semibold underline">
              organização validada
            </Link>
            .
          </p>
        </div>
      ) : (
        <NovaCampanhaForm contexts={contexts} />
      )}
    </section>
  );
}

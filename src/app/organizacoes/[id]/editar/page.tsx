import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import { EditarOrganizacaoForm } from "./editar-organizacao-form";

export const metadata: Metadata = {
  title: "Editar organização — Solydaries",
};

export default async function EditarOrganizacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  const { id } = await params;
  const membership = await prisma.organizationMember.findUnique({
    where: { organizationId_personId: { organizationId: id, personId: person.id } },
    include: { organization: true },
  });

  // Apenas representantes editam o perfil da organização.
  if (!membership || membership.role !== "REPRESENTATIVE") notFound();

  const org = membership.organization;

  return (
    <section className="mx-auto max-w-xl px-6 py-16">
      <div className="mb-8 border-l-4 border-brand-400 pl-5">
        <p className="mb-1 text-sm font-medium text-brand-600">
          <Link href={`/organizacoes/${org.id}`} className="hover:underline">
            {org.name}
          </Link>{" "}
          / Editar perfil
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900">
          Perfil público
        </h1>
        <p className="mt-2 text-stone-500">
          Descrição e contatos exibidos na página pública da organização.
        </p>
      </div>

      <EditarOrganizacaoForm
        organizationId={org.id}
        defaults={{
          description: org.description ?? "",
          publicEmail: org.publicEmail ?? "",
          phone: org.phone ?? "",
          website: org.website ?? "",
          logoUrl: org.logoUrl ?? "",
          coverUrl: org.coverUrl ?? "",
        }}
      />
    </section>
  );
}

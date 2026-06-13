import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import { canModerate } from "@/lib/authz";
import { formatPersonName } from "@/lib/format";
import { categoryLabels, supportTypeLabels } from "@/lib/campaign-labels";
import { AlteracaoDecisao } from "./alteracao-decisao";

export const metadata: Metadata = {
  title: "Revisar alteração — Solydaries",
};

function deadlineLabel(date: Date | null) {
  return date
    ? date.toLocaleDateString("pt-BR", { dateStyle: "long" })
    : "Sem prazo definido";
}

function supportLabel(types: string[]) {
  return types
    .map((t) => supportTypeLabels[t as keyof typeof supportTypeLabels])
    .join(", ");
}

export default async function RevisarAlteracaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");
  if (!canModerate(person)) redirect("/painel");

  const { id } = await params;
  const change = await prisma.campaignChangeRequest.findUnique({
    where: { id },
    include: {
      campaign: true,
      submittedBy: { select: { name: true } },
    },
  });
  if (!change) notFound();

  const c = change.campaign;

  // Comparação atual (público) × proposto. `changed` destaca o que muda.
  const rows: { label: string; current: string; proposed: string }[] = [
    { label: "Título", current: c.title, proposed: change.title },
    { label: "Descrição", current: c.description, proposed: change.description },
    {
      label: "Categoria",
      current: categoryLabels[c.category],
      proposed: categoryLabels[change.category],
    },
    {
      label: "Tipos de apoio",
      current: supportLabel(c.supportTypes),
      proposed: supportLabel(change.supportTypes),
    },
    {
      label: "Necessidade ou meta",
      current: c.goalDescription,
      proposed: change.goalDescription,
    },
    { label: "Localidade", current: c.locality, proposed: change.locality },
    {
      label: "Pin (lat, long)",
      current: `${c.latitude}, ${c.longitude}`,
      proposed: `${change.latitude}, ${change.longitude}`,
    },
    {
      label: "Instruções de apoio",
      current: c.supportInstructions,
      proposed: change.supportInstructions,
    },
    {
      label: "Ponto logístico",
      current: c.logisticsDetails ?? "—",
      proposed: change.logisticsDetails ?? "—",
    },
    {
      label: "Prazo",
      current: deadlineLabel(c.deadline),
      proposed: deadlineLabel(change.deadline),
    },
  ];

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10 border-l-4 border-coral-400 pl-5">
        <p className="mb-1 text-sm font-medium text-coral-500">
          <Link href="/moderacao/alteracoes" className="hover:underline">
            Alterações de campanha
          </Link>{" "}
          / Revisão
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900">
          {c.title}
        </h1>
        <p className="mt-2 text-stone-500">
          Alteração proposta por {formatPersonName(change.submittedBy.name)} em{" "}
          {change.createdAt.toLocaleDateString("pt-BR")}. Campos destacados
          mudam em relação à versão pública.
        </p>
      </div>

      <div className="mb-8 overflow-hidden rounded-2xl border border-stone-100">
        <div className="grid grid-cols-[1fr_1fr] gap-px bg-stone-100 text-xs font-semibold uppercase tracking-wide text-stone-500">
          <div className="bg-white px-5 py-2">Atual (público)</div>
          <div className="bg-white px-5 py-2">Proposto</div>
        </div>
        <ul className="divide-y divide-stone-100">
          {rows.map((row) => {
            const changed = row.current !== row.proposed;
            return (
              <li key={row.label} className="px-5 py-4">
                <p className="mb-1 text-xs font-semibold text-stone-500">
                  {row.label}
                  {changed && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      alterado
                    </span>
                  )}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p className="whitespace-pre-line text-stone-500">
                    {row.current}
                  </p>
                  <p
                    className={`whitespace-pre-line ${
                      changed
                        ? "font-medium text-stone-900"
                        : "text-stone-400"
                    }`}
                  >
                    {row.proposed}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {change.status === "PENDING" ? (
        <AlteracaoDecisao changeId={change.id} />
      ) : (
        <p className="rounded-2xl bg-stone-50 p-5 text-sm text-stone-600 ring-1 ring-stone-100">
          Esta alteração já foi decidida ({change.status}).
        </p>
      )}
    </section>
  );
}

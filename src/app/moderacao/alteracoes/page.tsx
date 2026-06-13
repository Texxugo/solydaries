import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import { canModerate } from "@/lib/authz";
import { formatPersonName } from "@/lib/format";

export const metadata: Metadata = {
  title: "Alterações de campanha — Solydaries",
};

export default async function AlteracoesPage() {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");
  if (!canModerate(person)) redirect("/painel");

  const pending = await prisma.campaignChangeRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      campaign: { select: { title: true } },
      submittedBy: { select: { name: true } },
    },
  });

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-10 border-l-4 border-coral-400 pl-5">
        <p className="mb-1 text-sm font-medium text-coral-500">
          <Link href="/moderacao" className="hover:underline">
            Moderação
          </Link>{" "}
          / Alterações de campanha
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900">
          Alterações de campanha
        </h1>
        <p className="mt-2 max-w-xl text-stone-500">
          Alterações materiais em campanhas publicadas aguardando revisão.
        </p>
      </div>

      {pending.length === 0 ? (
        <p className="rounded-2xl border border-stone-100 p-8 text-center text-stone-500">
          Nenhuma alteração aguardando revisão. 🎉
        </p>
      ) : (
        <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-100">
          {pending.map((change) => (
            <li key={change.id}>
              <Link
                href={`/moderacao/alteracoes/${change.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-stone-50"
              >
                <div>
                  <p className="font-medium text-stone-900">
                    {change.campaign.title}
                  </p>
                  <p className="text-sm text-stone-500">
                    proposta por {formatPersonName(change.submittedBy.name)} ·{" "}
                    {change.createdAt.toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <span className="text-sm font-semibold text-brand-700">
                  Revisar →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

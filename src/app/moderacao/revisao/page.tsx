import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import { canModerate } from "@/lib/authz";
import { categoryLabels } from "@/lib/campaign-labels";
import { formatPersonName } from "@/lib/format";

export const metadata: Metadata = {
  title: "Revisão de campanhas — Solydaries",
};

export default async function RevisaoCampanhasPage() {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");
  if (!canModerate(person)) redirect("/painel");

  const pending = await prisma.campaign.findMany({
    where: { status: "PENDING_REVIEW" },
    orderBy: { updatedAt: "asc" },
    include: {
      ownerPerson: { select: { name: true } },
      ownerOrganization: { select: { name: true } },
    },
  });

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-10 border-l-4 border-coral-400 pl-5">
        <p className="mb-1 text-sm font-medium text-coral-500">
          <Link href="/moderacao" className="hover:underline">
            Moderação
          </Link>{" "}
          / Revisão de campanhas
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900">
          Revisão de campanhas
        </h1>
        <p className="mt-2 max-w-xl text-stone-500">
          Campanhas aguardando revisão antes da publicação, da mais antiga
          para a mais recente.
        </p>
      </div>

      {pending.length === 0 ? (
        <p className="rounded-2xl border border-stone-100 p-8 text-center text-stone-500">
          Nenhuma campanha aguardando revisão. 🎉
        </p>
      ) : (
        <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-100">
          {pending.map((campaign) => (
            <li key={campaign.id}>
              <Link
                href={`/campanhas/${campaign.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-stone-50"
              >
                <div>
                  <p className="font-medium text-stone-900">
                    {campaign.title}
                  </p>
                  <p className="text-sm text-stone-500">
                    {campaign.ownerOrganization
                      ? campaign.ownerOrganization.name
                      : formatPersonName(campaign.ownerPerson?.name ?? "")}{" "}
                    · {categoryLabels[campaign.category]} · {campaign.locality}
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

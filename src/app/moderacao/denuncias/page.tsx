import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import { canModerate } from "@/lib/authz";
import { formatPersonName } from "@/lib/format";

export const metadata: Metadata = {
  title: "Denúncias — Solydaries",
};

const targetLabels: Record<string, string> = {
  CAMPAIGN: "Campanha",
  ORGANIZATION_POST: "Post de organização",
  SUPPORT_OFFER: "Oferta de apoio",
};

export default async function DenunciasPage() {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");
  if (!canModerate(person)) redirect("/painel");

  const reports = await prisma.report.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "asc" },
    include: {
      reporter: { select: { name: true } },
      campaign: { select: { title: true } },
      organizationPost: { select: { organization: { select: { name: true } } } },
      supportOffer: { select: { campaign: { select: { title: true } } } },
    },
  });

  function targetTitle(report: (typeof reports)[number]) {
    if (report.campaign) return report.campaign.title;
    if (report.organizationPost)
      return `Post de ${report.organizationPost.organization.name}`;
    if (report.supportOffer)
      return `Oferta em "${report.supportOffer.campaign.title}"`;
    return "Conteúdo removido";
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-10 border-l-4 border-coral-400 pl-5">
        <p className="mb-1 text-sm font-medium text-coral-500">
          <Link href="/moderacao" className="hover:underline">
            Moderação
          </Link>{" "}
          / Denúncias
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900">
          Denúncias
        </h1>
        <p className="mt-2 max-w-xl text-stone-500">
          Denúncias de campanhas, posts e ofertas de apoio aguardando decisão.
        </p>
      </div>

      {reports.length === 0 ? (
        <p className="rounded-2xl border border-stone-100 p-8 text-center text-stone-500">
          Nenhuma denúncia em aberto. 🎉
        </p>
      ) : (
        <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-100">
          {reports.map((report) => (
            <li key={report.id}>
              <Link
                href={`/moderacao/denuncias/${report.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-stone-50"
              >
                <div>
                  <p className="font-medium text-stone-900">
                    {targetTitle(report)}
                  </p>
                  <p className="text-sm text-stone-500">
                    {targetLabels[report.targetType]} · denunciada por{" "}
                    {formatPersonName(report.reporter.name)} ·{" "}
                    {report.createdAt.toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-brand-700">
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

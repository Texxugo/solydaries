import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import { campaignStatusInfo, categoryLabels } from "@/lib/campaign-labels";
import { processInactiveCampaigns } from "@/lib/campaign-inactivity";
import { closeExpiredCampaigns } from "@/lib/campaign-lifecycle";

export const metadata: Metadata = {
  title: "Minhas campanhas — Solydaries",
};

export default async function CampanhasPage() {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  // Checagens preguiçosas (sem workers no MVP): prazo vencido e inatividade.
  await closeExpiredCampaigns();
  await processInactiveCampaigns();

  const representedOrgIds = (
    await prisma.organizationMember.findMany({
      where: { personId: person.id, role: "REPRESENTATIVE" },
      select: { organizationId: true },
    })
  ).map((m) => m.organizationId);

  const campaigns = await prisma.campaign.findMany({
    where: {
      OR: [
        { ownerPersonId: person.id },
        { createdById: person.id },
        { ownerOrganizationId: { in: representedOrgIds } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { ownerOrganization: { select: { name: true } } },
  });

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="border-l-4 border-brand-400 pl-5">
          <p className="mb-1 text-sm font-medium text-brand-600">Campanhas</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900">
            Minhas campanhas
          </h1>
          <p className="mt-2 max-w-xl text-stone-500">
            Campanhas em seu nome ou de organizações que você representa.
          </p>
        </div>
        <Link
          href="/campanhas/nova"
          className="rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-200 transition hover:from-brand-600 hover:to-brand-700"
        >
          + Nova campanha
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <p className="rounded-2xl border border-stone-100 p-8 text-center text-stone-500">
          Você ainda não tem campanhas. Crie a primeira!
        </p>
      ) : (
        <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-100">
          {campaigns.map((campaign) => {
            const status = campaignStatusInfo[campaign.status];
            return (
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
                        ? `por ${campaign.ownerOrganization.name}`
                        : "em nome próprio"}{" "}
                      · {categoryLabels[campaign.category]} ·{" "}
                      {campaign.locality}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${status.className}`}
                  >
                    {status.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

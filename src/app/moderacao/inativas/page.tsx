import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionPerson } from "@/lib/session";
import { canModerate } from "@/lib/authz";
import {
  findInactiveCampaigns,
  processInactiveCampaigns,
  INACTIVITY_DAYS,
} from "@/lib/campaign-inactivity";
import { campaignStatusInfo, categoryLabels } from "@/lib/campaign-labels";
import { formatPersonName } from "@/lib/format";

export const metadata: Metadata = {
  title: "Campanhas sem movimentação — Solydaries",
};

function daysAgo(date: Date) {
  return Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
}

export default async function CampanhasInativasPage() {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");
  if (!canModerate(person)) redirect("/painel");

  // A visita da moderação também dispara os avisos aos donos.
  await processInactiveCampaigns();
  const campaigns = await findInactiveCampaigns();

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-10 border-l-4 border-coral-400 pl-5">
        <p className="mb-1 text-sm font-medium text-coral-500">
          <Link href="/moderacao" className="hover:underline">
            Moderação
          </Link>{" "}
          / Campanhas sem movimentação
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900">
          Campanhas sem movimentação
        </h1>
        <p className="mt-2 max-w-xl text-stone-500">
          Campanhas paradas há mais de {INACTIVITY_DAYS} dias, da mais antiga
          para a mais recente. Os donos são notificados automaticamente.
        </p>
      </div>

      {campaigns.length === 0 ? (
        <p className="rounded-2xl border border-stone-100 p-8 text-center text-stone-500">
          Nenhuma campanha parada no momento. 🎉
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
                        ? campaign.ownerOrganization.name
                        : formatPersonName(campaign.ownerPerson?.name ?? "")}{" "}
                      · {categoryLabels[campaign.category]} · parada há{" "}
                      {daysAgo(campaign.lastActivityAt)} dias
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

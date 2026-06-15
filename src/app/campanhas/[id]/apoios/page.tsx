import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import { canManageCampaign } from "@/lib/campaign-authz";
import { formatPersonName } from "@/lib/format";
import {
  supportOfferStatusInfo,
  supportOfferTypeLabels,
} from "@/lib/support-offer-labels";
import { DecisaoApoio } from "../apoio-gestao";
import { Denunciar } from "@/components/denunciar";
import { reportOfferAction } from "@/lib/actions/report";

export const metadata: Metadata = {
  title: "Apoios recebidos — Solydaries",
};

export default async function ApoiosRecebidosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign) notFound();

  // Apenas a gestão da campanha acessa os apoios e seus dados privados.
  if (!(await canManageCampaign(person, campaign))) notFound();

  // Pendentes primeiro (ordem de definição do enum), depois mais recentes.
  const offers = await prisma.supportOffer.findMany({
    where: { campaignId: campaign.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { donor: { select: { name: true } } },
  });
  const pendingCount = offers.filter((o) => o.status === "PENDING").length;

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-8 border-l-4 border-brand-400 pl-5">
        <p className="mb-1 text-sm font-medium text-brand-600">
          <Link href={`/campanhas/${campaign.id}`} className="hover:underline">
            {campaign.title}
          </Link>{" "}
          / Apoios
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900">
          Apoios recebidos
        </h1>
        <p className="mt-2 text-stone-500">
          {pendingCount > 0
            ? `${pendingCount} aguardando sua decisão. `
            : "Nenhuma oferta aguardando decisão. "}
          Dados de contato visíveis apenas para a equipe da campanha.
        </p>
      </div>

      {offers.length === 0 ? (
        <p className="rounded-2xl border border-stone-100 p-8 text-center text-stone-500">
          Esta campanha ainda não recebeu ofertas de apoio.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {offers.map((offer) => {
            const st = supportOfferStatusInfo[offer.status];
            return (
              <li
                key={offer.id}
                className="rounded-2xl border border-stone-100 p-5"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-stone-900">
                      {formatPersonName(offer.donor.name)}
                      {offer.publiclyAnonymous && (
                        <span className="ml-2 text-xs font-normal text-stone-400">
                          (anônimo publicamente)
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-stone-500">
                      {supportOfferTypeLabels[offer.type]}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${st.className}`}
                  >
                    {st.label}
                  </span>
                </div>
                <dl className="space-y-1 text-sm">
                  {offer.type === "ITEM_DONATION" ? (
                    <>
                      <div className="flex justify-between gap-3">
                        <dt className="text-stone-500">Item</dt>
                        <dd className="text-right font-medium text-stone-800">
                          {offer.itemName} ({offer.itemQuantity})
                        </dd>
                      </div>
                      {offer.itemCondition && (
                        <div className="flex justify-between gap-3">
                          <dt className="text-stone-500">Condição</dt>
                          <dd className="text-right font-medium text-stone-800">
                            {offer.itemCondition}
                          </dd>
                        </div>
                      )}
                      {offer.coordinationPreference && (
                        <div className="flex justify-between gap-3">
                          <dt className="text-stone-500">Coordenação</dt>
                          <dd className="text-right font-medium text-stone-800">
                            {offer.coordinationPreference}
                          </dd>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between gap-3">
                        <dt className="text-stone-500">Disponibilidade</dt>
                        <dd className="text-right font-medium text-stone-800">
                          {offer.availability}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-stone-500">Tipo de ajuda</dt>
                        <dd className="text-right font-medium text-stone-800">
                          {offer.helpType}
                        </dd>
                      </div>
                      {offer.note && (
                        <div className="flex justify-between gap-3">
                          <dt className="text-stone-500">Observação</dt>
                          <dd className="text-right font-medium text-stone-800">
                            {offer.note}
                          </dd>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between gap-3">
                    <dt className="text-stone-500">Contato</dt>
                    <dd className="text-right font-medium text-stone-800">
                      {offer.contact}
                    </dd>
                  </div>
                </dl>
                {offer.status === "MANAGER_DECLINED" && offer.declineReason && (
                  <p className="mt-2 text-sm text-rose-600">
                    Motivo da recusa: {offer.declineReason}
                  </p>
                )}
                {offer.status === "PENDING" && (
                  <DecisaoApoio offerId={offer.id} />
                )}
                <div className="mt-3 border-t border-stone-100 pt-3">
                  <Denunciar
                    action={reportOfferAction}
                    idName="offerId"
                    idValue={offer.id}
                    label="Denunciar oferta"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import { formatPersonName } from "@/lib/format";
import { canModerate } from "@/lib/authz";
import { canManageCampaign } from "@/lib/campaign-authz";
import { closeExpiredCampaigns } from "@/lib/campaign-lifecycle";
import { MapView } from "@/components/map/map-view";
import {
  DecisaoRevisao,
  EncerrarCampanha,
  EnviarParaRevisao,
  SuspenderCampanha,
} from "./campanha-acoes";
import {
  campaignStatusInfo,
  categoryLabels,
  supportTypeLabels,
} from "@/lib/campaign-labels";
import { supportOfferTypeLabels } from "@/lib/support-offer-labels";
import { CancelarApoio, FormularioApoio } from "./apoio";

const OFFERABLE_TYPES = ["ITEM_DONATION", "VOLUNTEER"] as const;

export const metadata: Metadata = {
  title: "Campanha — Solydaries",
};

const PUBLICLY_VISIBLE = ["PUBLISHED", "CLOSED"] as const;

export default async function CampanhaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const person = await getSessionPerson();

  // Encerramento preguiçoso por prazo antes de carregar a campanha.
  await closeExpiredCampaigns();

  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      ownerPerson: { select: { name: true } },
      ownerOrganization: { select: { id: true, name: true } },
      createdBy: { select: { name: true } },
      changeRequests: { where: { status: "PENDING" }, take: 1 },
    },
  });
  if (!campaign) notFound();

  const pendingChange = campaign.changeRequests[0] ?? null;

  // Relação do visitante com a campanha (tudo falso para quem não está logado).
  const isOwnerPerson = person ? campaign.ownerPersonId === person.id : false;
  const isCreator = person ? campaign.createdById === person.id : false;
  let isOrgRepresentative = false;
  if (person && campaign.ownerOrganizationId) {
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_personId: {
          organizationId: campaign.ownerOrganizationId,
          personId: person.id,
        },
      },
    });
    isOrgRepresentative = membership?.role === "REPRESENTATIVE";
  }
  const isModerator = person ? canModerate(person) : false;
  const canManage = person ? await canManageCampaign(person, campaign) : false;

  // Progresso público agregado: número de apoios já confirmados.
  const confirmedCount = await prisma.supportOffer.count({
    where: { campaignId: campaign.id, status: "CONFIRMED" },
  });

  // Oferta de Apoio pendente do próprio Doador nesta campanha (se houver).
  const myPendingOffer =
    person && !canManage
      ? await prisma.supportOffer.findFirst({
          where: { campaignId: campaign.id, donorId: person.id, status: "PENDING" },
        })
      : null;

  // Tipos de apoio ofertáveis aceitos pela campanha (doação financeira legada
  // fica de fora).
  const acceptedOfferTypes = campaign.supportTypes.filter(
    (type): type is (typeof OFFERABLE_TYPES)[number] =>
      OFFERABLE_TYPES.includes(type as (typeof OFFERABLE_TYPES)[number])
  );

  // Modo gestão: dono, criador, representante ou moderação. Os demais
  // (inclusive visitantes) só veem campanhas publicadas/encerradas, em modo
  // público — sem dados privados nem ações.
  const canViewManagement =
    isOwnerPerson || isCreator || isOrgRepresentative || isModerator;
  const isPublicView = !canViewManagement;
  if (
    isPublicView &&
    !PUBLICLY_VISIBLE.includes(
      campaign.status as (typeof PUBLICLY_VISIBLE)[number]
    )
  ) {
    notFound();
  }

  const status = campaignStatusInfo[campaign.status];
  const isDiscoverable = PUBLICLY_VISIBLE.includes(
    campaign.status as (typeof PUBLICLY_VISIBLE)[number]
  );

  const editable =
    campaign.status === "DRAFT" ||
    campaign.status === "REJECTED" ||
    campaign.status === "PUBLISHED";
  const showEditLink = canManage && editable && !pendingChange;
  const showClose = canManage && campaign.status === "PUBLISHED";
  const showSuspend = isModerator && campaign.status === "PUBLISHED";
  const showSubmit =
    canManage &&
    (campaign.status === "DRAFT" || campaign.status === "REJECTED");
  const showDecision = isModerator && campaign.status === "PENDING_REVIEW";
  const showQuickRow = showEditLink || showClose || showSuspend;
  const showActions = showQuickRow || showSubmit || showDecision;

  const fields = [
    {
      label: "Dono da campanha",
      value: campaign.ownerOrganization
        ? `${campaign.ownerOrganization.name} (organização)`
        : `${formatPersonName(campaign.ownerPerson!.name)} (pessoa)`,
    },
    { label: "Categoria", value: categoryLabels[campaign.category] },
    { label: "Localidade", value: campaign.locality },
    {
      label: "Tipos de apoio aceitos",
      value: campaign.supportTypes
        .map((type) => supportTypeLabels[type])
        .join(", "),
    },
    { label: "Necessidade ou meta", value: campaign.goalDescription },
    {
      label: "Prazo",
      value: campaign.deadline
        ? campaign.deadline.toLocaleDateString("pt-BR", { dateStyle: "long" })
        : "Sem prazo definido",
    },
    { label: "Instruções de apoio", value: campaign.supportInstructions },
  ];

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-10 border-l-4 border-brand-400 pl-5">
        <p className="mb-1 text-sm font-medium text-brand-600">
          <Link href="/campanhas" className="hover:underline">
            Campanhas
          </Link>{" "}
          / Detalhes
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900">
          {campaign.title}
        </h1>
        <p className="mt-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${status.className}`}
          >
            {status.label}
          </span>
        </p>
      </div>

      {canViewManagement && campaign.status === "DRAFT" && !canManage && (
        <div className="mb-8 rounded-2xl bg-stone-50 p-5 text-sm text-stone-600 ring-1 ring-stone-100">
          Este é um rascunho: a campanha ainda não foi enviada para revisão e
          não aparece publicamente.
        </div>
      )}

      {canViewManagement &&
        campaign.status === "PENDING_REVIEW" &&
        !isModerator && (
          <div className="mb-8 rounded-2xl bg-amber-50 p-5 text-sm text-amber-800 ring-1 ring-amber-200">
            A campanha está na fila de revisão da moderação. Os responsáveis
            serão notificados com a decisão.
          </div>
        )}

      {canViewManagement &&
        (campaign.status === "REJECTED" || campaign.status === "SUSPENDED") &&
        campaign.statusReason && (
          <div className="mb-8 rounded-2xl bg-rose-50 p-5 text-sm text-rose-700 ring-1 ring-rose-200">
            <p className="font-semibold">
              {campaign.status === "REJECTED"
                ? "Rejeitada na revisão"
                : "Suspensa pela moderação"}
            </p>
            <p className="mt-1">Motivo: {campaign.statusReason}</p>
          </div>
        )}

      {pendingChange && (canManage || isModerator) && (
        <div className="mb-8 rounded-2xl bg-amber-50 p-5 text-sm text-amber-800 ring-1 ring-amber-200">
          <p className="font-semibold">Alteração aguardando revisão</p>
          <p className="mt-1">
            Há uma alteração material proposta para esta campanha. A versão
            pública abaixo permanece como está até a moderação decidir.
          </p>
          {isModerator && (
            <Link
              href={`/moderacao/alteracoes/${pendingChange.id}`}
              className="mt-2 inline-block font-semibold text-brand-700 underline"
            >
              Revisar alteração
            </Link>
          )}
        </div>
      )}

      {isDiscoverable && (
        <div className="mb-8 flex items-center justify-between gap-4 rounded-2xl bg-brand-50 p-5 ring-1 ring-brand-100">
          <div>
            <p className="text-sm font-semibold text-brand-800">
              Apoios confirmados
            </p>
            <p className="text-xs text-brand-700">
              Progresso agregado e público da campanha.
            </p>
          </div>
          <p className="font-display text-2xl font-bold text-brand-700">
            {confirmedCount}
          </p>
        </div>
      )}

      {campaign.status === "PUBLISHED" && !canManage && (
        <div className="mb-8">
          {!person ? (
            <div className="flex flex-col items-start gap-3 rounded-3xl bg-brand-50 p-6 ring-1 ring-brand-100">
              <p className="text-sm font-semibold text-brand-800">
                Quer ajudar esta campanha?
              </p>
              <p className="text-sm text-brand-700">
                Entre na sua conta para registrar uma oferta de apoio. Visitantes
                não podem oferecer apoio.
              </p>
              <Link
                href="/entrar"
                className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-200 transition hover:from-brand-600 hover:to-brand-700"
              >
                Entrar para apoiar
              </Link>
            </div>
          ) : myPendingOffer ? (
            <div className="rounded-3xl bg-white p-6 shadow-xl shadow-stone-200/60 ring-1 ring-stone-100">
              <h2 className="mb-1 font-display text-lg font-bold text-stone-900">
                Sua oferta de apoio
              </h2>
              <p className="mb-4 text-sm text-stone-500">
                Aguardando a equipe da campanha entrar em contato.
              </p>
              <dl className="mb-5 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-stone-500">Tipo</dt>
                  <dd className="font-medium text-stone-800">
                    {supportOfferTypeLabels[myPendingOffer.type]}
                  </dd>
                </div>
                {myPendingOffer.type === "ITEM_DONATION" ? (
                  <>
                    <div className="flex justify-between gap-3">
                      <dt className="text-stone-500">Item</dt>
                      <dd className="font-medium text-stone-800">
                        {myPendingOffer.itemName} ({myPendingOffer.itemQuantity})
                      </dd>
                    </div>
                    {myPendingOffer.itemCondition && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-stone-500">Condição</dt>
                        <dd className="font-medium text-stone-800">
                          {myPendingOffer.itemCondition}
                        </dd>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex justify-between gap-3">
                      <dt className="text-stone-500">Disponibilidade</dt>
                      <dd className="font-medium text-stone-800">
                        {myPendingOffer.availability}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-stone-500">Tipo de ajuda</dt>
                      <dd className="font-medium text-stone-800">
                        {myPendingOffer.helpType}
                      </dd>
                    </div>
                  </>
                )}
                {myPendingOffer.publiclyAnonymous && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-stone-500">Visibilidade</dt>
                    <dd className="font-medium text-stone-800">
                      Anônima publicamente
                    </dd>
                  </div>
                )}
              </dl>
              <CancelarApoio offerId={myPendingOffer.id} />
            </div>
          ) : acceptedOfferTypes.length > 0 ? (
            <FormularioApoio
              campaignId={campaign.id}
              acceptedTypes={acceptedOfferTypes}
            />
          ) : (
            <p className="rounded-2xl border border-stone-100 p-6 text-center text-sm text-stone-500">
              Esta campanha não aceita ofertas de apoio pela plataforma.
            </p>
          )}
        </div>
      )}

      <div className="mb-8 rounded-2xl bg-stone-50 p-5 text-stone-700 ring-1 ring-stone-100">
        <p className="mb-1 text-sm font-semibold text-stone-900">Descrição</p>
        <p className="whitespace-pre-line text-sm leading-relaxed">
          {campaign.description}
        </p>
      </div>

      <dl className="mb-8 divide-y divide-stone-100 rounded-2xl border border-stone-100">
        {fields.map((field) => (
          <div
            key={field.label}
            className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:justify-between"
          >
            <dt className="shrink-0 text-sm text-stone-500">{field.label}</dt>
            <dd className="text-sm font-medium text-stone-800 sm:text-right">
              {field.value}
            </dd>
          </div>
        ))}
      </dl>

      {campaign.latitude !== null && campaign.longitude !== null && (
        <div className="mb-8">
          <h2 className="mb-3 font-display text-lg font-bold text-stone-900">
            Localização aproximada
          </h2>
          <MapView latitude={campaign.latitude} longitude={campaign.longitude} />
          <p className="mt-2 text-xs text-stone-400">
            Pin público aproximado — não representa endereço exato.
          </p>
        </div>
      )}

      {canViewManagement && campaign.logisticsDetails && (
        <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
          <p className="mb-1 text-sm font-semibold text-amber-800">
            Ponto logístico (privado)
          </p>
          <p className="whitespace-pre-line text-sm text-amber-900">
            {campaign.logisticsDetails}
          </p>
          <p className="mt-2 text-xs text-amber-700">
            Visível apenas para envolvidos na campanha e moderação — nunca na
            página pública.
          </p>
        </div>
      )}

      {showActions && (
        <div className="mt-10 border-t border-stone-100 pt-8">
          <h2 className="mb-4 font-display text-lg font-bold text-stone-900">
            Ações da campanha
          </h2>
          <div className="flex flex-col gap-4">
            {showQuickRow && (
              <div className="flex flex-wrap gap-3">
                {showEditLink && (
                  <Link
                    href={`/campanhas/${campaign.id}/editar`}
                    className="rounded-xl border-2 border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:border-brand-400 hover:text-brand-700"
                  >
                    Editar campanha
                  </Link>
                )}
                {showClose && <EncerrarCampanha campaignId={campaign.id} />}
                {showSuspend && <SuspenderCampanha campaignId={campaign.id} />}
              </div>
            )}
            {showSubmit && (
              <EnviarParaRevisao
                campaignId={campaign.id}
                isResubmission={campaign.status === "REJECTED"}
              />
            )}
            {showDecision && <DecisaoRevisao campaignId={campaign.id} />}
          </div>
        </div>
      )}
    </section>
  );
}

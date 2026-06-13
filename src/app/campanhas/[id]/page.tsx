import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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

export const metadata: Metadata = {
  title: "Campanha — Solydaries",
};

export default async function CampanhaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  // Encerramento preguiçoso por prazo antes de carregar a campanha.
  await closeExpiredCampaigns();

  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      ownerPerson: { select: { name: true } },
      ownerOrganization: { select: { id: true, name: true } },
      createdBy: { select: { name: true } },
    },
  });
  if (!campaign) notFound();

  // Antes da publicação, só quem está envolvido enxerga a campanha: dono,
  // criador, representante da organização dona — ou a moderação, que
  // precisa enxergar campanhas nas filas (ex.: sem movimentação).
  const isOwnerPerson = campaign.ownerPersonId === person.id;
  const isCreator = campaign.createdById === person.id;
  let isOrgRepresentative = false;
  if (campaign.ownerOrganizationId) {
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
  if (
    !isOwnerPerson &&
    !isCreator &&
    !isOrgRepresentative &&
    !canModerate(person)
  ) {
    notFound();
  }

  const canManage = await canManageCampaign(person, campaign);
  const isModerator = canModerate(person);
  const status = campaignStatusInfo[campaign.status];

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
    {
      label: "Criada por",
      value: `${formatPersonName(campaign.createdBy.name)} em ${campaign.createdAt.toLocaleDateString("pt-BR")}`,
    },
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

      {campaign.status === "DRAFT" && !canManage && (
        <div className="mb-8 rounded-2xl bg-stone-50 p-5 text-sm text-stone-600 ring-1 ring-stone-100">
          Este é um rascunho: a campanha ainda não foi enviada para revisão e
          não aparece publicamente.
        </div>
      )}

      {campaign.status === "PENDING_REVIEW" && !isModerator && (
        <div className="mb-8 rounded-2xl bg-amber-50 p-5 text-sm text-amber-800 ring-1 ring-amber-200">
          A campanha está na fila de revisão da moderação. Os responsáveis
          serão notificados com a decisão.
        </div>
      )}

      {(campaign.status === "REJECTED" || campaign.status === "SUSPENDED") &&
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

      <div className="mb-8 flex flex-col gap-4">
        {canManage &&
          (campaign.status === "DRAFT" ||
            campaign.status === "REJECTED") && (
            <EnviarParaRevisao
              campaignId={campaign.id}
              isResubmission={campaign.status === "REJECTED"}
            />
          )}
        {isModerator && campaign.status === "PENDING_REVIEW" && (
          <DecisaoRevisao campaignId={campaign.id} />
        )}
        {campaign.status === "PUBLISHED" && (canManage || isModerator) && (
          <div className="flex flex-wrap gap-3">
            {canManage && <EncerrarCampanha campaignId={campaign.id} />}
            {isModerator && <SuspenderCampanha campaignId={campaign.id} />}
          </div>
        )}
      </div>

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

      {campaign.logisticsDetails && (
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
    </section>
  );
}

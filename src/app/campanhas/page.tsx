import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { closeExpiredCampaigns } from "@/lib/campaign-lifecycle";
import {
  campaignStatusInfo,
  categoryLabels,
  selectableSupportTypes,
  supportTypeLabels,
} from "@/lib/campaign-labels";
import { formatPersonName } from "@/lib/format";
import { CampaignsMap } from "@/components/map/campaigns-map";
import { inputClassName, labelClassName } from "@/components/form-field";

export const metadata: Metadata = {
  title: "Campanhas — Solydaries",
};

// Status visíveis na descoberta pública. Rascunho, em revisão, rejeitada e
// suspensa nunca aparecem aqui.
const PUBLIC_STATUSES = ["PUBLISHED", "CLOSED"] as const;

function firstParam(value: string | string[] | undefined) {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.trim() ? v.trim() : undefined;
}

export default async function CampanhasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Encerra campanhas vencidas antes de listar, para não exibir como ativas.
  await closeExpiredCampaigns();

  const params = await searchParams;
  const locality = firstParam(params.localidade);
  const category = firstParam(params.categoria);
  const supportType = firstParam(params.tipo);
  const statusFilter = firstParam(params.status);
  const owner = firstParam(params.responsavel);

  const where: Prisma.CampaignWhereInput = {
    status:
      statusFilter === "PUBLISHED" || statusFilter === "CLOSED"
        ? statusFilter
        : { in: [...PUBLIC_STATUSES] },
  };
  if (locality) where.locality = { contains: locality, mode: "insensitive" };
  if (category && category in categoryLabels) {
    where.category = category as Prisma.CampaignWhereInput["category"];
  }
  if (supportType && selectableSupportTypes.includes(supportType as never)) {
    where.supportTypes = { has: supportType as never };
  }
  if (owner) {
    where.OR = [
      { ownerPerson: { is: { name: { contains: owner, mode: "insensitive" } } } },
      {
        ownerOrganization: {
          is: { name: { contains: owner, mode: "insensitive" } },
        },
      },
    ];
  }

  const campaigns = await prisma.campaign.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      ownerPerson: { select: { name: true } },
      ownerOrganization: { select: { name: true } },
    },
  });

  const pins = campaigns
    .filter((c) => c.latitude !== null && c.longitude !== null)
    .map((c) => ({
      id: c.id,
      title: c.title,
      locality: c.locality,
      latitude: c.latitude as number,
      longitude: c.longitude as number,
    }));

  const hasFilters = Boolean(
    locality || category || supportType || statusFilter || owner
  );

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-8 border-l-4 border-brand-400 pl-5">
        <p className="mb-1 text-sm font-medium text-brand-600">Descobrir</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900">
          Campanhas publicadas
        </h1>
        <p className="mt-2 max-w-xl text-stone-500">
          Encontre campanhas por localidade, categoria, tipo de apoio e
          responsável — na lista ou no mapa.
        </p>
      </div>

      <form
        method="get"
        className="mb-8 grid gap-4 rounded-2xl border border-stone-100 p-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div>
          <label htmlFor="localidade" className={labelClassName}>
            Localidade
          </label>
          <input
            id="localidade"
            name="localidade"
            type="text"
            defaultValue={locality ?? ""}
            placeholder="Cidade/UF"
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="categoria" className={labelClassName}>
            Categoria
          </label>
          <select
            id="categoria"
            name="categoria"
            defaultValue={category ?? ""}
            className={inputClassName}
          >
            <option value="">Todas</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tipo" className={labelClassName}>
            Tipo de apoio
          </label>
          <select
            id="tipo"
            name="tipo"
            defaultValue={supportType ?? ""}
            className={inputClassName}
          >
            <option value="">Todos</option>
            {selectableSupportTypes.map((value) => (
              <option key={value} value={value}>
                {supportTypeLabels[value]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className={labelClassName}>
            Situação
          </label>
          <select
            id="status"
            name="status"
            defaultValue={statusFilter ?? ""}
            className={inputClassName}
          >
            <option value="">Publicadas e encerradas</option>
            <option value="PUBLISHED">Apenas publicadas</option>
            <option value="CLOSED">Apenas encerradas</option>
          </select>
        </div>
        <div>
          <label htmlFor="responsavel" className={labelClassName}>
            Responsável
          </label>
          <input
            id="responsavel"
            name="responsavel"
            type="text"
            defaultValue={owner ?? ""}
            placeholder="Pessoa ou organização"
            className={inputClassName}
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-200 transition hover:from-brand-600 hover:to-brand-700"
          >
            Filtrar
          </button>
          {hasFilters && (
            <Link
              href="/campanhas"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-stone-500 hover:text-stone-700"
            >
              Limpar
            </Link>
          )}
        </div>
      </form>

      {pins.length > 0 && (
        <div className="mb-8">
          <CampaignsMap pins={pins} />
        </div>
      )}

      <p className="mb-4 text-sm text-stone-500">
        {campaigns.length}{" "}
        {campaigns.length === 1
          ? "campanha encontrada"
          : "campanhas encontradas"}
      </p>

      {campaigns.length === 0 ? (
        <p className="rounded-2xl border border-stone-100 p-8 text-center text-stone-500">
          Nenhuma campanha corresponde aos filtros.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {campaigns.map((campaign) => {
            const status = campaignStatusInfo[campaign.status];
            const ownerName = campaign.ownerOrganization
              ? campaign.ownerOrganization.name
              : formatPersonName(campaign.ownerPerson?.name ?? "");
            return (
              <li key={campaign.id}>
                <Link
                  href={`/campanhas/${campaign.id}`}
                  className="flex h-full flex-col gap-2 rounded-2xl border border-stone-100 p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display font-bold text-stone-900">
                      {campaign.title}
                    </h2>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-stone-500">{ownerName}</p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                      {categoryLabels[campaign.category]}
                    </span>
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                      📍 {campaign.locality}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

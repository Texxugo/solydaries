import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import { formatPersonName } from "@/lib/format";

export const metadata: Metadata = {
  title: "Painel — Solydaries",
};

export default async function PainelPage() {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  const latestValidation = await prisma.personValidationRequest.findFirst({
    where: { personId: person.id },
    orderBy: { createdAt: "desc" },
    select: { status: true },
  });

  const validationStatus = person.validatedAt
    ? { text: "Conta validada ✓", tone: "text-brand-700" }
    : latestValidation?.status === "PENDING"
      ? { text: "Validação em análise", tone: "text-amber-600" }
      : latestValidation?.status === "REJECTED"
        ? { text: "Validação rejeitada — você pode reenviar", tone: "text-rose-600" }
        : { text: "Você ainda não solicitou validação", tone: "text-stone-500" };

  // Organizações que a pessoa representa (para campanhas em nome delas).
  const representedOrgIds = (
    await prisma.organizationMember.findMany({
      where: { personId: person.id, role: "REPRESENTATIVE" },
      select: { organizationId: true },
    })
  ).map((m) => m.organizationId);

  // Campanhas que a pessoa gerencia (dona pessoa ou representante da org dona).
  const managedCampaigns = await prisma.campaign.findMany({
    where: {
      OR: [
        { ownerPersonId: person.id },
        { ownerOrganizationId: { in: representedOrgIds } },
      ],
    },
    select: { id: true },
  });
  const managedCampaignIds = managedCampaigns.map((c) => c.id);

  const [myCampaignsCount, pendingToDecide, myOffersCount] = await Promise.all([
    // "Minhas campanhas" inclui também as que a pessoa apenas criou.
    prisma.campaign.count({
      where: {
        OR: [
          { ownerPersonId: person.id },
          { ownerOrganizationId: { in: representedOrgIds } },
          { createdById: person.id },
        ],
      },
    }),
    prisma.supportOffer.count({
      where: { campaignId: { in: managedCampaignIds }, status: "PENDING" },
    }),
    prisma.supportOffer.count({ where: { donorId: person.id } }),
  ]);

  const cards = [
    {
      label: "Minhas campanhas",
      value: myCampaignsCount,
      hint: "Campanhas que você criou ou gerencia.",
      href: "/minhas-campanhas",
      cta: "Ver campanhas",
      highlight: false,
    },
    {
      label: "Apoios aguardando decisão",
      value: pendingToDecide,
      hint: "Ofertas recebidas para confirmar ou recusar.",
      href: "/minhas-campanhas",
      cta: "Gerenciar",
      highlight: pendingToDecide > 0,
    },
    {
      label: "Meus apoios",
      value: myOffersCount,
      hint: "Ofertas de apoio que você registrou.",
      href: "/meus-apoios",
      cta: "Ver apoios",
      highlight: false,
    },
  ];

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-10 border-l-4 border-brand-400 pl-5">
        <p className="mb-1 text-sm font-medium text-brand-600">
          Sua área protegida
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900">
          Olá, {formatPersonName(person.name)}!
        </h1>
        <p className="mt-2 max-w-xl text-stone-500">
          Acompanhe suas campanhas e apoios por aqui.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`flex flex-col rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${
              card.highlight
                ? "border-amber-200 bg-amber-50"
                : "border-stone-100"
            }`}
          >
            <span className="text-sm font-medium text-stone-500">
              {card.label}
            </span>
            <span
              className={`mt-1 font-display text-3xl font-bold ${
                card.highlight ? "text-amber-700" : "text-stone-900"
              }`}
            >
              {card.value}
            </span>
            <span className="mt-1 text-xs text-stone-400">{card.hint}</span>
            <span className="mt-3 text-sm font-semibold text-brand-700">
              {card.cta} →
            </span>
          </Link>
        ))}
      </div>

      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-stone-100 px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-stone-700">
            Validação de Pessoa
          </p>
          <p className={`text-sm ${validationStatus.tone}`}>
            {validationStatus.text}
          </p>
        </div>
        <Link
          href="/validacao"
          className="shrink-0 text-sm font-semibold text-brand-700 underline"
        >
          {person.validatedAt ? "Ver detalhes" : "Solicitar validação"}
        </Link>
      </div>
    </section>
  );
}

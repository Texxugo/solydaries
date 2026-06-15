import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import { canModerate } from "@/lib/authz";
import { formatPersonName } from "@/lib/format";
import { supportOfferTypeLabels } from "@/lib/support-offer-labels";
import { ResolverDenuncia } from "./resolver-denuncia";

export const metadata: Metadata = {
  title: "Denúncia — Solydaries",
};

export default async function DenunciaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");
  if (!canModerate(person)) redirect("/painel");

  const { id } = await params;
  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      reporter: { select: { name: true } },
      resolvedBy: { select: { name: true } },
      campaign: { select: { id: true, title: true, description: true, status: true } },
      organizationPost: {
        select: {
          content: true,
          status: true,
          organization: { select: { id: true, name: true } },
        },
      },
      supportOffer: {
        select: {
          type: true,
          status: true,
          contact: true,
          campaign: { select: { id: true, title: true } },
          donor: { select: { name: true } },
        },
      },
    },
  });
  if (!report) notFound();

  const isOpen = report.status === "OPEN";

  let targetTitle = "Conteúdo removido";
  let targetBody: string | null = null;
  let targetLink: string | null = null;
  let upholdLabel = "";

  if (report.campaign) {
    targetTitle = `Campanha: ${report.campaign.title}`;
    targetBody = report.campaign.description;
    targetLink = `/campanhas/${report.campaign.id}`;
    upholdLabel =
      "A campanha será suspensa (sai do ar) e os responsáveis notificados.";
  } else if (report.organizationPost) {
    targetTitle = `Post de ${report.organizationPost.organization.name}`;
    targetBody = report.organizationPost.content;
    targetLink = `/organizacoes/${report.organizationPost.organization.id}`;
    upholdLabel = "O post será suspenso e a organização notificada.";
  } else if (report.supportOffer) {
    targetTitle = `Oferta de apoio (${supportOfferTypeLabels[report.supportOffer.type]})`;
    targetBody = `Doador: ${formatPersonName(report.supportOffer.donor.name)} · Campanha: ${report.supportOffer.campaign.title} · Contato: ${report.supportOffer.contact}`;
    targetLink = `/campanhas/${report.supportOffer.campaign.id}/apoios`;
    upholdLabel = "A oferta será recusada e o doador notificado.";
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-8 border-l-4 border-coral-400 pl-5">
        <p className="mb-1 text-sm font-medium text-coral-500">
          <Link href="/moderacao/denuncias" className="hover:underline">
            Denúncias
          </Link>{" "}
          / Detalhes
        </p>
        <h1 className="font-display text-2xl font-bold tracking-tight text-stone-900">
          Análise de denúncia
        </h1>
      </div>

      <div className="mb-6 rounded-2xl border border-stone-100 p-5">
        <p className="mb-1 text-sm font-semibold text-stone-900">
          Conteúdo denunciado
        </p>
        <p className="font-medium text-stone-800">{targetTitle}</p>
        {targetBody && (
          <p className="mt-1 whitespace-pre-line text-sm text-stone-500">
            {targetBody}
          </p>
        )}
        {targetLink && (
          <Link
            href={targetLink}
            className="mt-2 inline-block text-sm font-semibold text-brand-700 underline"
          >
            Abrir conteúdo
          </Link>
        )}
      </div>

      <div className="mb-8 rounded-2xl bg-rose-50 p-5 ring-1 ring-rose-100">
        <p className="text-sm font-semibold text-rose-800">
          Motivo da denúncia
        </p>
        <p className="mt-1 whitespace-pre-line text-sm text-rose-700">
          {report.reason}
        </p>
        <p className="mt-2 text-xs text-rose-600">
          Denunciada por {formatPersonName(report.reporter.name)} em{" "}
          {report.createdAt.toLocaleDateString("pt-BR", { dateStyle: "long" })}
        </p>
      </div>

      {isOpen ? (
        <ResolverDenuncia reportId={report.id} upholdLabel={upholdLabel} />
      ) : (
        <div className="rounded-2xl border border-stone-100 p-5">
          <p className="text-sm font-semibold text-stone-900">
            Denúncia {report.resolution === "UPHELD" ? "acatada" : "arquivada"}
          </p>
          {report.resolutionNote && (
            <p className="mt-1 text-sm text-stone-600">
              Motivo: {report.resolutionNote}
            </p>
          )}
          {report.resolvedBy && report.resolvedAt && (
            <p className="mt-2 text-xs text-stone-400">
              por {formatPersonName(report.resolvedBy.name)} em{" "}
              {report.resolvedAt.toLocaleDateString("pt-BR", {
                dateStyle: "long",
              })}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

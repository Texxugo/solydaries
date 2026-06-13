import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import { canManageCampaign } from "@/lib/campaign-authz";
import { campaignStatusInfo } from "@/lib/campaign-labels";
import type { CampanhaDefaults } from "../../campanha-campos";
import { EditarCampanhaForm } from "./editar-campanha-form";

export const metadata: Metadata = {
  title: "Editar campanha — Solydaries",
};

export default async function EditarCampanhaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign) notFound();
  if (!(await canManageCampaign(person, campaign))) notFound();

  const editable =
    campaign.status === "DRAFT" ||
    campaign.status === "REJECTED" ||
    campaign.status === "PUBLISHED";

  const pendingChange =
    campaign.status === "PUBLISHED"
      ? await prisma.campaignChangeRequest.findFirst({
          where: { campaignId: campaign.id, status: "PENDING" },
        })
      : null;

  const defaults: CampanhaDefaults = {
    title: campaign.title,
    description: campaign.description,
    category: campaign.category,
    locality: campaign.locality,
    supportTypes: campaign.supportTypes,
    latitude: campaign.latitude,
    longitude: campaign.longitude,
    logisticsDetails: campaign.logisticsDetails,
    goalDescription: campaign.goalDescription,
    deadline: campaign.deadline,
    supportInstructions: campaign.supportInstructions,
  };

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-10 border-l-4 border-brand-400 pl-5">
        <p className="mb-1 text-sm font-medium text-brand-600">
          <Link href={`/campanhas/${campaign.id}`} className="hover:underline">
            {campaign.title}
          </Link>{" "}
          / Editar
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900">
          Editar campanha
        </h1>
        <p className="mt-2 text-stone-500">
          Status atual: {campaignStatusInfo[campaign.status].label}.
        </p>
      </div>

      {!editable ? (
        <p className="rounded-2xl bg-stone-50 p-6 text-stone-600 ring-1 ring-stone-100">
          Campanhas em revisão, encerradas ou suspensas não podem ser editadas.
        </p>
      ) : pendingChange ? (
        <p className="rounded-2xl bg-amber-50 p-6 text-amber-800 ring-1 ring-amber-200">
          Já existe uma alteração aguardando revisão para esta campanha. Aguarde
          a decisão da moderação antes de propor novas mudanças.
        </p>
      ) : (
        <EditarCampanhaForm
          campaignId={campaign.id}
          defaults={defaults}
          isPublished={campaign.status === "PUBLISHED"}
        />
      )}
    </section>
  );
}

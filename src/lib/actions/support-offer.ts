"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import { campaignNotificationRecipients } from "@/lib/campaign-authz";
import { supportOfferTypeLabels } from "@/lib/support-offer-labels";
import {
  readSupportOfferFormData,
  supportOfferSchema,
  supportOfferWritableFields,
} from "@/lib/support-offer-form";

export type SupportOfferFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

const idSchema = z.string().min(1);

// Doador registra uma Oferta de Apoio numa campanha publicada. Visitantes não
// autenticados são mandados para o login; a oferta fica visível à gestão sem
// passar por moderação.
export async function createSupportOfferAction(
  _prevState: SupportOfferFormState,
  formData: FormData
): Promise<SupportOfferFormState> {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  const campaignId = idSchema.parse(formData.get("campaignId"));

  const parsed = supportOfferSchema.safeParse(readSupportOfferFormData(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const data = parsed.data;

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });
  if (!campaign || campaign.status !== "PUBLISHED") {
    return { error: "Só é possível apoiar campanhas publicadas." };
  }
  if (!campaign.supportTypes.includes(data.type)) {
    return { error: "Esta campanha não aceita esse tipo de apoio." };
  }

  // Um Doador pode manter no máximo uma oferta pendente por campanha; para
  // ofertar de novo, cancela a anterior.
  const existing = await prisma.supportOffer.findFirst({
    where: { campaignId, donorId: person.id, status: "PENDING" },
    select: { id: true },
  });
  if (existing) {
    return {
      error:
        "Você já tem uma oferta de apoio pendente nesta campanha. Cancele-a antes de registrar outra.",
    };
  }

  const offer = await prisma.supportOffer.create({
    data: {
      campaignId,
      donorId: person.id,
      ...supportOfferWritableFields(data),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: person.id,
      action: "support_offer.created",
      targetType: "SupportOffer",
      targetId: offer.id,
    },
  });

  // A oferta fica imediatamente visível à gestão; avisa os responsáveis.
  const recipients = await campaignNotificationRecipients(campaign);
  if (recipients.length > 0) {
    await prisma.notification.createMany({
      data: recipients.map((personId) => ({
        personId,
        title: "Nova oferta de apoio",
        body: `A campanha "${campaign.title}" recebeu uma oferta de ${supportOfferTypeLabels[data.type]}.`,
        href: `/campanhas/${campaign.id}`,
      })),
    });
  }

  revalidatePath(`/campanhas/${campaign.id}`);
  revalidatePath("/meus-apoios");
  return { success: true };
}

// Doador cancela a própria oferta pendente.
export async function cancelSupportOfferAction(
  _prevState: SupportOfferFormState,
  formData: FormData
): Promise<SupportOfferFormState> {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  const offerId = idSchema.parse(formData.get("offerId"));
  const offer = await prisma.supportOffer.findUnique({
    where: { id: offerId },
  });
  if (!offer || offer.donorId !== person.id) {
    return { error: "Oferta de apoio não encontrada." };
  }
  if (offer.status !== "PENDING") {
    return { error: "Somente ofertas pendentes podem ser canceladas." };
  }

  await prisma.$transaction([
    prisma.supportOffer.update({
      where: { id: offer.id },
      data: { status: "DONOR_CANCELLED" },
    }),
    prisma.auditLog.create({
      data: {
        actorId: person.id,
        action: "support_offer.cancelled",
        targetType: "SupportOffer",
        targetId: offer.id,
      },
    }),
  ]);

  revalidatePath(`/campanhas/${offer.campaignId}`);
  revalidatePath("/meus-apoios");
  return { success: true };
}

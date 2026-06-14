import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import {
  supportOfferStatusInfo,
  supportOfferTypeLabels,
} from "@/lib/support-offer-labels";

export const metadata: Metadata = {
  title: "Meus apoios — Solydaries",
};

export default async function MeusApoiosPage() {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  const offers = await prisma.supportOffer.findMany({
    where: { donorId: person.id },
    orderBy: { createdAt: "desc" },
    include: { campaign: { select: { id: true, title: true } } },
  });

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10 border-l-4 border-brand-400 pl-5">
        <p className="mb-1 text-sm font-medium text-brand-600">Apoios</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900">
          Meus apoios
        </h1>
        <p className="mt-2 max-w-xl text-stone-500">
          Ofertas de apoio que você registrou nas campanhas.
        </p>
      </div>

      {offers.length === 0 ? (
        <p className="rounded-2xl border border-stone-100 p-8 text-center text-stone-500">
          Você ainda não registrou nenhuma oferta de apoio.{" "}
          <Link href="/campanhas" className="font-semibold text-brand-700 underline">
            Descobrir campanhas
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-100">
          {offers.map((offer) => {
            const status = supportOfferStatusInfo[offer.status];
            return (
              <li key={offer.id}>
                <Link
                  href={`/campanhas/${offer.campaign.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-stone-50"
                >
                  <div>
                    <p className="font-medium text-stone-900">
                      {offer.campaign.title}
                    </p>
                    <p className="text-sm text-stone-500">
                      {supportOfferTypeLabels[offer.type]} ·{" "}
                      {offer.createdAt.toLocaleDateString("pt-BR", {
                        dateStyle: "long",
                      })}
                      {offer.publiclyAnonymous ? " · anônimo" : ""}
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

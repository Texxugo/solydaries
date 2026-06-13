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
          Em breve você vai acompanhar campanhas e apoios por aqui.
        </p>
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

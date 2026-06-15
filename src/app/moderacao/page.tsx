import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionPerson } from "@/lib/session";
import { canModerate } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Moderação — Solydaries",
};

const baseQueues = [
  {
    title: "Campanhas sem movimentação",
    text: "Campanhas paradas há mais de 30 dias, com donos já notificados.",
    status: "Abrir lista",
    href: "/moderacao/inativas",
  },
  {
    title: "Revisão de campanhas",
    text: "Campanhas submetidas aguardando revisão antes da publicação.",
    status: "Abrir fila de revisão",
    href: "/moderacao/revisao",
  },
  {
    title: "Alterações materiais",
    text: "Mudanças relevantes em campanhas já publicadas.",
    status: "Abrir fila de alterações",
    href: "/moderacao/alteracoes",
  },
  {
    title: "Relatos de resultado",
    text: "Relatos de resultado de campanhas encerradas aguardando aprovação.",
    status: "Disponível na issue 015",
  },
];

export default async function ModeracaoPage() {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");
  if (!canModerate(person)) redirect("/painel");

  const openReports = await prisma.report.count({ where: { status: "OPEN" } });

  // A fila de denúncias entra antes dos relatos, com a contagem em aberto.
  const queues = [
    ...baseQueues.slice(0, 3),
    {
      title: "Denúncias",
      text: "Denúncias de campanhas, posts e ofertas de apoio.",
      status:
        openReports > 0
          ? `Abrir fila (${openReports} em aberto)`
          : "Abrir fila de denúncias",
      href: "/moderacao/denuncias",
    },
    ...baseQueues.slice(3),
  ];

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-10 border-l-4 border-coral-400 pl-5">
        <p className="mb-1 text-sm font-medium text-coral-500">
          Área de moderação
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900">
          Moderação
        </h1>
        <p className="mt-2 max-w-xl text-stone-500">
          Filas de revisão de conteúdo da plataforma. Moderadores não acessam
          documentos de validação.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {queues.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-stone-100 p-5"
          >
            <h2 className="mb-1 font-display font-bold text-stone-900">
              {item.title}
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-stone-500">
              {item.text}
            </p>
            {item.href ? (
              <a
                href={item.href}
                className="text-sm font-semibold text-brand-700 underline"
              >
                {item.status}
              </a>
            ) : (
              <span className="text-sm font-medium text-stone-400">
                {item.status}
              </span>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

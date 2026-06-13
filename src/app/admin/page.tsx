import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionPerson } from "@/lib/session";
import { isAdmin } from "@/lib/authz";

export const metadata: Metadata = {
  title: "Administração — Solydaries",
};

const responsibilities = [
  {
    title: "Validações de Pessoas",
    text: "Analisar pedidos de validação de pessoas e seus documentos privados.",
    status: "Abrir fila de validações",
    href: "/admin/validacoes",
  },
  {
    title: "Validações de Organizações",
    text: "Analisar pedidos de validação de organizações e a documentação institucional.",
    status: "Abrir fila de organizações",
    href: "/admin/validacoes-organizacoes",
  },
  {
    title: "Moderação",
    text: "Administradores também podem atuar na fila de moderação de conteúdo.",
    status: "Acessar moderação",
    href: "/moderacao",
  },
];

export default async function AdminPage() {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");
  if (!isAdmin(person)) redirect("/painel");

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-10 border-l-4 border-amber-400 pl-5">
        <p className="mb-1 text-sm font-medium text-amber-600">
          Área administrativa
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900">
          Administração
        </h1>
        <p className="mt-2 max-w-xl text-stone-500">
          Processamento de pedidos de validação e acesso a documentos privados
          — exclusivo de administradores.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {responsibilities.map((item) => (
          <article
            key={item.title}
            className="flex flex-col rounded-2xl border border-stone-100 p-5"
          >
            <h2 className="mb-1 font-display font-bold text-stone-900">
              {item.title}
            </h2>
            <p className="mb-4 flex-1 text-sm leading-relaxed text-stone-500">
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

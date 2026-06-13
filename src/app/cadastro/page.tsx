import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionPerson } from "@/lib/session";
import { CadastroForm } from "./cadastro-form";

export const metadata: Metadata = {
  title: "Criar conta — Solydaries",
};

export default async function CadastroPage() {
  const person = await getSessionPerson();
  if (person) redirect("/painel");

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-brand-100 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-10 size-72 rounded-full bg-amber-100 blur-3xl"
      />
      <div className="relative mx-auto max-w-md px-6 py-16">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-display text-3xl font-extrabold tracking-tight">
            Criar conta
          </h1>
          <p className="text-stone-600">
            Crie sua conta de Pessoa para apoiar campanhas. Toda conta começa
            com o papel de <span className="font-semibold text-brand-700">doadora</span>.
          </p>
        </div>
        <CadastroForm />
      </div>
    </section>
  );
}

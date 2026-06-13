import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de uso — Solydaries",
};

const termos = [
  "Cada conta pertence a exatamente uma pessoa.",
  "A Solydaries não processa pagamentos: doações financeiras são realizadas fora da plataforma, sob responsabilidade das partes.",
  "Uma oferta de apoio é uma intenção, não um recebimento confirmado.",
  "Conteúdos publicados passam por revisão e podem ser suspensos pela moderação.",
  "O selo de validação indica verificação documental, não garantia de conduta futura.",
];

export default function TermosPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-2 font-display text-3xl font-extrabold tracking-tight">
        Termos de uso
      </h1>
      <p className="mb-8 text-stone-600">
        A Solydaries é uma plataforma acadêmica (TCC) que conecta pessoas e
        organizações a doadores. Ao criar uma conta, você concorda com as
        condições abaixo.
      </p>
      <ul className="space-y-3">
        {termos.map((termo) => (
          <li
            key={termo}
            className="flex gap-3 rounded-2xl bg-stone-50 p-4 leading-relaxed text-stone-700 ring-1 ring-stone-100"
          >
            <span className="text-brand-600">✔</span>
            {termo}
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-stone-500">
        Documento provisório do MVP — será revisado antes de qualquer uso fora
        do contexto acadêmico.
      </p>
    </section>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidade — Solydaries",
};

const regras = [
  "Sua senha é armazenada apenas como hash seguro — nunca em texto puro.",
  "Documentos de validação são privados e visíveis apenas para administradores.",
  "Detalhes de apoio são privados entre o doador e os responsáveis pela campanha.",
  "O apoio publicamente anônimo oculta sua identidade do público, mas permanece rastreável internamente para fins de auditoria.",
  "Métricas públicas de transparência são sempre agregadas e não expõem dados pessoais.",
];

export default function PrivacidadePage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-2 font-display text-3xl font-extrabold tracking-tight">
        Política de privacidade
      </h1>
      <p className="mb-8 text-stone-600">
        A Solydaries trata seus dados com o mínimo necessário para operar a
        plataforma.
      </p>
      <ul className="space-y-3">
        {regras.map((regra) => (
          <li
            key={regra}
            className="flex gap-3 rounded-2xl bg-stone-50 p-4 leading-relaxed text-stone-700 ring-1 ring-stone-100"
          >
            <span className="text-brand-600">🔒</span>
            {regra}
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

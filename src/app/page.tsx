import Link from "next/link";

const steps = [
  {
    emoji: "📣",
    color: "bg-brand-50 text-brand-700 ring-brand-100",
    title: "Quem precisa, pede",
    text: "Pessoas e organizações validadas criam campanhas com pedidos claros: itens ou trabalho voluntário.",
  },
  {
    emoji: "🤝",
    color: "bg-amber-50 text-amber-700 ring-amber-100",
    title: "Quem pode, apoia",
    text: "Doadores encontram campanhas por localidade, categoria e tipo de apoio — no mapa ou na lista.",
  },
  {
    emoji: "✅",
    color: "bg-rose-50 text-rose-600 ring-rose-100",
    title: "Tudo às claras",
    text: "Apoios confirmados, relatos de resultado revisados e métricas públicas de transparência.",
  },
];

const supportTypes = [
  { emoji: "📦", label: "Doação de itens" },
  { emoji: "🧤", label: "Trabalho voluntário" },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 size-80 rounded-full bg-brand-100 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-32 size-80 rounded-full bg-amber-100 blur-3xl"
        />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 pb-20 pt-24 text-center">
          <span className="rounded-full bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700 ring-1 ring-brand-200">
            ☀ Solidariedade organizada
          </span>
          <h1 className="font-display text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
            Do pedido de ajuda{" "}
            <span className="bg-gradient-to-r from-brand-500 via-brand-600 to-amber-500 bg-clip-text text-transparent">
              ao resultado
            </span>
            .
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-stone-600">
            A Solydaries conecta pessoas e organizações validadas a doadores
            dispostos a ajudar com itens e trabalho voluntário — com revisão
            de campanhas, apoios confirmados e transparência em cada etapa.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/cadastro"
              className="rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-brand-200 transition hover:from-brand-600 hover:to-brand-700 hover:shadow-brand-300"
            >
              Quero ajudar
            </Link>
            <Link
              href="/entrar"
              className="rounded-full border-2 border-stone-200 px-8 py-3.5 font-semibold text-stone-700 transition hover:border-brand-400 hover:text-brand-700"
            >
              Já tenho conta
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {supportTypes.map((t) => (
              <span
                key={t.label}
                className="rounded-full bg-stone-100 px-4 py-1.5 text-sm font-medium text-stone-600"
              >
                {t.emoji} {t.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-stone-100 bg-stone-50/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="mb-12 text-center font-display text-3xl font-bold tracking-tight">
            Como a Solydaries funciona
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.title}
                className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-stone-100 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span
                  className={`mb-5 grid size-14 place-items-center rounded-2xl text-2xl ring-1 ${step.color}`}
                >
                  {step.emoji}
                </span>
                <h3 className="mb-2 font-display text-xl font-bold">
                  {step.title}
                </h3>
                <p className="leading-relaxed text-stone-600">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="mb-4 font-display text-3xl font-bold tracking-tight">
          Pronto para fazer parte?
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-stone-600">
          Crie sua conta gratuita — toda conta começa como doadora e pode
          solicitar validação para criar campanhas.
        </p>
        <Link
          href="/cadastro"
          className="inline-block rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-3.5 font-semibold text-stone-900 shadow-lg shadow-amber-200 transition hover:from-amber-500 hover:to-amber-600"
        >
          Criar minha conta ☀
        </Link>
      </section>
    </>
  );
}

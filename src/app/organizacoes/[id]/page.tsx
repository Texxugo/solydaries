import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";
import { formatPersonName } from "@/lib/format";
import { campaignStatusInfo, categoryLabels } from "@/lib/campaign-labels";
import { canModerate } from "@/lib/authz";
import { Denunciar } from "@/components/denunciar";
import { reportPostAction } from "@/lib/actions/report";
import { OrgValidacaoForm } from "./org-validacao-form";
import {
  NovoPostForm,
  OcultarPost,
  ReacaoCount,
  ReagirButton,
  SuspenderPost,
} from "./posts";

export const metadata: Metadata = {
  title: "Organização — Solydaries",
};

const statusInfo: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Em análise",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  APPROVED: {
    label: "Aprovada",
    className: "bg-brand-50 text-brand-700 ring-brand-200",
  },
  REJECTED: {
    label: "Rejeitada",
    className: "bg-rose-50 text-rose-600 ring-rose-200",
  },
  REVOKED: {
    label: "Revogada",
    className: "bg-stone-100 text-stone-600 ring-stone-200",
  },
};

const postStatusInfo: Record<string, { label: string; className: string }> = {
  HIDDEN: {
    label: "Oculto",
    className: "bg-stone-100 text-stone-600 ring-stone-200",
  },
  SUSPENDED: {
    label: "Suspenso",
    className: "bg-rose-50 text-rose-600 ring-rose-200",
  },
};

// Normaliza o site para um href clicável (aceita só http(s)).
function websiteHref(website: string) {
  if (/^https?:\/\//i.test(website)) return website;
  return `https://${website}`;
}

export default async function OrganizacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const person = await getSessionPerson();

  const { id } = await params;
  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      members: {
        include: { person: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
      validationRequests: {
        orderBy: { createdAt: "desc" },
        include: { documents: { select: { id: true } } },
      },
      ownedCampaigns: {
        where: { status: { in: ["PUBLISHED", "CLOSED"] } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!organization) notFound();

  const membership = person
    ? await prisma.organizationMember.findUnique({
        where: {
          organizationId_personId: { organizationId: id, personId: person.id },
        },
      })
    : null;
  const isMember = membership !== null;
  const isRepresentative = membership?.role === "REPRESENTATIVE";
  const isModerator = person ? canModerate(person) : false;

  // Organização não validada não tem página pública: só membros acessam.
  if (!organization.validatedAt && !isMember) notFound();

  // Posts: visitantes/doadores só veem publicados; membros e moderação veem
  // todos (para gerenciar ocultos/suspensos).
  const posts = await prisma.organizationPost.findMany({
    where: {
      organizationId: id,
      ...(isMember || isModerator ? {} : { status: "PUBLISHED" }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
      _count: { select: { reactions: true } },
    },
  });
  const reactedPostIds = person
    ? new Set(
        (
          await prisma.postReaction.findMany({
            where: {
              donorId: person.id,
              postId: { in: posts.map((p) => p.id) },
            },
            select: { postId: true },
          })
        ).map((r) => r.postId)
      )
    : new Set<string>();

  const latest = organization.validationRequests[0];
  const canSubmit =
    isRepresentative &&
    organization.isActive &&
    !organization.validatedAt &&
    (!latest || latest.status === "REJECTED");

  const contacts = [
    organization.publicEmail && {
      label: "E-mail",
      value: organization.publicEmail,
      href: `mailto:${organization.publicEmail}`,
    },
    organization.phone && {
      label: "Telefone",
      value: organization.phone,
      href: `tel:${organization.phone.replace(/[^0-9+]/g, "")}`,
    },
    organization.website && {
      label: "Site",
      value: organization.website,
      href: websiteHref(organization.website),
      external: true,
    },
  ].filter(
    (
      c
    ): c is { label: string; value: string; href: string; external?: boolean } =>
      Boolean(c)
  );

  const initial = organization.name.trim().charAt(0).toUpperCase();

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {isMember && (
        <p className="mb-4 text-sm font-medium text-brand-600">
          <Link href="/organizacoes" className="hover:underline">
            ← Suas organizações
          </Link>
        </p>
      )}

      {/* Cabeçalho do perfil: capa + avatar + identidade. */}
      <div className="overflow-hidden rounded-3xl border border-stone-100 bg-white">
        {organization.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={organization.coverUrl}
            alt="Capa da organização"
            className="h-40 w-full object-cover sm:h-52"
          />
        ) : (
          <div className="h-40 w-full bg-gradient-to-r from-brand-100 to-amber-100 sm:h-52" />
        )}

        <div className="px-5 pb-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="-mt-12 size-24 shrink-0 overflow-hidden rounded-2xl ring-4 ring-white">
                {organization.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={organization.logoUrl}
                    alt={`Logo de ${organization.name}`}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="grid size-full place-items-center bg-gradient-to-br from-brand-400 to-brand-600 font-display text-3xl font-bold text-white">
                    {initial}
                  </div>
                )}
              </div>
              <div className="pb-1">
                <h1 className="font-display text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                  {organization.name}
                </h1>
                {organization.validatedAt && (
                  <span className="mt-1 inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
                    ✓ Selo de validação
                  </span>
                )}
              </div>
            </div>

            {isRepresentative && (
              <Link
                href={`/organizacoes/${organization.id}/editar`}
                className="rounded-xl border-2 border-stone-200 px-4 py-2 text-sm font-semibold text-stone-600 transition hover:border-brand-400 hover:text-brand-700"
              >
                Editar perfil
              </Link>
            )}
          </div>

          {contacts.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {contacts.map((contact) => (
                <a
                  key={contact.label}
                  href={contact.href}
                  target={contact.external ? "_blank" : undefined}
                  rel={contact.external ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:border-brand-300 hover:text-brand-700"
                >
                  {contact.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {!organization.validatedAt && isMember && (
        <div className="mt-6 rounded-2xl bg-stone-50 p-5 text-sm text-stone-600 ring-1 ring-stone-100">
          Esta organização ainda <strong>não está validada</strong>: ela não
          aparece publicamente e não pode criar campanhas em nome próprio.
        </div>
      )}

      {/* Corpo: Sobre (lateral) + feed de publicações. */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="flex flex-col gap-6">
          {(organization.description || contacts.length > 0) && (
            <div className="rounded-2xl border border-stone-100 bg-white p-5">
              <h2 className="mb-3 font-display text-lg font-bold text-stone-900">
                Sobre
              </h2>
              {organization.description && (
                <p className="whitespace-pre-line text-sm leading-relaxed text-stone-600">
                  {organization.description}
                </p>
              )}
              {contacts.length > 0 && (
                <dl className="mt-4 flex flex-col gap-2 border-t border-stone-100 pt-4 text-sm">
                  {contacts.map((contact) => (
                    <div key={contact.label} className="flex flex-col">
                      <dt className="text-xs text-stone-400">{contact.label}</dt>
                      <dd>
                        <a
                          href={contact.href}
                          target={contact.external ? "_blank" : undefined}
                          rel={
                            contact.external ? "noopener noreferrer" : undefined
                          }
                          className="font-medium text-brand-700 hover:underline"
                        >
                          {contact.value}
                        </a>
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-stone-100 bg-white p-5">
            <h2 className="mb-3 font-display text-lg font-bold text-stone-900">
              Campanhas
            </h2>
            {organization.ownedCampaigns.length === 0 ? (
              <p className="text-sm text-stone-500">
                Nenhuma campanha publicada ainda.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {organization.ownedCampaigns.map((campaign) => {
                  const status = campaignStatusInfo[campaign.status];
                  return (
                    <li key={campaign.id}>
                      <Link
                        href={`/campanhas/${campaign.id}`}
                        className="block rounded-xl border border-stone-100 p-3 transition hover:bg-stone-50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-medium text-stone-800">
                            {campaign.title}
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <span className="mt-1 block text-xs text-stone-400">
                          {categoryLabels[campaign.category]} ·{" "}
                          {campaign.locality}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {isMember && (
            <div className="rounded-2xl border border-stone-100 bg-white p-5">
              <h2 className="mb-3 font-display text-lg font-bold text-stone-900">
                Membros
              </h2>
              <ul className="flex flex-col gap-2.5">
                {organization.members.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="font-medium text-stone-800">
                      {formatPersonName(member.person.name)}
                    </span>
                    <span className="text-xs text-stone-400">
                      {member.role === "REPRESENTATIVE"
                        ? "Representante"
                        : "Membro"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <div className="flex flex-col gap-5">
          {isRepresentative && (
            <NovoPostForm organizationId={organization.id} />
          )}

          {posts.length === 0 ? (
            <p className="rounded-2xl border border-stone-100 bg-white p-8 text-center text-sm text-stone-500">
              Nenhuma publicação ainda.
            </p>
          ) : (
            posts.map((post) => {
              const badge = postStatusInfo[post.status];
              const showHide = isRepresentative && post.status !== "SUSPENDED";
              const showSuspend = isModerator && post.status !== "SUSPENDED";
              return (
                <article
                  key={post.id}
                  className="rounded-2xl border border-stone-100 bg-white p-5"
                >
                  <header className="mb-3 flex items-center gap-3">
                    <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-brand-400 to-brand-600 font-display text-sm font-bold text-white">
                      {organization.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={organization.logoUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        initial
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-stone-900">
                        {organization.name}
                      </p>
                      <p className="text-xs text-stone-400">
                        {post.createdAt.toLocaleDateString("pt-BR", {
                          dateStyle: "long",
                        })}
                      </p>
                    </div>
                    {badge && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    )}
                    {(showHide || showSuspend) && (
                      <details className="relative">
                        <summary className="grid size-7 cursor-pointer list-none place-items-center rounded-full text-stone-400 transition hover:bg-stone-100 [&::-webkit-details-marker]:hidden">
                          ⋯
                        </summary>
                        <div className="absolute right-0 z-10 mt-1 w-60 rounded-xl border border-stone-100 bg-white p-3 shadow-lg">
                          {showHide && (
                            <OcultarPost
                              postId={post.id}
                              hidden={post.status === "HIDDEN"}
                            />
                          )}
                          {showSuspend && (
                            <div className={showHide ? "mt-2" : ""}>
                              <SuspenderPost postId={post.id} />
                            </div>
                          )}
                        </div>
                      </details>
                    )}
                  </header>

                  <p className="whitespace-pre-line text-sm leading-relaxed text-stone-800">
                    {post.content}
                  </p>

                  {post.imageUrls.length > 0 && (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {post.imageUrls.map((url) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={url}
                          src={url}
                          alt="Imagem do post"
                          className="w-full rounded-xl object-cover"
                        />
                      ))}
                    </div>
                  )}

                  {post.videoUrl && (
                    <a
                      href={post.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline"
                    >
                      ▶ Assistir vídeo
                    </a>
                  )}

                  {post.status === "SUSPENDED" && post.statusReason && (
                    <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-600 ring-1 ring-rose-200">
                      Suspenso pela moderação. Motivo: {post.statusReason}
                    </p>
                  )}

                  <div className="mt-4 border-t border-stone-100 pt-3">
                    {post.status === "PUBLISHED" && person ? (
                      <ReagirButton
                        postId={post.id}
                        count={post._count.reactions}
                        reacted={reactedPostIds.has(post.id)}
                      />
                    ) : (
                      <ReacaoCount count={post._count.reactions} />
                    )}
                    {person && !isRepresentative && post.status === "PUBLISHED" && (
                      <div className="mt-3">
                        <Denunciar
                          action={reportPostAction}
                          idName="postId"
                          idValue={post.id}
                        />
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {/* Seção interna de validação: visível apenas para membros. */}
      {isMember &&
        (organization.validationRequests.length > 0 ||
          canSubmit ||
          !organization.validatedAt) && (
          <div className="mt-10 border-t border-stone-100 pt-8">
            {organization.validationRequests.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 font-display text-lg font-bold text-stone-900">
                  Validação da organização
                </h2>
                <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-100">
                  {organization.validationRequests.map((request) => {
                    const status = statusInfo[request.status];
                    return (
                      <li key={request.id} className="px-5 py-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm text-stone-500">
                              Enviada em{" "}
                              {request.createdAt.toLocaleDateString("pt-BR", {
                                dateStyle: "long",
                              })}{" "}
                              · {request.documents.length} documento(s)
                            </p>
                            {request.status === "REJECTED" &&
                              request.decisionReason && (
                                <p className="mt-1 text-sm text-rose-600">
                                  Motivo: {request.decisionReason}
                                </p>
                              )}
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {canSubmit && (
              <OrgValidacaoForm
                organizationId={organization.id}
                isResubmission={latest?.status === "REJECTED"}
              />
            )}

            {isRepresentative &&
              !organization.validatedAt &&
              latest?.status === "PENDING" && (
                <p className="rounded-2xl bg-amber-50 p-5 text-sm text-amber-800 ring-1 ring-amber-200">
                  A validação está em análise. Os representantes receberão uma
                  notificação com a decisão.
                </p>
              )}

            {!isRepresentative && !organization.validatedAt && (
              <p className="rounded-2xl bg-stone-50 p-5 text-sm text-stone-500 ring-1 ring-stone-100">
                Apenas representantes podem solicitar a validação da organização.
              </p>
            )}
          </div>
        )}
    </section>
  );
}

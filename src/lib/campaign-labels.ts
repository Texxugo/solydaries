import type {
  CampaignCategory,
  CampaignStatus,
  SupportType,
} from "@/generated/prisma/client";

export const categoryLabels: Record<CampaignCategory, string> = {
  FOOD: "Alimentos",
  CLOTHING: "Roupas e agasalhos",
  HEALTH: "Saúde",
  EDUCATION: "Educação",
  HOUSING: "Moradia",
  ANIMALS: "Animais",
  ENVIRONMENT: "Meio ambiente",
  OTHER: "Outros",
};

export const supportTypeLabels: Record<SupportType, string> = {
  ITEM_DONATION: "Doação de itens",
  VOLUNTEER: "Trabalho voluntário",
  // Mantido apenas para exibir dados antigos; não é mais selecionável.
  EXTERNAL_FINANCIAL: "Doação financeira externa",
};

// Tipos de apoio que podem ser escolhidos em novas campanhas. Doação
// financeira externa foi removida do formulário por decisão de produto.
export const selectableSupportTypes = ["ITEM_DONATION", "VOLUNTEER"] as const;

export const campaignStatusInfo: Record<
  CampaignStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Rascunho",
    className: "bg-stone-100 text-stone-600 ring-stone-200",
  },
  PENDING_REVIEW: {
    label: "Em revisão",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  REJECTED: {
    label: "Rejeitada",
    className: "bg-rose-50 text-rose-600 ring-rose-200",
  },
  PUBLISHED: {
    label: "Publicada",
    className: "bg-brand-50 text-brand-700 ring-brand-200",
  },
  CLOSED: {
    label: "Encerrada",
    className: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  SUSPENDED: {
    label: "Suspensa",
    className: "bg-stone-800 text-white ring-stone-800",
  },
};

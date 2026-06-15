import type {
  SupportOfferStatus,
  SupportOfferType,
} from "@/generated/prisma/client";

export const supportOfferTypeLabels: Record<SupportOfferType, string> = {
  ITEM_DONATION: "Doação de itens",
  VOLUNTEER: "Trabalho voluntário",
};

export const supportOfferStatusInfo: Record<
  SupportOfferStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Aguardando confirmação",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  CONFIRMED: {
    label: "Apoio confirmado",
    className: "bg-brand-50 text-brand-700 ring-brand-200",
  },
  DONOR_CANCELLED: {
    label: "Cancelado por você",
    className: "bg-stone-100 text-stone-600 ring-stone-200",
  },
  MANAGER_DECLINED: {
    label: "Recusado pela campanha",
    className: "bg-rose-50 text-rose-600 ring-rose-200",
  },
};

import { z } from "zod";

const SUPPORT_OFFER_TYPES = ["ITEM_DONATION", "VOLUNTEER"] as const;

// Trim em string opcional, convertendo "" em undefined para que os refinamentos
// de obrigatoriedade por tipo de apoio disparem corretamente.
const optionalText = (max: number, message: string) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    },
    z.string().max(max, message).optional()
  );

export const supportOfferSchema = z
  .object({
    type: z.enum(SUPPORT_OFFER_TYPES, "Escolha o tipo de apoio."),
    contact: z
      .string()
      .trim()
      .min(5, "Informe um contato para coordenação (telefone ou e-mail).")
      .max(200, "O contato pode ter no máximo 200 caracteres."),
    publiclyAnonymous: z.boolean(),
    // Doação de item
    itemName: optionalText(200, "O item pode ter no máximo 200 caracteres."),
    itemQuantity: optionalText(
      100,
      "A quantidade pode ter no máximo 100 caracteres."
    ),
    itemCondition: optionalText(
      300,
      "A condição pode ter no máximo 300 caracteres."
    ),
    coordinationPreference: optionalText(
      300,
      "A preferência de coordenação pode ter no máximo 300 caracteres."
    ),
    // Voluntariado
    availability: optionalText(
      300,
      "A disponibilidade pode ter no máximo 300 caracteres."
    ),
    helpType: optionalText(
      200,
      "O tipo de ajuda pode ter no máximo 200 caracteres."
    ),
    note: optionalText(1000, "A observação pode ter no máximo 1000 caracteres."),
  })
  .superRefine((data, ctx) => {
    if (data.type === "ITEM_DONATION") {
      if (!data.itemName) {
        ctx.addIssue({
          code: "custom",
          path: ["itemName"],
          message: "Informe o item que pretende doar.",
        });
      }
      if (!data.itemQuantity) {
        ctx.addIssue({
          code: "custom",
          path: ["itemQuantity"],
          message: "Informe a quantidade.",
        });
      }
    } else {
      if (!data.availability) {
        ctx.addIssue({
          code: "custom",
          path: ["availability"],
          message: "Informe sua disponibilidade.",
        });
      }
      if (!data.helpType) {
        ctx.addIssue({
          code: "custom",
          path: ["helpType"],
          message: "Informe o tipo de ajuda que pode oferecer.",
        });
      }
    }
  });

export type SupportOfferInput = z.infer<typeof supportOfferSchema>;

// Lê os campos do formulário em formato cru para validação. O checkbox de
// anonimato vem como "on" quando marcado.
export function readSupportOfferFormData(formData: FormData) {
  return {
    type: formData.get("type"),
    contact: formData.get("contact"),
    publiclyAnonymous: formData.get("publiclyAnonymous") === "on",
    itemName: formData.get("itemName")?.toString(),
    itemQuantity: formData.get("itemQuantity")?.toString(),
    itemCondition: formData.get("itemCondition")?.toString(),
    coordinationPreference: formData.get("coordinationPreference")?.toString(),
    availability: formData.get("availability")?.toString(),
    helpType: formData.get("helpType")?.toString(),
    note: formData.get("note")?.toString(),
  };
}

// Converte os dados validados nos campos persistidos, zerando os campos que não
// pertencem ao tipo de apoio escolhido.
export function supportOfferWritableFields(data: SupportOfferInput) {
  const isItem = data.type === "ITEM_DONATION";
  return {
    type: data.type,
    contact: data.contact,
    publiclyAnonymous: data.publiclyAnonymous,
    itemName: isItem ? (data.itemName ?? null) : null,
    itemQuantity: isItem ? (data.itemQuantity ?? null) : null,
    itemCondition: isItem ? (data.itemCondition ?? null) : null,
    coordinationPreference: isItem ? (data.coordinationPreference ?? null) : null,
    availability: isItem ? null : (data.availability ?? null),
    helpType: isItem ? null : (data.helpType ?? null),
    note: data.note ?? null,
  };
}

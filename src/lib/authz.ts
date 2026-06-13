import type { Person } from "@/generated/prisma/client";

export function isAdmin(person: Person) {
  return person.role === "ADMIN";
}

// Administradores também podem moderar (regra de domínio: "Administrators
// review validation requests and can also perform moderation").
export function canModerate(person: Person) {
  return person.role === "MODERATOR" || person.role === "ADMIN";
}

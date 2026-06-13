"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionPerson } from "@/lib/session";

export async function markNotificationsReadAction() {
  const person = await getSessionPerson();
  if (!person) redirect("/entrar");

  await prisma.notification.updateMany({
    where: { personId: person.id, readAt: null },
    data: { readAt: new Date() },
  });

  // O sino de notificações fica no layout, então revalida a árvore inteira.
  revalidatePath("/", "layout");
}

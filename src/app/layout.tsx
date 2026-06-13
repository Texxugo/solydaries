import type { Metadata } from "next";
import { Sora, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getSessionPerson } from "@/lib/session";
import { logoutAction } from "@/lib/actions/auth";
import { canModerate, isAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import {
  NotificationsBell,
  type NotificationItem,
} from "@/components/notifications-bell";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Solydaries",
  description:
    "Plataforma de campanhas solidárias: conecte quem precisa de apoio a quem pode ajudar.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const person = await getSessionPerson();

  let notificationItems: NotificationItem[] = [];
  let unreadCount = 0;
  if (person) {
    const notifications = await prisma.notification.findMany({
      where: { personId: person.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    notificationItems = notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      body: notification.body,
      href: notification.href,
      isRead: notification.readAt !== null,
      createdAtLabel: notification.createdAt.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }),
    }));
    unreadCount = notificationItems.filter((item) => !item.isRead).length;
  }

  return (
    <html
      lang="pt-BR"
      className={`${sora.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-stone-900">
        <header className="sticky top-0 z-40 border-b border-stone-100 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-xl font-bold tracking-tight"
            >
              <span
                aria-hidden
                className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-lg text-white shadow-md shadow-brand-200"
              >
                ☀
              </span>
              <span>
                Soly<span className="text-brand-600">daries</span>
              </span>
            </Link>
            <nav className="flex items-center gap-2 text-sm font-semibold">
              {person ? (
                <>
                  <Link
                    href="/painel"
                    className="rounded-full px-4 py-2 text-stone-600 transition hover:bg-brand-50 hover:text-brand-700"
                  >
                    Painel
                  </Link>
                  <Link
                    href="/campanhas"
                    className="rounded-full px-4 py-2 text-stone-600 transition hover:bg-brand-50 hover:text-brand-700"
                  >
                    Campanhas
                  </Link>
                  <Link
                    href="/organizacoes"
                    className="rounded-full px-4 py-2 text-stone-600 transition hover:bg-brand-50 hover:text-brand-700"
                  >
                    Organizações
                  </Link>
                  {canModerate(person) && (
                    <Link
                      href="/moderacao"
                      className="rounded-full px-4 py-2 text-stone-600 transition hover:bg-brand-50 hover:text-brand-700"
                    >
                      Moderação
                    </Link>
                  )}
                  {isAdmin(person) && (
                    <Link
                      href="/admin"
                      className="rounded-full px-4 py-2 text-stone-600 transition hover:bg-brand-50 hover:text-brand-700"
                    >
                      Administração
                    </Link>
                  )}
                  <NotificationsBell
                    items={notificationItems}
                    unreadCount={unreadCount}
                  />
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="cursor-pointer rounded-full border-2 border-stone-200 px-4 py-1.5 text-stone-600 transition hover:border-coral-400 hover:text-coral-500"
                    >
                      Sair
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/entrar"
                    className="rounded-full px-4 py-2 text-stone-600 transition hover:bg-brand-50 hover:text-brand-700"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/cadastro"
                    className="rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2 text-white shadow-md shadow-brand-200 transition hover:from-brand-600 hover:to-brand-700"
                  >
                    Criar conta
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-stone-100 bg-stone-50">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 py-8 text-center text-sm text-stone-500">
            <p className="font-display font-semibold text-stone-700">
              Solydaries
            </p>
            <p>
              Projeto acadêmico (TCC) — não processa pagamentos. Feito com{" "}
              <span className="text-coral-500">♥</span> para quem ajuda.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

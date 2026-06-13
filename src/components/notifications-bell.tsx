"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { markNotificationsReadAction } from "@/lib/actions/notifications";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  isRead: boolean;
  createdAtLabel: string;
};

export function NotificationsBell({
  items,
  unreadCount,
}: {
  items: NotificationItem[];
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={
          unreadCount > 0
            ? `Notificações (${unreadCount} não lidas)`
            : "Notificações"
        }
        aria-expanded={open}
        className="relative grid size-9 cursor-pointer place-items-center rounded-full text-stone-600 transition hover:bg-brand-50 hover:text-brand-700"
      >
        <svg
          aria-hidden
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-coral-400 px-1 text-[11px] font-bold leading-[18px] text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl bg-white shadow-xl shadow-stone-200/80 ring-1 ring-stone-100">
          <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
            <p className="font-display text-sm font-bold text-stone-900">
              Notificações
            </p>
            {unreadCount > 0 && (
              <form action={markNotificationsReadAction}>
                <button
                  type="submit"
                  className="cursor-pointer text-xs font-medium text-stone-500 underline hover:text-stone-700"
                >
                  Marcar como lidas
                </button>
              </form>
            )}
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-stone-400">
              Nenhuma notificação por enquanto.
            </p>
          ) : (
            <ul className="max-h-96 divide-y divide-stone-100 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className="px-4 py-3">
                  <div className="flex items-start gap-2.5">
                    {!item.isRead && (
                      <span
                        className="mt-1.5 size-2 shrink-0 rounded-full bg-coral-400"
                        aria-label="Não lida"
                      />
                    )}
                    <div>
                      <p
                        className={`text-sm ${
                          item.isRead
                            ? "font-medium text-stone-600"
                            : "font-semibold text-stone-900"
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-sm leading-snug text-stone-500">
                        {item.body}
                      </p>
                      <p className="mt-1 text-xs text-stone-400">
                        {item.createdAtLabel}
                        {item.href && (
                          <>
                            {" · "}
                            <Link
                              href={item.href}
                              onClick={() => setOpen(false)}
                              className="font-medium text-brand-700 underline"
                            >
                              Ver
                            </Link>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  Home,
  LifeBuoy,
  Lightbulb,
  Menu,
  Megaphone,
  Settings,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import type { Role } from "@/types/database";

const links = [
  { href: "/inicio", label: "Feed escolar", icon: Home },
  { href: "/espaco", label: "Espaço pedagógico", icon: BookOpen },
  { href: "/mural", label: "Mural informativo", icon: Megaphone },
  { href: "/tendencias", label: "Tendências", icon: Lightbulb },
  { href: "/suporte", label: "Canal de suporte", icon: LifeBuoy },
];

export function MobileMenu({
  username,
  role,
}: {
  username?: string | null;
  role?: Role;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      const firstFocusable =
        panelRef.current?.querySelector<HTMLElement>("button, a[href]");
      firstFocusable?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href]:not([tabindex="-1"])',
        ) ?? [],
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        className="grid size-11 place-items-center rounded-xl text-muted hover:bg-paper hover:text-brand lg:hidden"
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        aria-expanded={open}
      >
        <Menu className="size-5" />
      </button>
      <div
        className={`fixed inset-0 z-50 lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
        inert={!open}
      >
        <button
          className={`absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Fechar menu"
          tabIndex={open ? 0 : -1}
        />
        <aside
          ref={panelRef}
          className={`absolute inset-y-0 left-0 flex w-[min(86vw,320px)] flex-col bg-canvas p-5 shadow-2xl transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"}`}
          aria-label="Menu principal"
          aria-modal="true"
          role="dialog"
        >
          <div className="flex items-center justify-between">
            <BrandLogo href="/inicio" />
            <button
              className="grid size-11 place-items-center rounded-xl text-muted hover:bg-paper hover:text-brand"
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
            >
              <X className="size-5" />
            </button>
          </div>
          <nav className="mt-8 space-y-1" aria-label="Navegação principal">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold ${active ? "bg-paper text-brand shadow-quiet" : "text-muted hover:bg-paper hover:text-brand"}`}
                >
                  <Icon className="size-5" /> {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto space-y-1 border-t border-line pt-4">
            <Link
              href={`/perfil/${username ?? "me"}`}
              className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-muted hover:bg-paper hover:text-brand"
            >
              <UserRound className="size-5" /> Meu perfil
            </Link>
            <Link
              href="/notificacoes"
              className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-muted hover:bg-paper hover:text-brand"
            >
              <Bell className="size-5" /> Notificações
            </Link>
            <Link
              href="/configuracoes"
              className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-muted hover:bg-paper hover:text-brand"
            >
              <Settings className="size-5" /> Configurações
            </Link>
            {role && ["STAFF", "ADMIN"].includes(role) && (
              <Link
                href="/admin"
                className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-brand hover:bg-paper"
              >
                <ShieldCheck className="size-5" /> Administração
              </Link>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

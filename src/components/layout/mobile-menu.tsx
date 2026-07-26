"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
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
  useEffect(() => setOpen(false), [pathname]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
      <button
        className="grid size-11 place-items-center rounded-xl text-muted hover:bg-paper hover:text-brand lg:hidden"
        type="button"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-ink/40 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out data-[state=open]:fade-in lg:hidden motion-reduce:animate-none" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-[101] flex h-[100dvh] w-[min(86vw,320px)] flex-col overflow-y-auto border-r border-line bg-paper p-5 text-ink shadow-2xl outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left lg:hidden motion-reduce:animate-none" aria-describedby={undefined}>
              <Dialog.Title className="sr-only">Menu principal</Dialog.Title>
              <div className="flex items-center justify-between">
                <BrandLogo href="/inicio" />
                <Dialog.Close
                  className="grid size-11 place-items-center rounded-xl text-muted hover:bg-paper hover:text-brand"
                  type="button"
                  aria-label="Fechar menu"
                >
                  <X className="size-5" />
                </Dialog.Close>
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, LifeBuoy, ScrollText, Users } from "lucide-react";

const items = [
  ["/admin", "Visão geral", LayoutDashboard],
  ["/admin/usuarios", "Usuários", Users],
  ["/admin/publicacoes", "Publicações", FileText],
  ["/admin/alertas", "Suporte", LifeBuoy],
  ["/admin/logs", "Auditoria", ScrollText],
] as const;

export function AdminNav({ canManageUsers }: { canManageUsers: boolean }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Administração" className="flex gap-1 overflow-x-auto lg:flex-col">
      {items.map(([href, label, Icon]) => {
        if (!canManageUsers && (href === "/admin/usuarios" || href === "/admin/logs")) return null;
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            className={`flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${active ? "bg-brand text-white" : "text-muted hover:bg-brand-soft hover:text-brand"}`}
            href={href}
            key={href}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="size-4" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}

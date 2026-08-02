"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, LifeBuoy, Lightbulb, Megaphone } from "lucide-react";
import { motion } from "motion/react";

const items = [
  { href: "/inicio", label: "Início", icon: Home },
  { href: "/espaco", label: "Espaço", icon: BookOpen },
  { href: "/mural", label: "Mural", icon: Megaphone },
  { href: "/tendencias", label: "Tendências", icon: Lightbulb },
  { href: "/suporte", label: "Suporte", icon: LifeBuoy },
];

export function AppNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  if (mobile) {
    return (
      <nav
        aria-label="Navegação móvel"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-paper/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
      >
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              aria-current={active ? "page" : undefined}
              href={href}
              key={href}
              className={`relative flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-[color,transform] duration-150 active:scale-95 ${active ? "text-brand" : "text-muted"}`}
            >
              {active && (
                <motion.span
                  layoutId="mobile-navigation-active"
                  aria-hidden
                  className="absolute top-0 h-0.5 w-7 rounded-full bg-brand"
                />
              )}
              <Icon
                className={`size-5 transition-transform duration-150 ${active ? "-translate-y-0.5" : ""}`}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }
  return (
    <nav aria-label="Navegação principal" className="space-y-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            key={href}
            href={href}
            className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-[background-color,color,transform] duration-150 hover:translate-x-0.5 ${active ? "bg-paper text-brand shadow-quiet" : "text-muted hover:bg-paper hover:text-brand"}`}
          >
            {active && (
              <motion.span
                layoutId="desktop-navigation-active"
                aria-hidden
                className="absolute -left-5 h-6 w-0.5 rounded-full bg-brand"
              />
            )}
            <Icon className="size-5 transition-transform duration-150 group-hover:scale-110" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

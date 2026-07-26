import Link from "next/link";
import { Bell, Menu, Settings, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { UserPreferences } from "@/components/accessibility/user-preferences";
import { BrandLogo } from "@/components/ui/brand-logo";
import { AppNav } from "@/components/layout/app-nav";
export async function AppShell({ children }: { children: React.ReactNode }) {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  const { data: p } = user
    ? await db
        .from("profiles")
        .select(
          "username,full_name,avatar_url,role,theme,high_contrast,reduced_motion,font_scale",
        )
        .eq("id", user.id)
        .single()
    : { data: null };
  const { count } = user
    ? await db
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .is("read_at", null)
    : { count: 0 };
  return (
    <div
      data-theme={p?.theme}
      data-contrast={p?.high_contrast}
      data-motion={p?.reduced_motion}
      className="min-h-screen"
    >
      <UserPreferences fontScale={p?.font_scale ?? 1} />
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-canvas px-5 py-7 lg:flex lg:flex-col">
        <BrandLogo href="/inicio" className="mb-10 text-lg" />
        <AppNav />
        <div className="mt-auto border-t border-line pt-4">
          <Link
            href={`/perfil/${p?.username ?? "me"}`}
            className="flex items-center gap-3 rounded-xl p-2 hover:bg-paper"
          >
            <Avatar url={p?.avatar_url} name={p?.full_name} />
            <span className="min-w-0">
              <b className="block truncate text-sm">
                {p?.full_name || "Meu perfil"}
              </b>
              <small className="text-muted">{p?.role}</small>
            </span>
          </Link>
          {["STAFF", "ADMIN"].includes(p?.role || "") && (
            <Link
              href="/admin"
              className="mt-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-muted hover:bg-paper"
            >
              <ShieldCheck className="size-5" />
              Administração
            </Link>
          )}
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line/80 bg-canvas/95 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-1 lg:hidden">
            <Menu aria-hidden className="size-5 text-muted" />
            <BrandLogo href="/inicio" compact className="ml-1" />
            <span className="text-sm font-bold tracking-tight">
              ConectaCETEP
            </span>
          </div>
          <span className="hidden text-sm text-muted lg:block">
            CETEP · Itaberaba, Bahia
          </span>
          <div className="flex items-center gap-1">
            <Link
              href="/notificacoes"
              aria-label={`${count ?? 0} notificações não lidas`}
              className="relative grid size-11 place-items-center rounded-xl hover:bg-paper"
            >
              <Bell className="size-5" />
              {!!count && (
                <span className="absolute right-1.5 top-1.5 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
            <Link
              href="/configuracoes"
              aria-label="Configurações"
              className="grid size-11 place-items-center rounded-xl hover:bg-paper"
            >
              <Settings className="size-5" />
            </Link>
          </div>
        </header>
        <main
          id="conteudo"
          className="page-enter mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-4 py-6 pb-24 md:px-8 md:py-8 lg:pb-10"
        >
          {children}
        </main>
      </div>
      <AppNav mobile />
    </div>
  );
}

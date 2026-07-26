import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  ScrollText,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/login");
  const { data: p } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!p || !["STAFF", "ADMIN"].includes(p.role)) redirect("/acesso-negado");
  const items = [
    ["/admin", "Visão geral", LayoutDashboard],
    ["/admin/usuarios", "Usuários", Users],
    ["/admin/publicacoes", "Publicações", FileText],
    ["/admin/alertas", "Alertas", LifeBuoy],
    ["/admin/logs", "Auditoria", ScrollText],
  ] as const;
  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <b>Administração · ConectaCETEP</b>
          <Link href="/inicio" className="btn-ghost">
            <ArrowLeft className="size-4" />
            Voltar ao app
          </Link>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-7 px-4 py-7 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col">
          {items.map(([href, label, Icon]) => (
            <Link
              className="btn-ghost shrink-0 justify-start"
              href={href}
              key={href}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <main id="conteudo" className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

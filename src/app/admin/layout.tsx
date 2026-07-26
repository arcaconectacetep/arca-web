import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
export const metadata: Metadata = {
  title: "Administração",
  robots: { index: false, follow: false },
};
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
  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <b>Administração · ConectaARCA</b>
          <Link href="/inicio" className="btn-ghost">
            <ArrowLeft className="size-4" />
            Voltar ao app
          </Link>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[224px_1fr] lg:gap-8 lg:py-8">
        <aside className="card self-start p-2 lg:sticky lg:top-5">
          <AdminNav canManageUsers={p.role === "ADMIN"} />
        </aside>
        <main id="conteudo" className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { CalendarDays, FileText, Heart, Pencil } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { PageBack } from "@/components/ui/page-back";

const roleLabels: Record<string, string> = {
  STUDENT: "Estudante",
  TEACHER: "Professor(a)",
  STAFF: "Gestão",
  ADMIN: "Administrador(a)",
};

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  const { data: p } = await db
    .from("profiles")
    .select("*,courses(name)")
    .eq("username", username)
    .single();
  if (!p) notFound();
  const { data: ids, count: posts } = await db
    .from("posts")
    .select("id", { count: "exact" })
    .eq("author_id", p.id)
    .is("deleted_at", null)
    .is("hidden_at", null);
  const { count: likes } = ids?.length
    ? await db
        .from("post_likes")
        .select("post_id", { count: "exact", head: true })
        .in(
          "post_id",
          ids.map((x) => x.id),
        )
    : { count: 0 };
  return (
    <div className="mx-auto max-w-4xl">
      <PageBack />
      <section className="card overflow-hidden">
        <div className="relative h-24 overflow-hidden bg-brand-soft sm:h-32">
          <div className="absolute -left-10 top-1/2 h-px w-2/3 -rotate-6 bg-brand/25" />
          <div className="absolute -right-8 bottom-5 h-20 w-20 rounded-full border border-brand/15" />
        </div>
        <div className="px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="-mt-12 flex items-end justify-between gap-4">
            <Avatar url={p.avatar_url} name={p.full_name} size={96} />
            {user?.id === p.id && (
              <Link href="/configuracoes" className="btn-secondary mb-1">
                <Pencil className="size-4" />
                <span className="hidden sm:inline">Editar perfil</span>
                <span className="sm:hidden">Editar</span>
              </Link>
            )}
          </div>
          <div className="mt-4 min-w-0">
            <h1 className="break-words text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              {p.full_name}
            </h1>
            <p className="mt-1 text-sm text-muted sm:text-base">
              @{p.username} · {roleLabels[p.role] ?? "Membro da comunidade"}
            </p>
          </div>
          <p className="mt-5 max-w-2xl leading-7 text-ink/90">
            {p.bio || "Este perfil ainda não tem biografia."}
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            {p.courses?.name && <span>{p.courses.name}</span>}
            {p.class_name && <span>Turma {p.class_name}</span>}
            <span className="flex items-center gap-1">
              <CalendarDays className="size-4" />
              Desde{" "}
              {format(new Date(p.created_at), "MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </span>
          </div>
        </div>
      </section>
      <div className="card mt-4 grid grid-cols-2 divide-x divide-line overflow-hidden">
        <div className="p-4 sm:p-5">
          <FileText className="size-5 text-brand" />
          <strong className="mt-2 block text-2xl tabular-nums sm:text-3xl">
            {posts ?? 0}
          </strong>
          <span className="text-sm text-muted">publicações</span>
        </div>
        <div className="p-4 sm:p-5">
          <Heart className="size-5 text-brand" />
          <strong className="mt-2 block text-2xl tabular-nums sm:text-3xl">
            {likes ?? 0}
          </strong>
          <span className="text-sm text-muted">curtidas recebidas</span>
        </div>
      </div>
    </div>
  );
}

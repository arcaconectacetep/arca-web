import { notFound } from "next/navigation";
import { CalendarDays, FileText, GraduationCap, Heart, Pencil } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { labelFor, roleLabels } from "@/lib/labels";
import { formatAppMonthYear } from "@/lib/date";

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
      <section className="card overflow-hidden">
        <div className="h-1 bg-brand" aria-hidden />
        <div className="p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="shrink-0 rounded-full bg-paper p-1 shadow-quiet">
              <Avatar url={p.avatar_url} name={p.full_name} size={96} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="break-words text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                    {p.full_name}
                  </h1>
                  <p className="mt-1 text-sm text-muted sm:text-base">
                    @{p.username} · {labelFor(roleLabels, p.role)}
                  </p>
                </div>
                {user?.id === p.id && (
                  <Link href="/configuracoes" className="btn-secondary shrink-0">
                    <Pencil className="size-4" />
                    <span className="hidden sm:inline">Editar perfil</span>
                    <span className="sm:hidden">Editar</span>
                  </Link>
                )}
              </div>
              <p className="mt-5 max-w-2xl leading-7 text-ink/90">
                {p.bio || "Este perfil ainda não tem biografia."}
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm text-muted">
                {p.courses?.name && (
                  <span className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-canvas px-3">
                    <GraduationCap className="size-4" aria-hidden />
                    {p.courses.name}
                  </span>
                )}
                {p.class_name && (
                  <span className="inline-flex min-h-9 items-center rounded-lg bg-canvas px-3">
                    Turma {p.class_name}
                  </span>
                )}
                <span className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-canvas px-3">
                  <CalendarDays className="size-4" aria-hidden />
                  Desde {formatAppMonthYear(p.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-line bg-canvas/45">
          <div className="flex items-center gap-3 p-4 sm:px-7 sm:py-5">
            <FileText className="size-5 shrink-0 text-brand" aria-hidden />
            <p>
              <strong className="block text-xl leading-none tabular-nums">
                {posts ?? 0}
              </strong>
              <span className="mt-1 block text-xs text-muted">publicações</span>
            </p>
          </div>
          <div className="flex items-center gap-3 border-l border-line p-4 sm:px-7 sm:py-5">
            <Heart className="size-5 shrink-0 text-brand" aria-hidden />
            <p>
              <strong className="block text-xl leading-none tabular-nums">
                {likes ?? 0}
              </strong>
              <span className="mt-1 block text-xs text-muted">curtidas recebidas</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

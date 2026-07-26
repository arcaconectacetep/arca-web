import { notFound } from "next/navigation";
import { CalendarDays, FileText, Heart, Pencil } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { PageBack } from "@/components/ui/page-back";
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
      <PageBack />
      <section className="card overflow-hidden">
        <div className="h-28 bg-brand sm:h-36">
          <div className="flex h-full items-end px-5 sm:px-8">
            <div className="relative z-10 translate-y-1/2 rounded-full bg-paper p-1.5 shadow-quiet">
              <Avatar url={p.avatar_url} name={p.full_name} size={96} />
            </div>
          </div>
        </div>
        <div className="px-5 pb-6 pt-14 sm:px-8 sm:pb-8 sm:pt-16">
          {user?.id === p.id && (
            <div className="flex justify-end">
              <Link href="/configuracoes" className="btn-secondary">
                <Pencil className="size-4" />
                <span className="hidden sm:inline">Editar perfil</span>
                <span className="sm:hidden">Editar</span>
              </Link>
            </div>
          )}
          <div className={user?.id === p.id ? "mt-2 min-w-0" : "min-w-0"}>
            <h1 className="break-words text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              {p.full_name}
            </h1>
            <p className="mt-1 text-sm text-muted sm:text-base">
              @{p.username} · {labelFor(roleLabels, p.role)}
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
              {formatAppMonthYear(p.created_at)}
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

import { notFound } from "next/navigation";
import { CalendarDays, FileText, Heart } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const db = await createClient();
  const { data: p } = await db
    .from("profiles")
    .select("*,courses(name)")
    .eq("username", username)
    .single();
  if (!p) notFound();
  const [{ count: posts }, { data: ids }] = await Promise.all([
    db
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("author_id", p.id)
      .is("deleted_at", null),
    db.from("posts").select("id").eq("author_id", p.id),
  ]);
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
        <div className="h-28 bg-brand-soft">
          <div className="h-full w-1/3 bg-brand/10" />
        </div>
        <div className="px-5 pb-7 md:px-8">
          <div className="-mt-12 flex flex-wrap items-end gap-4">
            <Avatar url={p.avatar_url} name={p.full_name} size={96} />
            <div className="mb-1">
              <h1 className="text-3xl font-semibold">{p.full_name}</h1>
              <p className="text-muted">
                @{p.username} · {p.role}
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-2xl leading-7">
            {p.bio || "Este perfil ainda não tem biografia."}
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted">
            <span>{p.courses?.name}</span>
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
      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="card p-5">
          <FileText className="size-5 text-brand" />
          <strong className="mt-3 block text-3xl tabular-nums">
            {posts ?? 0}
          </strong>
          <span className="text-sm text-muted">publicações</span>
        </div>
        <div className="card p-5">
          <Heart className="size-5 text-brand" />
          <strong className="mt-3 block text-3xl tabular-nums">
            {likes ?? 0}
          </strong>
          <span className="text-sm text-muted">curtidas recebidas</span>
        </div>
      </div>
    </div>
  );
}

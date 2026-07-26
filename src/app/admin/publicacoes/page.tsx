import { createClient } from "@/lib/supabase/server";
import { PostToggle } from "@/components/admin/admin-actions";
export default async function Page() {
  const db = await createClient();
  const { data } = await db
    .from("posts")
    .select(
      "id,title,content,type,section,hidden_at,created_at,profiles!posts_author_id_fkey(full_name,username),post_reports(count)",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  return (
    <>
      <p className="eyebrow">Moderação</p>
      <h1 className="page-title mt-2">Publicações</h1>
      <div className="mt-6 space-y-3">
        {!data?.length ? (
          <div className="card p-8 text-center text-muted">
            Nenhuma publicação.
          </div>
        ) : (
          data.map((p) => (
            <article
              key={p.id}
              className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex gap-2">
                  <span className="badge">{p.section}</span>
                  {p.hidden_at && (
                    <span className="badge bg-danger/10 text-danger">
                      Oculta
                    </span>
                  )}
                </div>
                <h2 className="mt-2 truncate font-bold">
                  {p.title || p.content.slice(0, 80)}
                </h2>
                <p className="text-sm text-muted">
                  @{p.profiles?.[0]?.username} ·{" "}
                  {p.post_reports?.[0]?.count ?? 0} denúncia(s)
                </p>
              </div>
              <PostToggle id={p.id} hidden={!!p.hidden_at} />
            </article>
          ))
        )}
      </div>
    </>
  );
}

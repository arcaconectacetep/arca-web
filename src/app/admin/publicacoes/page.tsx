import { createClient } from "@/lib/supabase/server";
import { CommentToggle, PostToggle } from "@/components/admin/admin-actions";
import { labelFor, postSectionLabels, reportReasonLabels } from "@/lib/labels";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { ArrowUpRight, Flag, Search } from "lucide-react";
import { SelectField } from "@/components/ui/select-field";
import Link from "next/link";

const PAGE_SIZE = 20;
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; secao?: string; pagina?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.pagina || "1", 10) || 1);
  const search = (params.q || "").replace(/[^p{L}\p{N}\s@#_-]/gu, " ").trim().slice(0, 80);
  const section = Object.hasOwn(postSectionLabels, params.secao || "") ? params.secao! : "";
  const db = await createClient();
  let query = db
    .from("posts")
    .select(
      "id,title,content,type,section,hidden_at,created_at,profiles!posts_author_id_fkey(full_name,username),post_reports(count)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  if (section) query = query.eq("section", section);
  const [{ data, count }, { data: commentReports, count: commentReportCount }] = await Promise.all([
    query,
    db
      .from("comment_reports")
      .select(
        "id,reason,details,status,created_at,comments!comment_reports_comment_id_fkey(id,short_id,content,hidden_at,posts!comments_post_id_fkey(short_id),profiles!comments_author_id_fkey(full_name,username))",
        { count: "exact" },
      )
      .eq("status", "OPEN")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  return (
    <>
      <p className="eyebrow">Moderação</p>
      <h1 className="page-title mt-2">Publicações</h1>
      <p className="mt-3 text-sm text-muted"><strong className="text-ink tabular-nums">{count ?? 0}</strong> {count === 1 ? "publicação encontrada" : "publicações encontradas"}</p>
      <form role="search" className="card mt-6 grid gap-2 p-3 sm:grid-cols-[minmax(0,1fr)_220px_auto]">
        <label className="relative"><span className="sr-only">Buscar publicações</span><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" /><input className="field pl-10" name="q" defaultValue={search} placeholder="Buscar por título ou conteúdo" /></label>
        <label><span className="sr-only">Filtrar por área</span><SelectField name="secao" defaultValue={section} options={[{ value: "", label: "Todas as áreas" }, ...Object.entries(postSectionLabels).map(([value, label]) => ({ value, label }))]} /></label>
        <button className="btn-primary" type="submit">Filtrar</button>
      </form>
      <section className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="eyebrow">Fila de análise</p>
            <h2 className="section-title mt-1">Comentários denunciados</h2>
          </div>
          <span className="badge bg-danger/10 text-danger">
            <Flag className="mr-1 size-3.5" />
            {commentReportCount ?? 0} em aberto
          </span>
        </div>
        <div className="mt-3 space-y-3">
          {!commentReports?.length ? (
            <div className="card p-6 text-center text-sm text-muted">
              Nenhuma denúncia de comentário aguarda análise.
            </div>
          ) : (
            commentReports.map((report) => {
              const comment = report.comments?.[0];
              const author = comment?.profiles?.[0];
              const post = comment?.posts?.[0];
              return (
              <article key={report.id} className="card flex flex-col gap-4 border-l-4 border-l-danger p-5 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge bg-danger/10 text-danger">{labelFor(reportReasonLabels, report.reason)}</span>
                    <span className="text-xs text-muted">@{author?.username || "usuário"}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6">{comment?.content}</p>
                  {report.details && <p className="mt-2 rounded-lg bg-canvas px-3 py-2 text-xs text-muted">Relato: {report.details}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link className="btn-ghost border border-line/70 bg-paper" href={`/publicacao/${post?.short_id}#comentario-${comment?.short_id}`}>
                    Ver contexto <ArrowUpRight className="size-4" />
                  </Link>
                  {comment && <CommentToggle id={comment.id} hidden={Boolean(comment.hidden_at)} />}
                </div>
              </article>
              );
            })
          )}
        </div>
      </section>
      <div className="mt-8 border-t border-line pt-8">
        <p className="eyebrow">Conteúdo publicado</p>
        <h2 className="section-title mt-1">Todas as publicações</h2>
      </div>
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
                  <span className="badge">{labelFor(postSectionLabels, p.section)}</span>
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
      <AdminPagination path="/admin/publicacoes" page={page} totalPages={totalPages} params={{ q: search, secao: section }} />
    </>
  );
}

import { createClient } from "@/lib/supabase/server";
import { AlertTriangle, FileText, LifeBuoy, MessageSquare, Users } from "lucide-react";
import { auditActionLabels, labelFor } from "@/lib/labels";
import { formatAppDateTime } from "@/lib/date";
export default async function Page() {
  const db = await createClient();
  const [users, posts, comments, alerts, review, urgent, hidden, activity] =
    await Promise.all([
      db.from("profiles").select("id", { count: "exact", head: true }),
      db.from("posts").select("id", { count: "exact", head: true }),
      db.from("comments").select("id", { count: "exact", head: true }),
      db.from("support_alerts").select("id", { count: "exact", head: true }),
      db
        .from("support_alerts")
        .select("id", { count: "exact", head: true })
        .eq("status", "UNDER_REVIEW"),
      db
        .from("support_alerts")
        .select("id", { count: "exact", head: true })
        .eq("urgency", "URGENT")
        .not("status", "in", "(RESOLVED,ARCHIVED)"),
      db
        .from("posts")
        .select("id", { count: "exact", head: true })
        .not("hidden_at", "is", null),
      db
        .from("audit_logs")
        .select("id,action,resource_type,created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);
  const stats = [
    { label: "Usuários", value: users.count, icon: Users },
    { label: "Publicações", value: posts.count, icon: FileText },
    { label: "Comentários", value: comments.count, icon: MessageSquare },
    { label: "Solicitações", value: alerts.count, icon: LifeBuoy },
  ];
  return (
    <>
      <p className="eyebrow">Painel administrativo</p>
      <h1 className="page-title mt-2">Visão geral</h1>
      <div className="card mt-7 grid divide-y divide-line overflow-hidden sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-4 p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><Icon className="size-5" /></span>
            <div><p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p><strong className="block text-2xl tabular-nums">{value ?? 0}</strong></div>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="card p-5"><p className="text-sm font-semibold text-muted">Em análise</p><strong className="mt-2 block text-3xl tabular-nums">{review.count ?? 0}</strong></div>
        <div className="card border-l-4 border-l-danger p-5"><p className="flex items-center gap-2 text-sm font-semibold text-danger"><AlertTriangle className="size-4" /> Urgentes abertos</p><strong className="mt-2 block text-3xl tabular-nums">{urgent.count ?? 0}</strong></div>
        <div className="card p-5"><p className="text-sm font-semibold text-muted">Publicações ocultas</p><strong className="mt-2 block text-3xl tabular-nums">{hidden.count ?? 0}</strong></div>
      </div>
      <section className="card mt-5 p-6">
        <h2 className="section-title">Atividade recente</h2>
        <div className="mt-4 divide-y divide-line">
          {!activity.data?.length ? (
            <p className="py-5 text-muted">Nenhuma atividade registrada.</p>
          ) : (
            activity.data.map((a) => (
              <div key={a.id} className="flex justify-between py-3 text-sm">
                <span>
                  <b>{labelFor(auditActionLabels, a.action)}</b>
                </span>
                <time className="text-muted">
                  {formatAppDateTime(a.created_at)}
                </time>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}

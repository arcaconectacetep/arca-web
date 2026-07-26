import { createClient } from "@/lib/supabase/server";
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
    ["Usuários", users.count],
    ["Publicações", posts.count],
    ["Comentários", comments.count],
    ["Alertas recebidos", alerts.count],
    ["Em análise", review.count],
    ["Urgentes abertos", urgent.count],
    ["Posts ocultos", hidden.count],
  ];
  return (
    <>
      <p className="eyebrow">Painel administrativo</p>
      <h1 className="page-title mt-2">Visão geral</h1>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([l, v], i) => (
          <div
            key={String(l)}
            className={`card p-5 ${i === 5 ? "ring-2 ring-danger/20" : ""}`}
          >
            <p className="text-sm font-semibold text-muted">{l}</p>
            <strong className="mt-3 block text-3xl tabular-nums">
              {v ?? 0}
            </strong>
          </div>
        ))}
      </div>
      <section className="card mt-6 p-6">
        <h2 className="section-title">Atividade recente</h2>
        <div className="mt-4 divide-y divide-line">
          {!activity.data?.length ? (
            <p className="py-5 text-muted">Nenhuma atividade registrada.</p>
          ) : (
            activity.data.map((a) => (
              <div key={a.id} className="flex justify-between py-3 text-sm">
                <span>
                  <b>{a.action}</b> · {a.resource_type}
                </span>
                <time className="text-muted">
                  {new Date(a.created_at).toLocaleString("pt-BR")}
                </time>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}

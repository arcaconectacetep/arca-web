import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { auditActionLabels, auditResourceLabels, labelFor } from "@/lib/labels";
import { formatAppDateTime } from "@/lib/date";
import { AdminPagination } from "@/components/admin/admin-pagination";

const PAGE_SIZE = 25;
export default async function Page({ searchParams }: { searchParams: Promise<{ pagina?: string }> }) {
  const { pagina } = await searchParams;
  const page = Math.max(1, Number.parseInt(pagina || "1", 10) || 1);
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  const { data: p } = await db
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();
  if (p?.role !== "ADMIN") redirect("/acesso-negado");
  const { data, count } = await db
    .from("audit_logs")
    .select(
      "id,action,resource_type,resource_id,metadata,created_at,profiles!audit_logs_actor_id_fkey(full_name,username)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  return (
    <>
      <p className="eyebrow">Rastreabilidade</p>
      <h1 className="page-title mt-2">Logs de auditoria</h1>
      <p className="mt-3 text-sm text-muted"><strong className="text-ink tabular-nums">{count ?? 0}</strong> registros</p>
      {!data?.length && <div className="card mt-6 p-8 text-center text-muted">Nenhuma atividade administrativa registrada.</div>}
      {!!data?.length && <div className="card mt-6 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-brand-soft">
            <tr>
              <th className="p-4">Data</th>
              <th>Ação</th>
              <th>Responsável</th>
              <th>Recurso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data?.map((l) => (
              <tr key={l.id}>
                <td className="p-4">
                  {formatAppDateTime(l.created_at)}
                </td>
                <td className="font-bold">{labelFor(auditActionLabels, l.action)}</td>
                <td>@{l.profiles?.[0]?.username}</td>
                <td>
                  {labelFor(auditResourceLabels, l.resource_type)} · {l.resource_id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
      {!!data?.length && <ol className="mt-6 space-y-3 md:hidden">
        {data.map((log) => (
          <li className="card p-4" key={log.id}>
            <p className="font-bold">{labelFor(auditActionLabels, log.action)}</p>
            <p className="mt-1 text-sm text-muted">{labelFor(auditResourceLabels, log.resource_type)}</p>
            <div className="mt-3 flex flex-wrap justify-between gap-2 border-t border-line pt-3 text-xs text-muted"><span>{log.profiles?.[0]?.username ? `@${log.profiles[0].username}` : "Sistema"}</span><time dateTime={log.created_at}>{formatAppDateTime(log.created_at)}</time></div>
          </li>
        ))}
      </ol>}
      <AdminPagination path="/admin/logs" page={page} totalPages={totalPages} />
    </>
  );
}

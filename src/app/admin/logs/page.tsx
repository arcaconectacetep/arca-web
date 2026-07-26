import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export default async function Page() {
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
  const { data } = await db
    .from("audit_logs")
    .select(
      "id,action,resource_type,resource_id,metadata,created_at,profiles!audit_logs_actor_id_fkey(full_name,username)",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  return (
    <>
      <p className="eyebrow">Rastreabilidade</p>
      <h1 className="page-title mt-2">Logs de auditoria</h1>
      <div className="card mt-6 overflow-x-auto">
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
                  {new Date(l.created_at).toLocaleString("pt-BR")}
                </td>
                <td className="font-bold">{l.action}</td>
                <td>@{l.profiles?.[0]?.username}</td>
                <td>
                  {l.resource_type} · {l.resource_id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

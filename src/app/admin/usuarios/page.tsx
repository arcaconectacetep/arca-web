import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoleSelect, UserToggle } from "@/components/admin/admin-actions";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const { q, role } = await searchParams;
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  const { data: actor } = await db
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();
  if (actor?.role !== "ADMIN") redirect("/acesso-negado");
  let query = db
    .from("profiles")
    .select("id,full_name,username,role,suspended_at,created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (q)
    query = query.or(
      `full_name.ilike.%${q.replace(/[%_,()]/g, "")}%,username.ilike.%${q.replace(/[%_,()]/g, "")}%`,
    );
  if (role) query = query.eq("role", role);
  const { data } = await query;
  return (
    <>
      <p className="eyebrow">Gestão</p>
      <h1 className="page-title mt-2">Usuários</h1>
      <form className="mt-6 flex flex-wrap gap-2">
        <input
          className="field max-w-sm"
          name="q"
          placeholder="Buscar por nome ou username"
          defaultValue={q}
        />
        <select className="field w-auto" name="role" defaultValue={role}>
          <option value="">Todos os papéis</option>
          <option>STUDENT</option>
          <option>TEACHER</option>
          <option>STAFF</option>
          <option>ADMIN</option>
        </select>
        <button className="btn-primary">Filtrar</button>
      </form>
      <div className="card mt-5 overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-brand-soft text-brand">
            <tr>
              <th className="p-4">Pessoa</th>
              <th>Papel</th>
              <th>Status</th>
              <th className="p-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data?.map((u) => (
              <tr key={u.id}>
                <td className="p-4">
                  <b className="block">{u.full_name}</b>
                  <span className="text-muted">@{u.username}</span>
                </td>
                <td>
                  <RoleSelect id={u.id} value={u.role} />
                </td>
                <td>
                  {u.suspended_at ? (
                    <span className="text-danger">Suspenso</span>
                  ) : (
                    <span className="text-success">Ativo</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <UserToggle id={u.id} suspended={!!u.suspended_at} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

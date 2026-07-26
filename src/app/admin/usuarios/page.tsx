import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeleteUserButton, RoleSelect, UserToggle } from "@/components/admin/admin-actions";
import { roleLabels } from "@/lib/labels";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { formatAppDate } from "@/lib/date";
import { SelectField } from "@/components/ui/select-field";

const PAGE_SIZE = 20;
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; pagina?: string }>;
}) {
  const { q, role, pagina } = await searchParams;
  const page = Math.max(1, Number.parseInt(pagina || "1", 10) || 1);
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
    .select("id,full_name,username,role,suspended_at,created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (q)
    query = query.or(
      `full_name.ilike.%${q.replace(/[%_,()]/g, "")}%,username.ilike.%${q.replace(/[%_,()]/g, "")}%`,
    );
  if (role) query = query.eq("role", role);
  const { data, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  return (
    <>
      <p className="eyebrow">Gestão</p>
      <h1 className="page-title mt-2">Usuários</h1>
      <p className="mt-3 text-sm text-muted">
        <strong className="text-ink tabular-nums">{count ?? 0}</strong>{" "}
        {count === 1 ? "pessoa encontrada" : "pessoas encontradas"}
      </p>
      <form className="mt-6 flex flex-wrap gap-2">
        <input
          className="field max-w-sm"
          name="q"
          placeholder="Buscar por nome ou username"
          defaultValue={q}
        />
        <SelectField className="w-auto" name="role" defaultValue={role} options={[{ value: "", label: "Todos os papéis" }, ...Object.entries(roleLabels).map(([value, label]) => ({ value, label }))]} />
        <button className="btn-primary">Filtrar</button>
      </form>
      {!data?.length && (
        <div className="card mt-5 p-8 text-center text-muted">Nenhum usuário encontrado.</div>
      )}
      {!!data?.length && <div className="card mt-5 hidden overflow-x-auto md:block">
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
                  <RoleSelect id={u.id} value={u.role} locked={u.id === user!.id} />
                </td>
                <td>
                  {u.suspended_at ? (
                    <span className="text-danger">Suspenso</span>
                  ) : (
                    <span className="text-success">Ativo</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-1">
                    <UserToggle id={u.id} suspended={!!u.suspended_at} disabled={u.id === user!.id} />
                    <DeleteUserButton id={u.id} name={u.full_name || `@${u.username}`} disabled={u.id === user!.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
      {!!data?.length && (
        <div className="mt-5 space-y-3 md:hidden">
          {data.map((u) => (
            <article className="card p-4" key={u.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><h2 className="font-bold">{u.full_name}</h2><p className="truncate text-sm text-muted">@{u.username}</p></div>
                <span className={`badge ${u.suspended_at ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}>{u.suspended_at ? "Suspenso" : "Ativo"}</span>
              </div>
              <p className="mt-3 text-xs text-muted">Cadastro em {formatAppDate(u.created_at)}</p>
              <div className="mt-4"><span className="label">Papel</span><RoleSelect id={u.id} value={u.role} locked={u.id === user!.id} /></div>
              <div className="mt-4 flex flex-wrap gap-1 border-t border-line pt-3">
                <UserToggle id={u.id} suspended={!!u.suspended_at} disabled={u.id === user!.id} />
                <DeleteUserButton id={u.id} name={u.full_name || `@${u.username}`} disabled={u.id === user!.id} />
              </div>
            </article>
          ))}
        </div>
      )}
      <AdminPagination path="/admin/usuarios" page={page} totalPages={totalPages} params={{ q, role }} />
    </>
  );
}

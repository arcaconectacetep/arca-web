import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AlertStatus } from "@/components/admin/admin-actions";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; urgency?: string }>;
}) {
  const s = await searchParams;
  const db = await createClient();
  let q = db
    .from("support_alerts")
    .select(
      "id,protocol,category,urgency,status,created_at,profiles!support_alerts_author_id_fkey(full_name,username)",
    )
    .order("urgency", { ascending: false })
    .order("created_at", { ascending: true });
  if (s.status) q = q.eq("status", s.status);
  if (s.urgency) q = q.eq("urgency", s.urgency);
  const { data } = await q;
  return (
    <>
      <p className="eyebrow">Acolhimento privado</p>
      <h1 className="page-title mt-2">Solicitações de suporte</h1>
      <form className="mt-6 flex flex-col gap-2 sm:flex-row">
        <select className="field sm:w-auto" name="status">
          <option value="">Todos os status</option>
          <option>RECEIVED</option>
          <option>UNDER_REVIEW</option>
          <option>RESOLVED</option>
        </select>
        <select className="field sm:w-auto" name="urgency">
          <option value="">Todas urgências</option>
          <option>GUIDANCE</option>
          <option>ATTENTION</option>
          <option>URGENT</option>
        </select>
        <button className="btn-primary">Filtrar</button>
      </form>
      <div className="mt-5 space-y-3">
        {data?.map((a) => (
          <article
            key={a.id}
            className={`card flex flex-col gap-4 p-5 md:flex-row md:items-center ${a.urgency === "URGENT" ? "border-l-4 border-l-danger" : ""}`}
          >
            <div className="flex-1">
              <Link
                href={`/admin/alertas/${a.id}`}
                className="font-mono font-bold text-brand"
              >
                {a.protocol}
              </Link>
              <p className="mt-1 text-sm text-muted">
                {a.category} · {a.profiles?.[0]?.full_name}
              </p>
            </div>
            <span className="badge">{a.urgency}</span>
            <AlertStatus id={a.id} value={a.status} />
          </article>
        ))}
      </div>
    </>
  );
}

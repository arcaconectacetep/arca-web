import Link from "next/link";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { markNotificationAsRead } from "@/app/actions";
import { PageBack } from "@/components/ui/page-back";
export default async function Page() {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  const { data } = await db
    .from("notifications")
    .select("*")
    .eq("recipient_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(50);
  return (
    <div className="mx-auto max-w-3xl">
      <PageBack />
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Central</p>
          <h1 className="page-title mt-2">Notificações</h1>
        </div>
        <form
          action={async () => {
            "use server";
            await markNotificationAsRead();
          }}
        >
          <button className="btn-secondary">Marcar todas como lidas</button>
        </form>
      </div>
      <div className="mt-7 space-y-3">
        {!data?.length ? (
          <div className="card p-10 text-center">
            <Bell className="mx-auto size-8 text-muted" />
            <p className="mt-3 text-muted">Nada novo por aqui.</p>
          </div>
        ) : (
          data.map((n) => (
            <Link
              href={n.href || "#"}
              key={n.id}
              className={`card flex gap-4 p-4 ${!n.read_at ? "border-l-4 border-l-brand" : "opacity-75"}`}
            >
              <Bell className="mt-1 size-5 shrink-0 text-brand" />
              <span>
                <b>{n.title}</b>
                <p className="text-sm text-muted">{n.body}</p>
                <small className="text-muted">
                  {formatDistanceToNow(new Date(n.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </small>
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

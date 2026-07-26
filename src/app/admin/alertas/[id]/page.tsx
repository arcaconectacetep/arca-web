import { notFound } from "next/navigation";
import { format } from "date-fns";
import { addSupportAlertNote } from "@/app/actions";
import { AlertStatus } from "@/components/admin/admin-actions";
import { createClient } from "@/lib/supabase/server";
import { PageBack } from "@/components/ui/page-back";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await createClient();
  const { data: alert } = await db
    .from("support_alerts")
    .select(
      "*,profiles!support_alerts_author_id_fkey(full_name,username),support_alert_notes(id,content,created_at,profiles!support_alert_notes_author_id_fkey(full_name)),support_alert_events(id,event_type,previous_status,new_status,created_at)",
    )
    .eq("id", id)
    .single();
  if (!alert) notFound();
  return (
    <div className="max-w-4xl">
      <PageBack fallback="/admin/alertas" label="Voltar aos alertas" />
      <p className="eyebrow">Atendimento confidencial</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title font-mono">{alert.protocol}</h1>
        <AlertStatus id={alert.id} value={alert.status} />
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
        <article className="card p-6">
          <div className="flex flex-wrap gap-2">
            <span className="badge">{alert.category}</span>
            <span className="badge">{alert.urgency}</span>
          </div>
          <h2 className="section-title mt-6">Relato</h2>
          <p className="mt-3 whitespace-pre-wrap leading-7">
            {alert.description}
          </p>
          <dl className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold text-muted">AUTOR</dt>
              <dd>
                {alert.profiles?.[0]?.full_name} · @
                {alert.profiles?.[0]?.username}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-muted">LOCAL</dt>
              <dd>{alert.location || "Não informado"}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-muted">DATA DO FATO</dt>
              <dd>
                {alert.happened_at
                  ? format(new Date(alert.happened_at), "dd/MM/yyyy HH:mm")
                  : "Não informada"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-muted">ACEITA CONTATO</dt>
              <dd>{alert.allow_contact ? "Sim" : "Não"}</dd>
            </div>
          </dl>
        </article>
        <aside className="card p-5">
          <h2 className="text-xl font-semibold">Nota interna</h2>
          <p className="mt-1 text-xs text-muted">
            Nunca visível para o estudante.
          </p>
          <form
            action={async (form) => {
              "use server";
              await addSupportAlertNote(id, String(form.get("content")));
            }}
            className="mt-4"
          >
            <textarea
              name="content"
              required
              maxLength={3000}
              className="field min-h-28"
              placeholder="Registre o encaminhamento…"
            />
            <button className="btn-primary mt-3 w-full">Adicionar nota</button>
          </form>
          <div className="mt-5 space-y-3">
            {alert.support_alert_notes.map(
              (note: {
                id: string;
                content: string;
                created_at: string;
                profiles: { full_name: string }[];
              }) => (
                <div key={note.id} className="rounded-xl bg-canvas p-3 text-sm">
                  <p>{note.content}</p>
                  <small className="mt-2 block text-muted">
                    {note.profiles?.[0]?.full_name} ·{" "}
                    {format(new Date(note.created_at), "dd/MM HH:mm")}
                  </small>
                </div>
              ),
            )}
          </div>
        </aside>
      </div>
      <section className="card mt-5 p-6">
        <h2 className="section-title">Histórico cronológico</h2>
        <ol className="mt-4 divide-y divide-line">
          {alert.support_alert_events.map(
            (event: {
              id: string;
              event_type: string;
              previous_status: string | null;
              new_status: string | null;
              created_at: string;
            }) => (
              <li key={event.id} className="py-3 text-sm">
                <b>{event.event_type}</b>
                <span className="ml-2 text-muted">
                  {event.previous_status || "—"} → {event.new_status || "—"}
                </span>
                <time className="block text-xs text-muted">
                  {format(new Date(event.created_at), "dd/MM/yyyy HH:mm")}
                </time>
              </li>
            ),
          )}
        </ol>
      </section>
    </div>
  );
}

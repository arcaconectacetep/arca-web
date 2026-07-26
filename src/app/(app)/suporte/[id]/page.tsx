import { notFound } from "next/navigation";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageBack } from "@/components/ui/page-back";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await createClient();
  const { data: a } = await db
    .from("support_alerts")
    .select(
      "id,protocol,category,urgency,description,location,happened_at,allow_contact,status,created_at,support_alert_events(event_type,new_status,created_at,metadata)",
    )
    .eq("id", id)
    .single();
  if (!a) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <PageBack fallback="/suporte" label="Voltar aos protocolos" />
      <p className="eyebrow">Acompanhamento</p>
      <h1 className="page-title mt-2 font-mono">{a.protocol}</h1>
      <div className="card mt-7 p-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="size-7 text-success" />
          <div>
            <b>Solicitação recebida</b>
            <p className="text-sm text-muted">
              A equipe autorizada poderá realizar o encaminhamento.
            </p>
          </div>
        </div>
        <dl className="mt-6 grid gap-5 border-t border-line pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase text-muted">Status</dt>
            <dd className="mt-1 font-bold text-brand">{a.status}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-muted">Urgência</dt>
            <dd className="mt-1">{a.urgency}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-muted">
              Categoria
            </dt>
            <dd className="mt-1">{a.category}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-muted">
              Enviado em
            </dt>
            <dd className="mt-1">
              {format(new Date(a.created_at), "dd/MM/yyyy 'às' HH:mm")}
            </dd>
          </div>
        </dl>
      </div>
      <section className="mt-8">
        <h2 className="section-title">Histórico</h2>
        <ol className="relative mt-5 border-l-2 border-brand-soft pl-6">
          {a.support_alert_events
            .filter((e) => !e.metadata?.internal)
            .map((e) => (
              <li key={e.created_at} className="relative mb-7">
                <span className="absolute -left-[31px] top-1 size-3 rounded-full bg-brand ring-4 ring-canvas" />
                <b className="block text-sm">
                  {e.new_status || "Solicitação criada"}
                </b>
                <time className="text-xs text-muted">
                  {format(new Date(e.created_at), "dd/MM/yyyy HH:mm")}
                </time>
              </li>
            ))}
        </ol>
      </section>
    </div>
  );
}

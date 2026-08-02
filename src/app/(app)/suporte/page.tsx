import Link from "next/link";
import { ArrowRight, LifeBuoy, ShieldCheck, TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { alertCategoryLabels, alertStatusLabels, labelFor } from "@/lib/labels";
import { formatAppDate } from "@/lib/date";
export default async function Page() {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  const { data } = await db
    .from("support_alerts")
    .select("id,protocol,category,urgency,status,created_at")
    .eq("author_id", user!.id)
    .order("created_at", { ascending: false });
  return (
    <div className="mx-auto max-w-4xl">
      <p className="eyebrow">Canal privado de suporte</p>
      <h1 className="page-title mt-2">Suporte e acolhimento</h1>
      <p className="mt-3 max-w-2xl leading-7 text-muted">
        Relate uma situação escolar e acompanhe o encaminhamento pelo protocolo.
      </p>

      <section className="card mt-7 overflow-hidden" aria-labelledby="novo-relato">
        <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
          <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
            <LifeBuoy className="size-5" aria-hidden />
          </span>
          <div>
            <h2 id="novo-relato" className="text-xl font-bold">Nova solicitação</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Descreva o necessário, revise as informações e receba um protocolo
              para acompanhar.
            </p>
          </div>
          <Link className="btn-primary md:justify-self-end" href="/suporte/novo">
            Começar <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="flex gap-3 border-t border-line bg-canvas/60 px-5 py-4 text-sm leading-6 sm:px-6">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
          <p>
            <strong>Relato restrito.</strong>{" "}
            <span className="text-muted">
              Somente você e a equipe autorizada podem visualizar a solicitação.
              Nada é publicado no feed.
            </span>
          </p>
        </div>
      </section>

      <aside className="mt-4 flex gap-3 rounded-xl bg-warning/10 p-4 text-sm leading-6">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
        <p>
          Em risco imediato, procure um adulto responsável ou acione o serviço
          de emergência adequado.
        </p>
      </aside>

      <section className="mt-9">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Acompanhamento</p>
            <h2 className="section-title mt-1">Meus protocolos</h2>
          </div>
          {!!data?.length && (
            <span className="text-sm font-semibold text-muted tabular-nums">
              {data.length} {data.length === 1 ? "solicitação" : "solicitações"}
            </span>
          )}
        </div>
        {!data?.length ? (
          <div className="card mt-4 p-7 text-center">
            <p className="font-semibold">Nenhuma solicitação aberta</p>
            <p className="mt-1 text-sm text-muted">
              Quando você enviar um relato, o protocolo aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {data.map((a) => (
              <Link
                key={a.id}
                href={`/suporte/${encodeURIComponent(a.protocol)}`}
                className="card flex min-h-20 items-center justify-between gap-4 p-4 hover:ring-2 hover:ring-brand/20"
              >
                <span>
                  <b className="block font-mono text-sm">{a.protocol}</b>
                  <small className="text-muted">
                    {labelFor(alertCategoryLabels, a.category)} ·{" "}
                    {formatAppDate(a.created_at)}
                  </small>
                </span>
                <span className="badge">{labelFor(alertStatusLabels, a.status)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, LifeBuoy, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
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
      <h1 className="page-title mt-2">
        Você não precisa lidar com isso sozinho.
      </h1>
      <div className="card mt-7 border-l-4 border-l-warning p-5">
        <p className="font-semibold">
          Este canal é destinado ao acolhimento e encaminhamento de situações no
          ambiente escolar. Em risco imediato, procure um adulto responsável ou
          acione o serviço de emergência adequado.
        </p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <LifeBuoy className="size-7 text-brand" />
          <h2 className="mt-5 text-xl font-semibold">Solicitar acolhimento</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Um fluxo cuidadoso, com revisão antes do envio e protocolo para
            acompanhar.
          </p>
          <Link className="btn-primary mt-6" href="/suporte/novo">
            Iniciar solicitação <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="card p-6">
          <ShieldCheck className="size-7 text-success" />
          <h2 className="mt-5 text-xl font-semibold">Privacidade protegida</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Somente você e a equipe autorizada visualizam suas solicitações.
            Elas nunca aparecem no feed.
          </p>
        </div>
      </div>
      <section className="mt-10">
        <h2 className="section-title">Meus protocolos</h2>
        {!data?.length ? (
          <div className="mt-4 rounded-xl border border-dashed border-line p-8 text-center text-muted">
            Você não possui solicitações.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {data.map((a) => (
              <Link
                key={a.id}
                href={`/suporte/${a.id}`}
                className="card flex min-h-20 items-center justify-between gap-4 p-4 hover:ring-2 hover:ring-brand/20"
              >
                <span>
                  <b className="block font-mono text-sm">{a.protocol}</b>
                  <small className="text-muted">
                    {a.category} ·{" "}
                    {format(new Date(a.created_at), "dd/MM/yyyy")}
                  </small>
                </span>
                <span className="badge">{a.status}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

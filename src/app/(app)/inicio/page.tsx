import Link from "next/link";
import { Suspense } from "react";
import { Feed } from "@/components/feed/feed";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; pagina?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,700px)_300px]">
      <section>
        <p className="eyebrow">Feed escolar</p>
        <h1 className="page-title mb-6 mt-2">A comunidade acontece aqui.</h1>
        <Suspense fallback={<FeedSkeleton cards={3} />}>
          <Feed
            search={params.q}
            type={params.categoria}
            page={Number(params.pagina ?? 1)}
          />
        </Suspense>
      </section>
      <aside className="hidden xl:block">
        <div className="card sticky top-24 p-5">
          <p className="eyebrow">Em destaque</p>
          <h2 className="mt-2 text-xl font-semibold">Comunidade segura</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Presenciou uma situação difícil? O canal de suporte é privado e gera
            um protocolo para acompanhamento.
          </p>
          <Link className="btn-secondary mt-5 w-full" href="/suporte/novo">
            Conhecer o canal
          </Link>
        </div>
      </aside>
    </div>
  );
}

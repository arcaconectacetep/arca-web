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
    <section className="mx-auto max-w-3xl">
      <p className="eyebrow">Mural informativo</p>
      <h1 className="page-title mt-2">Informação para agir no tempo certo.</h1>
      <p className="mb-7 mt-3 text-muted">
        Notícias escolares, saúde, segurança, campanhas, eventos e prazos.
      </p>
      <Suspense fallback={<FeedSkeleton cards={3} />}>
        <Feed
          section="WALL"
          search={params.q}
          type={params.categoria}
          page={Number(params.pagina ?? 1)}
        />
      </Suspense>
    </section>
  );
}

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
    <div className="mx-auto max-w-3xl">
      <section>
        <p className="eyebrow">Feed escolar</p>
        <h1 className="page-title mt-2">Publicações da comunidade</h1>
        <p className="mb-6 mt-2 text-muted">
          Ideias, avisos e projetos compartilhados pela escola.
        </p>
        <Suspense fallback={<FeedSkeleton cards={3} />}>
          <Feed
            search={params.q}
            type={params.categoria}
            page={Number(params.pagina ?? 1)}
          />
        </Suspense>
      </section>
    </div>
  );
}

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
      <p className="eyebrow">Espaço pedagógico</p>
      <h1 className="page-title mt-2">Aprender também é compartilhar.</h1>
      <p className="mb-7 mt-3 text-muted">
        Resumos, materiais, dúvidas e contribuições de cada curso.
      </p>
      <Suspense fallback={<FeedSkeleton cards={3} />}>
        <Feed
          section="PEDAGOGICAL"
          search={params.q}
          type={params.categoria}
          page={Number(params.pagina ?? 1)}
        />
      </Suspense>
    </section>
  );
}

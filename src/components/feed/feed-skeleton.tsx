export function FeedSkeleton({ cards = 2 }: { cards?: number }) {
  return (
    <div
      className="space-y-5"
      aria-busy="true"
      aria-label="Carregando publicações"
    >
      {Array.from({ length: cards }).map((_, index) => (
        <div className="card overflow-hidden" key={index}>
          <div className="animate-pulse p-5">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-full bg-line/70" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-36 rounded bg-line/70" />
                <div className="h-3 w-24 rounded bg-line/60" />
              </div>
              <div className="h-7 w-20 rounded-full bg-line/60" />
            </div>
            <div className="mt-6 h-5 w-2/3 rounded bg-line/70" />
            <div className="mt-3 space-y-2">
              <div className="h-4 rounded bg-line/55" />
              <div className="h-4 w-11/12 rounded bg-line/55" />
              <div className="h-4 w-3/4 rounded bg-line/55" />
            </div>
          </div>
          <div className="flex gap-3 border-t border-line px-4 py-3">
            <div className="h-9 w-16 animate-pulse rounded-lg bg-line/55" />
            <div className="h-9 w-16 animate-pulse rounded-lg bg-line/55" />
          </div>
        </div>
      ))}
    </div>
  );
}

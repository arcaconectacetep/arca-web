import { FeedSkeleton } from "@/components/feed/feed-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[700px]">
      <div className="mb-7 animate-pulse space-y-3">
        <div className="h-3 w-24 rounded bg-line/70" />
        <div className="h-9 w-2/3 rounded bg-line/70" />
      </div>
      <FeedSkeleton cards={3} />
    </div>
  );
}

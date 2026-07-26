import { FeedSkeleton } from "@/components/feed/feed-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[760px]">
      <div className="mb-5 h-10 w-24 animate-pulse rounded-xl bg-line/60" />
      <FeedSkeleton cards={1} />
      <div className="mt-5 h-48 animate-pulse rounded-2xl bg-line/60" />
    </div>
  );
}

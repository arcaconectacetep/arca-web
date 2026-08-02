import Image from "next/image";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { labelFor, postTypeLabels } from "@/lib/labels";
import { TwemojiText } from "@/components/ui/twemoji-text";
export default async function Page() {
  const db = await createClient();
  const { data } = await db
    .from("posts")
    .select(
      "id,short_id,title,content,type,created_at,post_images(image_url,alt_text),post_likes(count),comments(count),profiles!posts_author_id_fkey(full_name,username)",
    )
    .eq("section", "TRENDS")
    .is("hidden_at", null)
    .is("deleted_at", null)
    .limit(30);
  const posts = (data ?? [])
    .map((p) => ({
      ...p,
      score:
        (p.post_likes?.[0]?.count ?? 0) + (p.comments?.[0]?.count ?? 0) * 2,
    }))
    .sort(
      (a, b) =>
        b.score - a.score || +new Date(b.created_at) - +new Date(a.created_at),
    );
  return (
    <section>
      <p className="eyebrow">Tendências</p>
      <h1 className="page-title mt-2">Ideias que estão ganhando forma.</h1>
      <p className="mb-8 mt-3 text-muted">
        Projetos estudantis, tecnologia, cultura e economia criativa.
      </p>
      {!posts.length ? (
        <div className="card p-10 text-center">
          Ainda não há tendências publicadas.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/publicacao/${p.short_id}`}
              className="card-interactive group overflow-hidden"
            >
              {p.post_images?.[0] && (
                <div className="relative aspect-[4/3]">
                  <Image
                    src={p.post_images[0].image_url}
                    fill
                    alt={p.post_images[0].alt_text}
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="badge">{labelFor(postTypeLabels, p.type)}</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-brand">
                    <TrendingUp className="size-4" />
                    {p.score} pontos
                  </span>
                </div>
                <h2 className="mt-4 text-xl font-semibold transition-colors group-hover:text-brand">
                  <TwemojiText text={p.title || "Contribuição da comunidade"} />
                </h2>
                <TwemojiText
                  text={p.content}
                  className="mt-2 line-clamp-3 block text-sm leading-6 text-muted"
                />
                <p className="mt-5 text-xs text-muted">
                  por {p.profiles?.[0]?.full_name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

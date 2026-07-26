import { createClient } from "@/lib/supabase/server";
import { PostComposer } from "./post-composer";
import { PostCard } from "./post-card";
import type { Post, Section } from "@/types/database";
export async function Feed({
  section = "FEED",
  composer = true,
  type,
}: {
  section?: Section;
  composer?: boolean;
  type?: string;
}) {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;
  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  let query = db
    .from("posts")
    .select(
      "*,profiles!posts_author_id_fkey(username,full_name,avatar_url,role),post_images(image_url,thumbnail_url,alt_text),post_likes(user_id),comments(id)",
    )
    .eq("section", section)
    .is("deleted_at", null)
    .is("hidden_at", null)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20);
  if (type) query = query.eq("type", type);
  const { data, error } = await query;
  return (
    <div>
      {composer && (
        <PostComposer section={section} role={profile?.role ?? "STUDENT"} />
      )}{" "}
      {error ? (
        <div role="alert" className="card p-8 text-center text-danger">
          Não foi possível carregar as publicações.
        </div>
      ) : !data?.length ? (
        <div className="card p-10 text-center">
          <h2 className="text-xl font-semibold">
            Ainda não há publicações aqui.
          </h2>
          <p className="mt-2 text-muted">
            Compartilhe a primeira contribuição com a comunidade.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {(data as unknown as Post[]).map((p) => (
            <PostCard key={p.id} post={p} currentUser={user.id} />
          ))}
        </div>
      )}
    </div>
  );
}

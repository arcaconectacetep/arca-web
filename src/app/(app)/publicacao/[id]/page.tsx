import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/feed/post-card";
import { PageBack } from "@/components/ui/page-back";
import {
  CommentsSection,
  type PostComment,
} from "@/components/feed/comments-section";
import type { Post } from "@/types/database";

export const metadata: Metadata = {
  title: "Publicação",
  robots: { index: false, follow: false },
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect(`/login?next=/publicacao/${id}`);

  let postQuery = db
    .from("posts")
    .select(
      "*,profiles!posts_author_id_fkey(username,full_name,avatar_url,role,class_name),post_images(image_url,thumbnail_url,imgchest_image_id,imgchest_post_id,alt_text,position),post_likes(user_id),comments(id)",
    )
    .is("deleted_at", null)
    .is("hidden_at", null);
  postQuery = UUID_PATTERN.test(id)
    ? postQuery.eq("id", id)
    : postQuery.eq("short_id", id);
  const { data: post } = await postQuery.maybeSingle();
  if (!post) notFound();
  const { data: comments } = await db
    .from("comments")
    .select(
      "id,short_id,content,author_id,created_at,profiles!comments_author_id_fkey(username,full_name,avatar_url)",
    )
    .eq("post_id", post.id)
    .is("hidden_at", null)
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto max-w-[760px]">
      <PageBack
        fallback={
          post.section === "FEED"
            ? "/inicio"
            : post.section === "PEDAGOGICAL"
              ? "/espaco"
              : post.section === "WALL"
                ? "/mural"
                : "/tendencias"
        }
      />
      <PostCard post={post as unknown as Post} currentUser={user.id} detail />
      <CommentsSection
        postId={post.id}
        comments={(comments ?? []) as unknown as PostComment[]}
        currentUser={user.id}
      />
    </div>
  );
}

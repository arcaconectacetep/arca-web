import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/feed/post-card";
import {
  CommentsSection,
  type PostComment,
} from "@/components/feed/comments-section";
import type { Post } from "@/types/database";

export const metadata: Metadata = {
  title: "Publicação",
  robots: { index: false, follow: false },
};

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

  const [{ data: post }, { data: comments }] = await Promise.all([
    db
      .from("posts")
      .select(
        "*,profiles!posts_author_id_fkey(username,full_name,avatar_url,role),post_images(image_url,thumbnail_url,alt_text),post_likes(user_id),comments(id)",
      )
      .eq("id", id)
      .is("deleted_at", null)
      .is("hidden_at", null)
      .single(),
    db
      .from("comments")
      .select(
        "id,content,author_id,created_at,profiles!comments_author_id_fkey(username,full_name,avatar_url)",
      )
      .eq("post_id", id)
      .is("hidden_at", null)
      .order("created_at", { ascending: true }),
  ]);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-[760px]">
      <Link
        className="btn-ghost mb-4 -ml-3"
        href={
          post.section === "FEED"
            ? "/inicio"
            : post.section === "PEDAGOGICAL"
              ? "/espaco"
              : post.section === "WALL"
                ? "/mural"
                : "/tendencias"
        }
      >
        <ArrowLeft className="size-4" />
        Voltar
      </Link>
      <PostCard post={post as unknown as Post} currentUser={user.id} detail />
      <CommentsSection
        postId={id}
        comments={(comments ?? []) as unknown as PostComment[]}
        currentUser={user.id}
      />
    </div>
  );
}

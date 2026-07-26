"use client";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Heart, MessageCircle, Pin, ShieldCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { createComment, toggleLike } from "@/app/actions";
import type { Post } from "@/types/database";
const labels: Record<string, string> = {
  GENERAL: "Geral",
  ANNOUNCEMENT: "Comunicado",
  PEDAGOGICAL: "Pedagógico",
  HEALTH: "Saúde",
  SAFETY: "Segurança",
  OPPORTUNITY: "Oportunidade",
  CULTURE: "Cultura",
  ENTREPRENEURSHIP: "Empreendedorismo",
};
export function PostCard({
  post,
  currentUser,
}: {
  post: Post;
  currentUser: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const liked = post.post_likes.some((x) => x.user_id === currentUser);
  return (
    <article className="card overflow-hidden">
      <div className="p-5">
        <header className="flex gap-3">
          <Avatar
            url={post.profiles.avatar_url}
            name={post.profiles.full_name}
          />
          <div className="min-w-0 flex-1">
            <Link
              href={`/perfil/${post.profiles.username}`}
              className="font-bold hover:text-brand"
            >
              {post.profiles.full_name}
            </Link>
            <div className="flex flex-wrap gap-x-2 text-xs text-muted">
              <span>@{post.profiles.username}</span>
              <span>·</span>
              <time dateTime={post.created_at}>
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </time>
            </div>
          </div>
          <span className="badge">{labels[post.type]}</span>
        </header>
        {(post.official || post.pinned) && (
          <div className="mt-4 flex gap-3">
            {post.official && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-brand">
                <ShieldCheck className="size-4" />
                Comunicado oficial
              </span>
            )}
            {post.pinned && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-warning">
                <Pin className="size-4" />
                Fixada
              </span>
            )}
          </div>
        )}
        {post.title && (
          <h2 className="mt-4 text-xl font-semibold">{post.title}</h2>
        )}
        <p className="mt-2 whitespace-pre-wrap leading-7 text-ink/90">
          {post.content}
        </p>
      </div>
      {post.post_images.length > 0 && (
        <div
          className={`grid gap-1 ${post.post_images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
        >
          {post.post_images.map((img, i) => (
            <div
              key={img.image_url}
              className="relative aspect-[16/10] overflow-hidden bg-brand-soft"
            >
              <Image
                src={img.image_url}
                fill
                sizes="(max-width: 768px) 100vw, 680px"
                alt={img.alt_text || `Imagem ${i + 1} da publicação`}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
      <footer className="flex items-center border-t border-line px-3 py-2">
        <button
          onClick={() =>
            start(async () => {
              const r = await toggleLike(post.id);
              if (!r.ok) toast.error(r.error);
            })
          }
          disabled={pending}
          aria-pressed={liked}
          className={`btn-ghost ${liked ? "text-danger" : ""}`}
        >
          <Heart className={`size-5 ${liked ? "fill-current" : ""}`} />
          <span className="tabular-nums">{post.post_likes.length}</span>
          <span className="sr-only">curtidas</span>
        </button>
        <button onClick={() => setOpen(!open)} className="btn-ghost">
          <MessageCircle className="size-5" />
          <span className="tabular-nums">{post.comments.length}</span>
          <span className="sr-only">comentários</span>
        </button>
      </footer>
      {open && (
        <form
          action={async (fd) => {
            const r = await createComment({
              postId: post.id,
              content: String(fd.get("content")),
            });
            if (!r.ok) toast.error(r.error);
            else {
              toast.success("Comentário publicado.");
              setOpen(false);
            }
          }}
          className="flex gap-2 border-t border-line p-3"
        >
          <label className="flex-1">
            <span className="sr-only">Escreva um comentário</span>
            <input
              name="content"
              className="field"
              maxLength={1000}
              required
              placeholder="Escreva um comentário…"
            />
          </label>
          <button className="btn-primary">Enviar</button>
        </form>
      )}
    </article>
  );
}

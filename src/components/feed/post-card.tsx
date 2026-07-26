"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowUpRight,
  Flag,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Pin,
  Send,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  createComment,
  deletePost,
  reportPost,
  toggleLike,
  updatePost,
} from "@/app/actions";
import { Avatar } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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
  detail = false,
}: {
  post: Post;
  currentUser: string;
  detail?: boolean;
}) {
  const router = useRouter();
  const reportDialog = useRef<HTMLDialogElement>(null);
  const [commentOpen, setCommentOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [liked, setLiked] = useState(
    post.post_likes.some((item) => item.user_id === currentUser),
  );
  const [likeCount, setLikeCount] = useState(post.post_likes.length);
  const [likePending, startLike] = useTransition();
  const [actionPending, startAction] = useTransition();
  const ownPost = post.author_id === currentUser;
  const postHref = `/publicacao/${post.id}`;

  if (removed) return null;

  function handleLike() {
    const previous = liked;
    setLiked(!previous);
    setLikeCount((count) => count + (previous ? -1 : 1));
    startLike(async () => {
      const result = await toggleLike(post.id);
      if (!result.ok) {
        setLiked(previous);
        setLikeCount((count) => count + (previous ? 1 : -1));
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    if (
      !window.confirm(
        "Excluir esta publicação? Ela deixará de aparecer para a comunidade.",
      )
    )
      return;
    startAction(async () => {
      const result = await deletePost(post.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setRemoved(true);
      toast.success("Publicação excluída.");
      router.push(
        post.section === "FEED"
          ? "/inicio"
          : post.section === "PEDAGOGICAL"
            ? "/espaco"
            : post.section === "WALL"
              ? "/mural"
              : "/tendencias",
      );
      router.refresh();
    });
  }

  function handleEdit(form: FormData) {
    startAction(async () => {
      const result = await updatePost(post.id, {
        title: String(form.get("title") ?? ""),
        content: String(form.get("content") ?? ""),
        type: String(form.get("type") ?? post.type),
        section: post.section,
        courseId: post.course_id ?? "",
        official: post.official,
        pinned: post.pinned,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setEditing(false);
      toast.success("Publicação atualizada.");
      router.refresh();
    });
  }

  return (
    <article className="card overflow-hidden" id={`publicacao-${post.id}`}>
      <div className="p-5">
        <header className="flex gap-3">
          <Link
            href={`/perfil/${post.profiles.username}`}
            aria-label={`Ver perfil de ${post.profiles.full_name}`}
          >
            <Avatar
              url={post.profiles.avatar_url}
              name={post.profiles.full_name}
            />
          </Link>
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
              <Link
                href={postHref}
                className="hover:text-brand hover:underline"
              >
                <time dateTime={post.created_at}>
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </time>
              </Link>
            </div>
          </div>
          <span className="badge hidden sm:inline-flex">
            {labels[post.type]}
          </span>
          <details className="group relative">
            <summary
              className="grid size-10 cursor-pointer list-none place-items-center rounded-xl text-muted hover:bg-brand-soft hover:text-brand"
              aria-label="Ações da publicação"
            >
              {actionPending ? (
                <LoadingSpinner />
              ) : (
                <MoreHorizontal className="size-5" />
              )}
            </summary>
            <div className="absolute right-0 top-11 z-10 w-44 rounded-xl border border-line bg-paper p-1.5 shadow-lift">
              {ownPost ? (
                <>
                  <button
                    className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold hover:bg-canvas"
                    type="button"
                    onClick={() => setEditing(true)}
                  >
                    <Pencil className="size-4" /> Editar
                  </button>
                  <button
                    className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold text-danger hover:bg-danger/5"
                    type="button"
                    onClick={handleDelete}
                  >
                    <Trash2 className="size-4" /> Excluir
                  </button>
                </>
              ) : (
                <button
                  className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold text-danger hover:bg-danger/5"
                  type="button"
                  onClick={() => reportDialog.current?.showModal()}
                >
                  <Flag className="size-4" /> Denunciar
                </button>
              )}
            </div>
          </details>
        </header>

        <div className="mt-3 sm:hidden">
          <span className="badge">{labels[post.type]}</span>
        </div>
        {(post.official || post.pinned) && (
          <div className="mt-4 flex flex-wrap gap-3">
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

        {editing ? (
          <form
            action={handleEdit}
            className="mt-5 space-y-3 rounded-xl bg-canvas p-4"
          >
            <label>
              <span className="label">Título</span>
              <input
                className="field"
                name="title"
                maxLength={120}
                defaultValue={post.title ?? ""}
              />
            </label>
            <label>
              <span className="label">Conteúdo</span>
              <textarea
                className="field min-h-32 resize-y"
                name="content"
                maxLength={5000}
                required
                defaultValue={post.content}
              />
            </label>
            <label>
              <span className="label">Categoria</span>
              <select className="field" name="type" defaultValue={post.type}>
                {Object.entries(labels).map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex justify-end gap-2">
              <button
                className="btn-ghost"
                type="button"
                onClick={() => setEditing(false)}
              >
                <X className="size-4" />
                Cancelar
              </button>
              <button className="btn-primary" disabled={actionPending}>
                {actionPending && <LoadingSpinner />}Salvar alterações
              </button>
            </div>
          </form>
        ) : (
          <Link
            href={postHref}
            className="group block rounded-xl focus-visible:outline focus-visible:outline-3 focus-visible:outline-brand/30"
          >
            {post.title && (
              <h2
                className={`${detail ? "text-2xl" : "text-xl"} mt-4 font-bold transition-colors group-hover:text-brand`}
              >
                {post.title}
              </h2>
            )}
            <p
              className={`mt-2 whitespace-pre-wrap leading-7 text-ink/90 ${detail ? "" : "line-clamp-5"}`}
            >
              {post.content}
            </p>
            {!detail && (
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-brand">
                Abrir publicação{" "}
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            )}
          </Link>
        )}
      </div>

      {post.post_images.length > 0 && (
        <Link
          href={postHref}
          className={`grid gap-1 ${post.post_images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
          aria-label="Abrir imagens da publicação"
        >
          {post.post_images.map((image, index) => (
            <div
              key={image.image_url}
              className="relative aspect-[16/10] overflow-hidden bg-brand-soft"
            >
              <Image
                src={image.image_url}
                fill
                sizes="(max-width: 768px) 100vw, 680px"
                alt={image.alt_text || `Imagem ${index + 1} da publicação`}
                className="object-cover transition-transform duration-200 hover:scale-[1.015]"
              />
            </div>
          ))}
        </Link>
      )}

      <footer className="flex items-center border-t border-line px-3 py-2">
        <button
          onClick={handleLike}
          disabled={likePending}
          aria-pressed={liked}
          className={`btn-ghost ${liked ? "text-danger" : ""}`}
        >
          {likePending ? (
            <LoadingSpinner label="Atualizando curtida" className="size-5" />
          ) : (
            <Heart className={`size-5 ${liked ? "fill-current" : ""}`} />
          )}
          <span className="tabular-nums">{likeCount}</span>
          <span className="sr-only">curtidas</span>
        </button>
        <button
          onClick={() => setCommentOpen((open) => !open)}
          aria-expanded={commentOpen}
          className="btn-ghost"
        >
          <MessageCircle className="size-5" />
          <span className="tabular-nums">{post.comments.length}</span>
          <span className="sr-only">comentários</span>
        </button>
        {!detail && (
          <Link
            href={`${postHref}#comentarios`}
            className="btn-ghost ml-auto text-xs"
          >
            Ver conversa <ArrowUpRight className="size-4" />
          </Link>
        )}
      </footer>

      {commentOpen && (
        <form
          action={async (form) => {
            const result = await createComment({
              postId: post.id,
              content: String(form.get("content")),
            });
            if (!result.ok) toast.error(result.error);
            else {
              toast.success("Comentário publicado.");
              setCommentOpen(false);
              router.refresh();
            }
          }}
          className="flex flex-col gap-2 border-t border-line p-3 sm:flex-row"
        >
          <label className="flex-1">
            <span className="sr-only">Escreva um comentário</span>
            <input
              name="content"
              className="field"
              maxLength={1000}
              required
              autoFocus
              placeholder="Escreva um comentário…"
            />
          </label>
          <button className="btn-primary">
            <Send className="size-4" />
            Enviar
          </button>
        </form>
      )}
      <dialog
        ref={reportDialog}
        className="w-[calc(100%_-_2rem)] max-w-md rounded-2xl bg-paper p-0 text-ink shadow-2xl backdrop:bg-ink/45 backdrop:backdrop-blur-[2px]"
      >
        <div className="border-b border-line p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Moderação</p>
              <h2 className="mt-1 text-xl font-bold">Denunciar publicação</h2>
            </div>
            <button
              className="grid size-10 place-items-center rounded-xl text-muted hover:bg-canvas"
              type="button"
              onClick={() => reportDialog.current?.close()}
              aria-label="Fechar denúncia"
            >
              <X className="size-5" />
            </button>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">
            A equipe analisará a publicação. Use este recurso apenas quando
            houver violação das regras da comunidade.
          </p>
        </div>
        <form
          className="space-y-4 p-5"
          action={(form) =>
            startAction(async () => {
              const result = await reportPost(
                post.id,
                String(form.get("reason")),
                String(form.get("details")),
              );
              if (!result.ok) {
                toast.error(result.error);
                return;
              }
              reportDialog.current?.close();
              toast.success("Denúncia enviada para análise.");
            })
          }
        >
          <label>
            <span className="label">Motivo</span>
            <select className="field" name="reason" required defaultValue="">
              <option value="" disabled>
                Selecione um motivo
              </option>
              <option value="OFFENSIVE">Conteúdo ofensivo</option>
              <option value="DISCRIMINATION">
                Preconceito ou discriminação
              </option>
              <option value="MISINFORMATION">Informação enganosa</option>
              <option value="PRIVACY">Exposição de dados pessoais</option>
              <option value="OTHER">Outro motivo</option>
            </select>
          </label>
          <label>
            <span className="label">
              Detalhes{" "}
              <span className="font-normal text-muted">(opcional)</span>
            </span>
            <textarea
              className="field min-h-24 resize-y"
              name="details"
              maxLength={1000}
              placeholder="Ajude a equipe a entender o problema."
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              className="btn-ghost"
              type="button"
              onClick={() => reportDialog.current?.close()}
            >
              Cancelar
            </button>
            <button className="btn-primary" disabled={actionPending}>
              {actionPending && <LoadingSpinner />}Enviar denúncia
            </button>
          </div>
        </form>
      </dialog>
    </article>
  );
}

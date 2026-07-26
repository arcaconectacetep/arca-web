"use client";

import { useState, useTransition } from "react";
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
  Images,
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
import { MediaGallery } from "@/components/feed/media-gallery";
import { PostMediaEditor } from "@/components/feed/post-media-editor";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent } from "@/components/ui/radix-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SelectField } from "@/components/ui/select-field";

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
  const [reportOpen, setReportOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <button
              className="grid size-10 cursor-pointer list-none place-items-center rounded-xl text-muted hover:bg-brand-soft hover:text-brand"
              aria-label="Ações da publicação"
            >
              {actionPending ? (
                <LoadingSpinner />
              ) : (
                <MoreHorizontal className="size-5" />
              )}
            </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {ownPost ? (
                <>
                  <DropdownMenuItem
                    onClick={() => setEditing(true)}
                  >
                    <Pencil className="size-4" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setMediaOpen(true)}
                  >
                    <Images className="size-4" /> Gerenciar imagens
                  </DropdownMenuItem>
                  <ConfirmDialog destructive title="Excluir publicação?" description="Ela deixará de aparecer para a comunidade. Esta ação não pode ser desfeita pelo autor." confirmLabel="Excluir" onConfirm={handleDelete} trigger={<DropdownMenuItem className="text-danger data-[highlighted]:bg-danger/5" onSelect={(event) => event.preventDefault()}>
                    <Trash2 className="size-4" /> Excluir
                  </DropdownMenuItem>} />
                </>
              ) : (
                <DropdownMenuItem
                  className="text-danger data-[highlighted]:bg-danger/5"
                  onClick={() => setReportOpen(true)}
                >
                  <Flag className="size-4" /> Denunciar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
              <SelectField name="type" defaultValue={post.type} options={Object.entries(labels).map(([value, label]) => ({ value, label }))} />
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
        <MediaGallery images={post.post_images} />
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
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent title="Denunciar publicação" description="A equipe analisará a publicação. Use este recurso apenas quando houver violação das regras da comunidade.">
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
              setReportOpen(false);
              toast.success("Denúncia enviada para análise.");
            })
          }
        >
          <label>
            <span className="label">Motivo</span>
            <SelectField name="reason" required defaultValue="" placeholder="Selecione um motivo" options={[{ value: "", label: "Selecione um motivo" }, { value: "OFFENSIVE", label: "Conteúdo ofensivo" }, { value: "DISCRIMINATION", label: "Preconceito ou discriminação" }, { value: "MISINFORMATION", label: "Informação enganosa" }, { value: "PRIVACY", label: "Exposição de dados pessoais" }, { value: "OTHER", label: "Outro motivo" }]} />
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
              onClick={() => setReportOpen(false)}
            >
              Cancelar
            </button>
            <button className="btn-primary" disabled={actionPending}>
              {actionPending && <LoadingSpinner />}Enviar denúncia
            </button>
          </div>
        </form>
        </DialogContent>
      </Dialog>
      {ownPost && (
        <PostMediaEditor
          postId={post.id}
          initialImages={post.post_images}
          open={mediaOpen}
          onOpenChange={setMediaOpen}
        />
      )}
    </article>
  );
}

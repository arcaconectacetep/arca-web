"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { createComment, deleteComment, updateComment } from "@/app/actions";
import { Avatar } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea";
import { TwemojiText } from "@/components/ui/twemoji-text";

export type PostComment = {
  id: string;
  short_id: string;
  content: string;
  author_id: string;
  created_at: string;
  profiles: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
};

function CommentItem({
  comment,
  currentUser,
}: {
  comment: PostComment;
  currentUser: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [pending, startTransition] = useTransition();
  if (removed) return null;
  const own = comment.author_id === currentUser;

  return (
    <article
      id={`comentario-${comment.short_id}`}
      className="scroll-mt-24 flex gap-3 rounded-xl p-4 transition-[background-color,box-shadow] duration-200 hover:bg-canvas/70 target:bg-brand-soft/70 target:shadow-[0_0_0_3px_hsl(var(--brand)/.09)]"
    >
      <Link href={`/perfil/${comment.profiles.username}`}>
        <Avatar
          url={comment.profiles.avatar_url}
          name={comment.profiles.full_name}
          size={40}
        />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <Link
              href={`/perfil/${comment.profiles.username}`}
              className="text-sm font-bold hover:text-brand"
            >
              <TwemojiText
                text={comment.profiles.full_name || `@${comment.profiles.username}`}
              />
            </Link>
            <time
              className="ml-2 text-xs text-muted"
              dateTime={comment.created_at}
            >
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </time>
          </div>
          {own && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
              <button
                className="grid size-9 cursor-pointer list-none place-items-center rounded-lg text-muted hover:bg-canvas"
                aria-label="Ações do comentário"
              >
                {pending ? (
                  <LoadingSpinner />
                ) : (
                  <MoreHorizontal className="size-4" />
                )}
              </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="size-4" />
                  Editar
                </DropdownMenuItem>
                <ConfirmDialog destructive title="Excluir comentário?" description="O comentário deixará de aparecer na conversa. Esta ação não pode ser desfeita." confirmLabel="Excluir" onConfirm={() => {
                    startTransition(async () => {
                      const result = await deleteComment(comment.id);
                      if (!result.ok) {
                        toast.error(result.error);
                        return;
                      }
                      setRemoved(true);
                      toast.success("Comentário excluído.");
                      router.refresh();
                    });
                  }} trigger={<DropdownMenuItem className="text-danger data-[highlighted]:bg-danger/5" onSelect={(event) => event.preventDefault()}>
                  <Trash2 className="size-4" />
                  Excluir
                </DropdownMenuItem>} />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {editing ? (
          <form
            className="mt-2"
            action={(form) =>
              startTransition(async () => {
                const result = await updateComment(
                  comment.id,
                  String(form.get("content")),
                );
                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }
                setEditing(false);
                toast.success("Comentário atualizado.");
                router.refresh();
              })
            }
          >
            <AutoResizeTextarea
              className="field leading-6"
              name="content"
              maxLength={1000}
              minRows={2}
              required
              defaultValue={comment.content}
              autoFocus
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                className="btn-ghost"
                type="button"
                onClick={() => setEditing(false)}
              >
                <X className="size-4" />
                Cancelar
              </button>
              <button className="btn-primary" disabled={pending}>
                {pending && <LoadingSpinner />}Salvar
              </button>
            </div>
          </form>
        ) : (
          <TwemojiText
            text={comment.content}
            className="mt-1 block whitespace-pre-wrap text-[15px] leading-6 text-ink/90"
          />
        )}
      </div>
    </article>
  );
}

export function CommentsSection({
  postId,
  comments,
  currentUser,
}: {
  postId: string;
  comments: PostComment[];
  currentUser: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <section id="comentarios" className="card mt-5 scroll-mt-24 p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="size-5 text-brand" />
        <h2 className="text-xl font-bold">Comentários</h2>
        <span className="text-sm tabular-nums text-muted">
          {comments.length}
        </span>
      </div>
      <form
        className="mt-5 flex flex-col gap-2 sm:flex-row"
        action={(form) =>
          startTransition(async () => {
            const result = await createComment({
              postId,
              content: String(form.get("content")),
            });
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            const input = document.getElementById(
              "new-comment",
            ) as HTMLTextAreaElement | null;
            if (input) {
              input.value = "";
              input.dispatchEvent(new Event("input", { bubbles: true }));
            }
            toast.success("Comentário publicado.");
            router.refresh();
          })
        }
      >
        <label className="flex-1">
          <span className="sr-only">Adicionar comentário</span>
          <AutoResizeTextarea
            id="new-comment"
            name="content"
            className="field leading-6"
            maxLength={1000}
            maxHeight={160}
            required
            placeholder="Participe da conversa…"
          />
        </label>
        <button className="btn-primary" disabled={pending}>
          {pending ? (
            <LoadingSpinner label="Publicando comentário" />
          ) : (
            <Send className="size-4" />
          )}
          {pending ? "Enviando…" : "Comentar"}
        </button>
      </form>
      {comments.length ? (
        <div className="mt-3 space-y-1">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl bg-canvas px-5 py-8 text-center">
          <p className="font-semibold">Nenhum comentário ainda.</p>
          <p className="mt-1 text-sm text-muted">
            Seja a primeira pessoa a participar da conversa.
          </p>
        </div>
      )}
    </section>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Flag,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { createComment, deleteComment, reportComment, updateComment } from "@/app/actions";
import { Avatar } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea";
import { TwemojiText } from "@/components/ui/twemoji-text";
import { Dialog, DialogContent } from "@/components/ui/radix-dialog";
import { SelectField } from "@/components/ui/select-field";

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
  const [reportOpen, setReportOpen] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [pending, startTransition] = useTransition();
  const [reportPending, startReport] = useTransition();
  if (removed) return null;
  const own = comment.author_id === currentUser;

  return (
    <article
      id={`comentario-${comment.short_id}`}
      tabIndex={-1}
      className="scroll-mt-24 flex gap-3 rounded-xl p-4 outline-none transition-[background-color,box-shadow] duration-200 hover:bg-canvas/70 data-[highlighted=true]:bg-brand-soft/70 data-[highlighted=true]:shadow-[0_0_0_3px_hsl(var(--brand)/.12)]"
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
              <DropdownMenuContent align="end" className="w-48">
                {own ? (
                  <>
                    <DropdownMenuItem onClick={() => setEditing(true)}>
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
                  </>
                ) : (
                  <DropdownMenuItem
                    className="text-danger data-[highlighted]:bg-danger/5"
                    onClick={() => setReportOpen(true)}
                  >
                    <Flag className="size-4" />
                    Denunciar comentário
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent
          title="Denunciar comentário"
          description="A equipe analisará o comentário e o contexto da conversa."
        >
          <form
            className="space-y-4 p-5"
            action={(form) =>
              startReport(async () => {
                const result = await reportComment(
                  comment.id,
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
              <SelectField
                name="reason"
                required
                defaultValue=""
                placeholder="Selecione um motivo"
                options={[
                  { value: "", label: "Selecione um motivo" },
                  { value: "OFFENSIVE", label: "Conteúdo ofensivo" },
                  { value: "DISCRIMINATION", label: "Preconceito ou discriminação" },
                  { value: "MISINFORMATION", label: "Informação enganosa" },
                  { value: "PRIVACY", label: "Exposição de dados pessoais" },
                  { value: "SEXUAL_CONTENT", label: "Conteúdo sexual" },
                  { value: "SPAM", label: "Spam ou link suspeito" },
                  { value: "OTHER", label: "Outro motivo" },
                ]}
              />
            </label>
            <label>
              <span className="label">Detalhes <span className="font-normal text-muted">(opcional)</span></span>
              <AutoResizeTextarea
                className="field leading-6"
                name="details"
                maxLength={1000}
                minRows={2}
                placeholder="Ajude a equipe a entender o problema."
              />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setReportOpen(false)}>
                Cancelar
              </button>
              <button className="btn-primary" disabled={reportPending}>
                {reportPending && <LoadingSpinner label="Enviando denúncia" />}
                Enviar denúncia
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
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

  useEffect(() => {
    let highlightTimer: number | undefined;
    let frame = 0;

    const revealComment = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id.startsWith("comentario-")) return;
      const target = document.getElementById(id);
      if (!target) return;
      const reduced =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        Boolean(document.querySelector('[data-motion="true"]'));
      frame = window.requestAnimationFrame(() => {
        target.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "center",
        });
        target.dataset.highlighted = "true";
        target.focus({ preventScroll: true });
        highlightTimer = window.setTimeout(() => {
          delete target.dataset.highlighted;
        }, 3200);
      });
    };

    revealComment();
    window.addEventListener("hashchange", revealComment);
    return () => {
      window.removeEventListener("hashchange", revealComment);
      window.cancelAnimationFrame(frame);
      if (highlightTimer !== undefined) window.clearTimeout(highlightTimer);
    };
  }, [comments]);

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

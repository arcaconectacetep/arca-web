"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Globe2,
  GripVertical,
  Heading2,
  ImagePlus,
  Send,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { createPost } from "@/app/actions";
import type { Role, Section } from "@/types/database";
import { Avatar } from "@/components/ui/avatar";
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SelectField } from "@/components/ui/select-field";
import { Tooltip } from "@/components/ui/tooltip";
import { prepareImageForUpload } from "@/lib/prepare-image";
import { validateCommunityContent } from "@/lib/content-moderation";
import { inspectImageForAdultContent } from "@/lib/nsfw-image-moderation";

const typeOptions = Object.entries({
  GENERAL: "Geral",
  PEDAGOGICAL: "Pedagógico",
  ANNOUNCEMENT: "Comunicado",
  HEALTH: "Saúde",
  SAFETY: "Segurança",
  OPPORTUNITY: "Oportunidade",
  CULTURE: "Cultura",
  ENTREPRENEURSHIP: "Empreendedorismo",
}).map(([value, label]) => ({ value, label }));

type ComposerImage = { file: File; preview: string };

export function PostComposer({
  section = "FEED",
  role,
  author,
}: {
  section?: Section;
  role: Role;
  author: {
    full_name: string | null;
    avatar_url: string | null;
    class_name: string | null;
  };
}) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [titleEnabled, setTitleEnabled] = useState(false);
  const [type, setType] = useState("GENERAL");
  const [official, setOfficial] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [focused, setFocused] = useState(false);
  const [images, setImages] = useState<ComposerImage[]>([]);
  const [imageScanning, setImageScanning] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);
  const expanded = focused || Boolean(content || title || images.length);

  function move(from: number, to: number) {
    if (to < 0 || to >= images.length || from === to) return;
    setImages((current) => {
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function removeImage(index: number) {
    setImages((current) => {
      URL.revokeObjectURL(current[index].preview);
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  async function choose(files: FileList | null) {
    if (!files) return;
    const next = [...images];
    setImageScanning(true);
    try {
      for (const file of Array.from(files)) {
        if (next.length >= 4) break;
        if (
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size > 10 * 1024 * 1024
        ) {
          toast.error(`${file.name}: formato ou tamanho inválido.`);
          continue;
        }
        try {
          const inspection = await inspectImageForAdultContent(file);
          if (inspection.blocked) {
            toast.error(
              `${file.name}: a imagem parece conter conteúdo adulto e foi bloqueada.`,
            );
            continue;
          }
          next.push({ file, preview: URL.createObjectURL(file) });
        } catch {
          toast.error(
            `${file.name}: não foi possível concluir a análise de segurança. Tente novamente.`,
          );
        }
      }
      setImages(next);
    } finally {
      setImageScanning(false);
    }
  }

  async function upload(image: ComposerImage) {
    const data = new FormData();
    data.set("file", await prepareImageForUpload(image.file));
    data.set("kind", "post");
    const response = await fetch("/api/upload", { method: "POST", body: data });
    const result = (await response.json().catch(() => null)) as {
      error?: string;
      imageUrl?: string;
    } | null;
    if (!response.ok || !result?.imageUrl)
      throw new Error(
        result?.error ??
          (response.status === 413
            ? "A imagem excedeu o limite do servidor."
            : "Não foi possível enviar a imagem."),
      );
    return { ...result, altText: "Imagem da publicação" };
  }

  function resetComposer() {
    images.forEach((image) => URL.revokeObjectURL(image.preview));
    form.current?.reset();
    setContent("");
    setTitle("");
    setTitleEnabled(false);
    setType("GENERAL");
    setOfficial(false);
    setPinned(false);
    setImages([]);
    setFocused(false);
  }

  function submit() {
    const moderationError = validateCommunityContent(
      titleEnabled ? title : "",
      content,
    );
    if (moderationError) {
      toast.error(moderationError);
      return;
    }
    start(async () => {
      try {
        const uploaded = await Promise.all(images.map(upload));
        const result = await createPost({
          title: titleEnabled ? title : "",
          content,
          type,
          section,
          official,
          pinned,
          images: uploaded,
        });
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        resetComposer();
        toast.success("Publicação criada e disponível na comunidade.");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Falha ao publicar.",
        );
      }
    });
  }

  return (
    <form
      ref={form}
      action={submit}
      className="card mb-6 overflow-hidden"
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div className="flex gap-3 p-4 sm:p-5">
        <Avatar
          url={author.avatar_url}
          name={author.full_name}
          size={44}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-bold">
                {author.full_name || "Criar publicação"}
              </p>
              <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted">
                <Globe2 className="size-3.5" aria-hidden />
                Comunidade escolar
                {author.class_name ? ` · Turma ${author.class_name}` : ""}
              </p>
            </div>
            {expanded && (
              <span className="text-xs tabular-nums text-muted">
                {content.length}/5000
              </span>
            )}
          </div>

          <AnimatePresence initial={false}>
            {titleEnabled && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-4 flex items-center gap-2"
              >
                <input
                  name="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={120}
                  className="min-h-10 min-w-0 flex-1 bg-transparent text-lg font-bold outline-none placeholder:font-medium placeholder:text-muted/70"
                  placeholder="Título da publicação"
                  autoFocus
                />
                <button
                  type="button"
                  className="grid size-10 place-items-center rounded-xl text-muted hover:bg-canvas hover:text-ink"
                  onClick={() => {
                    setTitle("");
                    setTitleEnabled(false);
                  }}
                  aria-label="Remover título"
                >
                  <X className="size-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <label className="mt-3 block">
            <span className="sr-only">Conteúdo da publicação</span>
            <AutoResizeTextarea
              name="content"
              required
              maxLength={5000}
              maxHeight={320}
              minRows={expanded ? 2 : 1}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="w-full bg-transparent py-2 text-[15px] leading-6 outline-none placeholder:text-muted/75 sm:text-base"
              placeholder="Compartilhe uma ideia, aviso ou projeto…"
            />
          </label>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="grid grid-cols-2 gap-2 px-4 pb-4 sm:grid-cols-4 sm:px-5 sm:pb-5"
          >
            {images.map((image, index) => (
              <div
                key={image.preview}
                draggable
                onDragStart={() => setDragging(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (dragging !== null) move(dragging, index);
                  setDragging(null);
                }}
                onDragEnd={() => setDragging(null)}
                className={`group relative aspect-square overflow-hidden rounded-xl bg-canvas ring-2 transition-[opacity,box-shadow] ${
                  dragging === index
                    ? "opacity-50 ring-brand"
                    : "ring-transparent"
                }`}
              >
                <Image
                  src={image.preview}
                  fill
                  alt={`Prévia da imagem ${index + 1}`}
                  className="object-cover"
                  unoptimized
                />
                <span className="absolute left-2 top-2 grid size-7 place-items-center rounded-full bg-ink/80 text-xs font-bold text-white backdrop-blur">
                  {index + 1}
                </span>
                <button
                  type="button"
                  aria-label={`Remover imagem ${index + 1}`}
                  onClick={() => removeImage(index)}
                  className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-ink/85 text-white backdrop-blur hover:bg-danger"
                >
                  <X className="size-4" />
                </button>
                <span
                  className="absolute bottom-2 left-2 grid size-9 cursor-grab place-items-center rounded-full bg-ink/75 text-white backdrop-blur"
                  aria-hidden
                >
                  <GripVertical className="size-4" />
                </span>
                <div className="absolute bottom-2 right-2 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                  <button
                    type="button"
                    className="grid size-9 place-items-center rounded-full bg-ink/80 text-white disabled:opacity-35"
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                    aria-label={`Mover imagem ${index + 1} para a esquerda`}
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="grid size-9 place-items-center rounded-full bg-ink/80 text-white disabled:opacity-35"
                    disabled={index === images.length - 1}
                    onClick={() => move(index, index + 1)}
                    aria-label={`Mover imagem ${index + 1} para a direita`}
                  >
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {official && <input type="hidden" name="official" value="on" />}
      {pinned && <input type="hidden" name="pinned" value="on" />}

      <div className="flex flex-wrap items-center gap-1 border-t border-line/70 bg-canvas/35 px-3 py-2.5 sm:gap-2 sm:px-4">
        <Tooltip content="Adicionar até 4 imagens">
          <label
            className={`btn-ghost cursor-pointer border border-line/70 bg-paper px-3 shadow-quiet hover:bg-brand-soft ${images.length >= 4 || imageScanning ? "pointer-events-none opacity-50" : ""}`}
          >
            {imageScanning ? (
              <LoadingSpinner label="Analisando imagem" className="size-5" />
            ) : (
              <ImagePlus className="size-5" aria-hidden />
            )}
            <span className="hidden sm:inline">
              {imageScanning ? "Analisando…" : "Imagem"}
            </span>
            {images.length > 0 && (
              <span className="tabular-nums">{images.length}/4</span>
            )}
            <input
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={images.length >= 4 || pending || imageScanning}
              onChange={(event) => {
                void choose(event.target.files);
                event.currentTarget.value = "";
              }}
            />
          </label>
        </Tooltip>

        {!titleEnabled && (
          <Tooltip content="Adicionar um título">
            <button
              type="button"
              className="btn-ghost border border-line/70 bg-paper px-3 shadow-quiet hover:bg-brand-soft"
              onClick={() => setTitleEnabled(true)}
              aria-label="Adicionar título"
            >
              <Heading2 className="size-5" aria-hidden />
              <span className="hidden sm:inline">Título</span>
            </button>
          </Tooltip>
        )}

        <SelectField
          aria-label="Categoria da publicação"
          className="w-[9.5rem] bg-paper shadow-quiet sm:w-[11rem]"
          value={type}
          onValueChange={setType}
          options={typeOptions}
        />

        {role !== "STUDENT" && (
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className="btn-ghost border border-line/70 bg-paper px-3 shadow-quiet hover:bg-brand-soft">
                <SlidersHorizontal className="size-4" aria-hidden />
                <span className="hidden sm:inline">Opções</span>
                {(official || pinned) && (
                  <span className="size-2 rounded-full bg-brand" aria-hidden />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-3">
              <p className="px-1 pb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                Destaque institucional
              </p>
              <label className="flex cursor-pointer gap-3 rounded-xl p-3 hover:bg-canvas">
                <CheckboxField
                  checked={official}
                  onCheckedChange={(checked) => setOfficial(checked === true)}
                />
                <span>
                  <strong className="block text-sm">Publicação oficial</strong>
                  <small className="mt-0.5 block leading-5 text-muted">
                    Identifica o conteúdo como comunicado da instituição.
                  </small>
                </span>
              </label>
              <label className="flex cursor-pointer gap-3 rounded-xl p-3 hover:bg-canvas">
                <CheckboxField
                  checked={pinned}
                  onCheckedChange={(checked) => setPinned(checked === true)}
                />
                <span>
                  <strong className="block text-sm">Fixar no topo</strong>
                  <small className="mt-0.5 block leading-5 text-muted">
                    Mantém a publicação antes das demais nesta seção.
                  </small>
                </span>
              </label>
            </PopoverContent>
          </Popover>
        )}

        <button
          disabled={pending || imageScanning || !content.trim()}
          className="btn-primary mt-1 w-full px-4 sm:ml-auto sm:mt-0 sm:w-auto"
        >
          {pending ? (
            <LoadingSpinner label="Otimizando e publicando" />
          ) : (
            <Send className="size-4" aria-hidden />
          )}
          <span>{pending ? "Publicando…" : "Publicar"}</span>
        </button>
      </div>
    </form>
  );
}

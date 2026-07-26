"use client";
import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ImagePlus, Send, X } from "lucide-react";
import { toast } from "sonner";
import { createPost } from "@/app/actions";
import type { Role, Section } from "@/types/database";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { prepareImageForUpload } from "@/lib/prepare-image";
export function PostComposer({
  section = "FEED",
  role,
}: {
  section?: Section;
  role: Role;
}) {
  const form = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  const [images, setImages] = useState<Array<{ file: File; preview: string }>>(
    [],
  );
  function choose(files: FileList | null) {
    if (!files) return;
    const next = [...images];
    for (const file of Array.from(files)) {
      if (next.length >= 4) break;
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 10 * 1024 * 1024
      ) {
        toast.error(`${file.name}: formato ou tamanho inválido.`);
        continue;
      }
      next.push({ file, preview: URL.createObjectURL(file) });
    }
    setImages(next);
  }
  async function upload(x: { file: File }) {
    const fd = new FormData();
    fd.set("file", await prepareImageForUpload(x.file));
    fd.set("kind", "post");
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const j = (await r.json().catch(() => null)) as {
      error?: string;
      imageUrl?: string;
    } | null;
    if (!r.ok || !j?.imageUrl)
      throw new Error(
        j?.error ??
          (r.status === 413
            ? "A imagem excedeu o limite do servidor."
            : "Não foi possível enviar a imagem."),
      );
    return { ...j, altText: "Imagem da publicação" };
  }
  function submit(data: FormData) {
    start(async () => {
      try {
        const uploaded = await Promise.all(images.map(upload));
        const result = await createPost({
          title: String(data.get("title") || ""),
          content: String(data.get("content")),
          type: String(data.get("type")),
          section,
          official: data.get("official") === "on",
          pinned: data.get("pinned") === "on",
          images: uploaded,
        });
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Publicação criada.");
        form.current?.reset();
        setImages([]);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Falha ao publicar.");
      }
    });
  }
  return (
    <form ref={form} action={submit} className="card mb-6 p-5">
      <label>
        <span className="sr-only">Título opcional</span>
        <input
          name="title"
          maxLength={120}
          className="mb-2 w-full bg-transparent text-lg font-semibold outline-none placeholder:font-normal placeholder:text-muted"
          placeholder="Dê um título (opcional)"
        />
      </label>
      <label>
        <span className="sr-only">Conteúdo</span>
        <textarea
          name="content"
          required
          maxLength={5000}
          minLength={1}
          className="min-h-24 w-full resize-y bg-transparent leading-6 outline-none placeholder:text-muted"
          placeholder="O que você quer compartilhar com a comunidade?"
        />
      </label>
      {images.length > 0 && (
        <div className="my-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {images.map((x, i) => (
            <div
              key={x.preview}
              className="relative aspect-square overflow-hidden rounded-xl"
            >
              <Image
                src={x.preview}
                fill
                alt="Prévia da imagem"
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                aria-label="Remover imagem"
                onClick={() => setImages((v) => v.filter((_, n) => n !== i))}
                className="absolute right-1 top-1 grid size-9 place-items-center rounded-full bg-ink text-white"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <label className="btn-ghost cursor-pointer">
          <ImagePlus className="size-5" />
          Imagem
          <input
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => choose(e.target.files)}
          />
        </label>
        <select name="type" aria-label="Categoria" className="field w-auto">
          <option value="GENERAL">Geral</option>
          <option value="PEDAGOGICAL">Pedagógico</option>
          <option value="ANNOUNCEMENT">Comunicado</option>
          <option value="HEALTH">Saúde</option>
          <option value="SAFETY">Segurança</option>
          <option value="OPPORTUNITY">Oportunidade</option>
          <option value="CULTURE">Cultura</option>
          <option value="ENTREPRENEURSHIP">Empreendedorismo</option>
        </select>
        {role !== "STUDENT" && (
          <label className="flex min-h-11 items-center gap-2 px-2 text-sm">
            <input name="official" type="checkbox" /> Oficial
          </label>
        )}
        {role !== "STUDENT" && (
          <label className="flex min-h-11 items-center gap-2 px-2 text-sm">
            <input name="pinned" type="checkbox" /> Fixar
          </label>
        )}
        <button disabled={pending} className="btn-primary ml-auto">
          {pending ? (
            <LoadingSpinner label="Enviando publicação" />
          ) : (
            <Send className="size-4" />
          )}
          {pending ? "Publicando…" : "Publicar"}
        </button>
      </div>
    </form>
  );
}

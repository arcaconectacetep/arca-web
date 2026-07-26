"use client";

import Image from "next/image";
import { type RefObject, useEffect, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, GripVertical, ImagePlus, Save, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { replacePostImages } from "@/app/actions";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { prepareImageForUpload } from "@/lib/prepare-image";
import type { Post } from "@/types/database";

type StoredMedia = Post["post_images"][number] & { localKey: string };

export function PostMediaEditor({
  postId,
  initialImages,
  dialogRef,
}: {
  postId: string;
  initialImages: Post["post_images"];
  dialogRef: RefObject<HTMLDialogElement | null>;
}) {
  const router = useRouter();
  const [items, setItems] = useState<StoredMedia[]>([]);
  const [dragging, setDragging] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setItems(
      initialImages.map((image, index) => ({
        ...image,
        localKey: image.imgchest_image_id ?? `${image.image_url}-${index}`,
      })),
    );
  }, [initialImages]);

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length || from === to) return;
    setItems((current) => {
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  async function addFiles(files: FileList | null) {
    if (!files) return;
    const available = 4 - items.length;
    const selected = Array.from(files).slice(0, available);
    if (selected.length < files.length)
      toast.info("Cada publicação pode ter até quatro imagens.");

    for (const file of selected) {
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 10 * 1024 * 1024
      ) {
        toast.error(`${file.name}: use JPEG, PNG ou WebP de até 10 MB.`);
        continue;
      }
      try {
        const form = new FormData();
        form.set("file", await prepareImageForUpload(file));
        form.set("kind", "post");
        const response = await fetch("/api/upload", { method: "POST", body: form });
        const uploaded = (await response.json().catch(() => null)) as {
          error?: string;
          imageUrl?: string;
          thumbnailUrl?: string;
          imageId?: string;
        } | null;
        if (!response.ok || !uploaded?.imageUrl)
          throw new Error(uploaded?.error ?? "Não foi possível enviar a imagem.");
        setItems((current) => [
          ...current,
          {
            image_url: uploaded.imageUrl!,
            thumbnail_url: uploaded.thumbnailUrl ?? null,
            imgchest_image_id: uploaded.imageId ?? null,
            alt_text: "Imagem da publicação",
            localKey: uploaded.imageId ?? uploaded.imageUrl!,
          },
        ]);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha no upload.");
      }
    }
  }

  function save() {
    startTransition(async () => {
      const result = await replacePostImages(
        postId,
        items.map((item) => ({
          imageUrl: item.image_url,
          thumbnailUrl: item.thumbnail_url || undefined,
          imageId: item.imgchest_image_id || undefined,
          altText: item.alt_text,
        })),
      );
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Imagens atualizadas.");
      dialogRef.current?.close();
      router.refresh();
    });
  }

  return (
    <dialog
      ref={dialogRef}
      className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-2xl bg-paper p-0 text-ink shadow-2xl backdrop:bg-ink/45"
      onClose={() => setItems(initialImages.map((image, index) => ({ ...image, localKey: image.imgchest_image_id ?? `${image.image_url}-${index}` })))}
    >
      <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-paper p-5">
        <div>
          <p className="eyebrow">Mídia da publicação</p>
          <h2 className="mt-1 text-xl font-bold">Organizar imagens</h2>
          <p className="mt-1 text-sm text-muted">Altere a ordem, a descrição ou remova imagens.</p>
        </div>
        <button type="button" className="btn-ghost shrink-0" onClick={() => dialogRef.current?.close()} aria-label="Fechar editor de imagens"><X className="size-5" /></button>
      </header>

      <div className="space-y-4 p-5">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">Esta publicação ainda não tem imagens.</div>
        ) : (
          <ol className="grid gap-4 sm:grid-cols-2">
            {items.map((item, index) => (
              <li
                key={item.localKey}
                draggable
                onDragStart={() => setDragging(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => { if (dragging !== null) move(dragging, index); setDragging(null); }}
                onDragEnd={() => setDragging(null)}
                className={`rounded-xl bg-canvas p-3 transition-[opacity,box-shadow] ${dragging === index ? "opacity-60 ring-2 ring-brand" : ""}`}
              >
                <div className="relative aspect-video overflow-hidden rounded-lg bg-paper">
                  <Image src={item.thumbnail_url || item.image_url} alt={item.alt_text} fill className="object-cover" />
                  <span className="absolute left-2 top-2 grid size-9 cursor-grab place-items-center rounded-lg bg-ink/80 text-white" aria-hidden><GripVertical className="size-4" /></span>
                  <button type="button" className="absolute right-2 top-2 grid size-9 place-items-center rounded-lg bg-ink/80 text-white hover:bg-danger" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remover imagem ${index + 1}`}><Trash2 className="size-4" /></button>
                </div>
                <label className="mt-3 block">
                  <span className="label">Texto alternativo da imagem {index + 1}</span>
                  <input className="field" maxLength={200} value={item.alt_text} onChange={(event) => setItems((current) => current.map((currentItem, itemIndex) => itemIndex === index ? { ...currentItem, alt_text: event.target.value } : currentItem))} placeholder="Descreva o que aparece na imagem" />
                </label>
                <div className="mt-2 flex gap-1">
                  <button type="button" className="btn-ghost" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label={`Mover imagem ${index + 1} para a esquerda`}><ArrowLeft className="size-4" /></button>
                  <button type="button" className="btn-ghost" disabled={index === items.length - 1} onClick={() => move(index, index + 1)} aria-label={`Mover imagem ${index + 1} para a direita`}><ArrowRight className="size-4" /></button>
                  <span className="ml-auto self-center text-xs tabular-nums text-muted">{index + 1} de {items.length}</span>
                </div>
              </li>
            ))}
          </ol>
        )}
        <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center">
          <label className={`btn-ghost cursor-pointer ${items.length >= 4 || pending ? "pointer-events-none opacity-50" : ""}`}>
            <ImagePlus className="size-4" />Adicionar imagens
            <input className="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={items.length >= 4 || pending} onChange={(event) => void addFiles(event.target.files)} />
          </label>
          <p className="text-xs text-muted">Até 4 imagens, 10 MB cada.</p>
          <button type="button" className="btn-primary sm:ml-auto" disabled={pending} onClick={save}>{pending ? <LoadingSpinner label="Salvando imagens" /> : <Save className="size-4" />}{pending ? "Salvando…" : "Salvar imagens"}</button>
        </div>
      </div>
    </dialog>
  );
}

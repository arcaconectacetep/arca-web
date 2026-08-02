"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, GripVertical, ImagePlus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { replacePostImages } from "@/app/actions";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { prepareImageForUpload } from "@/lib/prepare-image";
import { inspectImageForAdultContent } from "@/lib/nsfw-image-moderation";
import type { Post } from "@/types/database";
import { Dialog, DialogContent } from "@/components/ui/radix-dialog";

type StoredMedia = Post["post_images"][number] & { localKey: string };

export function PostMediaEditor({
  postId,
  initialImages,
  open,
  onOpenChange,
}: {
  postId: string;
  initialImages: Post["post_images"];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [items, setItems] = useState<StoredMedia[]>([]);
  const [dragging, setDragging] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [imageScanning, setImageScanning] = useState(false);

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

    setImageScanning(true);
    for (const file of selected) {
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 10 * 1024 * 1024
      ) {
        toast.error(`${file.name}: use JPEG, PNG ou WebP de até 10 MB.`);
        continue;
      }
      try {
        const inspection = await inspectImageForAdultContent(file);
        if (inspection.blocked) {
          toast.error(`${file.name}: a imagem parece conter conteúdo adulto e foi bloqueada.`);
          continue;
        }
        const form = new FormData();
        form.set("file", await prepareImageForUpload(file));
        form.set("kind", "post");
        const response = await fetch("/api/upload", { method: "POST", body: form });
        const uploaded = (await response.json().catch(() => null)) as {
          error?: string;
          imageUrl?: string;
          thumbnailUrl?: string;
          imageId?: string;
          postId?: string;
        } | null;
        if (!response.ok || !uploaded?.imageUrl)
          throw new Error(uploaded?.error ?? "Não foi possível enviar a imagem.");
        setItems((current) => [
          ...current,
          {
            image_url: uploaded.imageUrl!,
            thumbnail_url: uploaded.thumbnailUrl ?? null,
            imgchest_image_id: uploaded.imageId ?? null,
            imgchest_post_id: uploaded.postId ?? null,
            alt_text: "Imagem da publicação",
            localKey: uploaded.imageId ?? uploaded.imageUrl!,
          },
        ]);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha no upload.");
      }
    }
    setImageScanning(false);
  }

  function save() {
    startTransition(async () => {
      const result = await replacePostImages(
        postId,
        items.map((item) => ({
          imageUrl: item.image_url,
          thumbnailUrl: item.thumbnail_url || undefined,
          imageId: item.imgchest_image_id || undefined,
          postId: item.imgchest_post_id || undefined,
          altText: item.alt_text,
        })),
      );
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (result.data?.cleanupWarning)
        toast.warning("Publicação atualizada, mas uma imagem antiga não pôde ser removida do provedor.");
      else toast.success("Imagens atualizadas.");
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { onOpenChange(nextOpen); if (!nextOpen) setItems(initialImages.map((image, index) => ({ ...image, localKey: image.imgchest_image_id ?? `${image.image_url}-${index}` }))); }}>
      <DialogContent className="max-w-3xl" title="Organizar imagens" description="Altere a ordem, a descrição ou remova imagens.">
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
          <label className={`btn-ghost cursor-pointer border border-line/70 bg-paper shadow-quiet ${items.length >= 4 || pending || imageScanning ? "pointer-events-none opacity-50" : ""}`}>
            {imageScanning ? <LoadingSpinner label="Analisando imagem" /> : <ImagePlus className="size-4" />}{imageScanning ? "Analisando…" : "Adicionar imagens"}
            <input className="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={items.length >= 4 || pending || imageScanning} onChange={(event) => void addFiles(event.target.files)} />
          </label>
          <p className="text-xs text-muted">Até 4 imagens, 10 MB cada.</p>
          <button type="button" className="btn-primary sm:ml-auto" disabled={pending || imageScanning} onClick={save}>{pending ? <LoadingSpinner label="Salvando imagens" /> : <Save className="size-4" />}{pending ? "Salvando…" : "Salvar imagens"}</button>
        </div>
      </div>
      </DialogContent>
    </Dialog>
  );
}

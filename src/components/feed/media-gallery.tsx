"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

type Media = { image_url: string; alt_text: string; position?: number };
export function MediaGallery({ images }: { images: Media[] }) {
  const ordered = [...images].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState(0);
  const open = (index: number) => { setActive(index); dialog.current?.showModal(); };
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (!dialog.current?.open) return;
      if (event.key === "ArrowRight") setActive((value) => (value + 1) % ordered.length);
      if (event.key === "ArrowLeft") setActive((value) => (value - 1 + ordered.length) % ordered.length);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [ordered.length]);
  return <>
    <div className={`grid gap-1 ${ordered.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
      {ordered.map((image, index) => <button type="button" key={image.image_url} onClick={() => open(index)} className={`group relative overflow-hidden bg-brand-soft ${ordered.length === 3 && index === 0 ? "col-span-2 aspect-[16/8]" : "aspect-[16/10]"}`} aria-label={`Ampliar imagem ${index + 1} de ${ordered.length}`}>
        <Image src={image.image_url} fill sizes="(max-width: 768px) 100vw, 680px" alt={image.alt_text || `Imagem ${index + 1} da publicação`} className="object-cover transition-transform duration-200 group-hover:scale-[1.015]" />
        <span className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-ink/75 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"><Expand className="size-4" /></span>
      </button>)}
    </div>
    <dialog ref={dialog} className="media-viewer m-auto h-[100dvh] w-screen max-w-none bg-ink/95 p-0 text-white backdrop:bg-ink/80" onClick={(event) => event.target === dialog.current && dialog.current?.close()}>
      <div className="grid h-full grid-rows-[64px_1fr_56px]">
        <header className="flex items-center justify-between px-4"><span className="text-sm font-semibold tabular-nums">{active + 1} de {ordered.length}</span><button className="grid size-11 place-items-center rounded-xl hover:bg-white/10" onClick={() => dialog.current?.close()} aria-label="Fechar imagem"><X /></button></header>
        <div className="relative min-h-0"><Image src={ordered[active].image_url} fill sizes="100vw" alt={ordered[active].alt_text || `Imagem ${active + 1}`} className="object-contain" priority /></div>
        <div className="flex items-center justify-center gap-4">{ordered.length > 1 && <><button className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20" onClick={() => setActive((active - 1 + ordered.length) % ordered.length)} aria-label="Imagem anterior"><ChevronLeft /></button><button className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20" onClick={() => setActive((active + 1) % ordered.length)} aria-label="Próxima imagem"><ChevronRight /></button></>}</div>
      </div>
    </dialog>
  </>;
}

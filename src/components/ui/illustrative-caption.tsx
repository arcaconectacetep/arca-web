import { CircleAlert } from "lucide-react";

export function IllustrativeCaption({ description }: { description: string }) {
  return (
    <figcaption className="absolute bottom-3 right-8 z-10">
      <details className="group relative">
        <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-full bg-paper/95 text-muted shadow-lift backdrop-blur transition-[background-color,color,transform] duration-150 hover:bg-paper hover:text-brand focus-visible:outline focus-visible:outline-3 focus-visible:outline-brand/30 active:scale-[0.97] [&::-webkit-details-marker]:hidden">
          <CircleAlert className="size-5" aria-hidden />
          <span className="sr-only">Informações sobre esta imagem</span>
        </summary>
        <div className="absolute bottom-14 right-0 w-[min(22rem,calc(100vw-4rem))] rounded-xl bg-paper p-4 text-xs leading-5 text-muted shadow-lift">
          <p>
            {description} Imagem ilustrativa gerada por inteligência artificial
            para composição visual. As pessoas retratadas não participam nem
            representam integrantes do projeto ConectaARCA.
          </p>
        </div>
      </details>
    </figcaption>
  );
}

import { CircleAlert } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function IllustrativeCaption({ description }: { description: string }) {
  return (
    <figcaption className="absolute bottom-3 right-8 z-10">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full bg-paper/95 text-muted shadow-lift backdrop-blur transition-[background-color,color,transform] duration-150 hover:bg-paper hover:text-brand active:scale-[0.97]"
            aria-label="Informações sobre esta imagem"
          >
            <CircleAlert className="size-5" aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          className="w-[min(22rem,calc(100vw-4rem))] p-4 text-xs leading-5 text-muted"
        >
          <p>
            {description} Imagem ilustrativa gerada por inteligência artificial
            para composição visual. As pessoas retratadas não participam nem
            representam integrantes do projeto ConectaARCA.
          </p>
        </PopoverContent>
      </Popover>
    </figcaption>
  );
}

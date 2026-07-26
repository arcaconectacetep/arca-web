import { Info } from "lucide-react";

export function IllustrativeCaption({ description }: { description: string }) {
  return (
    <figcaption className="mt-3 flex gap-2 text-xs leading-5 text-muted">
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <span>
        {description} Imagem meramente ilustrativa, gerada por inteligência
        artificial para composição visual. As pessoas retratadas não participam nem representam integrantes
        do projeto ConectaCETEP/ARCA.
      </span>
    </figcaption>
  );
}

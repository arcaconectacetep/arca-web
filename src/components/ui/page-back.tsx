"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function PageBack({
  fallback = "/inicio",
  label = "Voltar",
}: {
  fallback?: string;
  label?: string;
}) {
  const router = useRouter();

  function goBack() {
    try {
      if (
        document.referrer &&
        new URL(document.referrer).origin === window.location.origin
      ) {
        router.back();
        return;
      }
    } catch {
      // Usa o destino seguro abaixo quando o referrer não puder ser interpretado.
    }
    router.push(fallback);
  }

  return (
    <div className="sticky top-16 z-10 -mx-1 mb-3 bg-canvas/95 py-1 backdrop-blur lg:static lg:mx-0 lg:mb-4 lg:bg-transparent lg:py-0 lg:backdrop-blur-none">
      <button className="btn-ghost" type="button" onClick={goBack}>
        <ArrowLeft className="size-4" /> {label}
      </button>
    </div>
  );
}

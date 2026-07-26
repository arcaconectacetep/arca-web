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
    <button className="btn-ghost -ml-3 mb-4" type="button" onClick={goBack}>
      <ArrowLeft className="size-4" /> {label}
    </button>
  );
}

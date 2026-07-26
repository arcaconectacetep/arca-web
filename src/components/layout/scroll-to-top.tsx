"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (window.location.hash) return;

    const frame = window.requestAnimationFrame(() => {
      const reduced =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        Boolean(document.querySelector('[data-motion="true"]'));
      window.scrollTo({ top: 0, left: 0, behavior: reduced ? "auto" : "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, query]);

  return null;
}

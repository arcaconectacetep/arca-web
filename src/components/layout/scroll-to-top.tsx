"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      Boolean(document.querySelector('[data-motion="true"]'));
    const hash = decodeURIComponent(window.location.hash.slice(1));
    let frame = 0;
    let retry: number | undefined;

    if (hash) {
      let attempts = 0;
      const revealTarget = () => {
        const target = document.getElementById(hash);
        if (target) {
          frame = window.requestAnimationFrame(() =>
            target.scrollIntoView({
              behavior: reduced ? "auto" : "smooth",
              block: "center",
            }),
          );
          return;
        }
        attempts += 1;
        if (attempts < 12) retry = window.setTimeout(revealTarget, 60);
      };
      revealTarget();
      return () => {
        if (frame) window.cancelAnimationFrame(frame);
        if (retry !== undefined) window.clearTimeout(retry);
      };
    }

    frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: reduced ? "auto" : "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, query]);

  return null;
}

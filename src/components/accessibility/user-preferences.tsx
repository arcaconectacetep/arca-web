"use client";

import { useEffect } from "react";

export function UserPreferences({ fontScale, colorMode, fontFamily }: { fontScale: number; colorMode: string; fontFamily: string }) {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.fontSize;
    root.style.fontSize = `${16 * fontScale}px`;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyMode = () => {
      const resolved = colorMode === "SYSTEM" ? (media.matches ? "dark" : "light") : colorMode.toLowerCase();
      root.dataset.colorMode = resolved;
      root.dataset.font = fontFamily;
      root.style.colorScheme = resolved;
      if (document.cookie.includes("arca_cookie_consent=personalization")) {
        localStorage.setItem("arca-color-mode", colorMode);
      } else {
        localStorage.removeItem("arca-color-mode");
      }
    };
    applyMode();
    media.addEventListener("change", applyMode);
    return () => {
      root.style.fontSize = previous;
      media.removeEventListener("change", applyMode);
    };
  }, [fontScale, colorMode, fontFamily]);
  return null;
}

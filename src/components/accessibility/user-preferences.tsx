"use client";

import { useEffect } from "react";

export function UserPreferences({ fontScale }: { fontScale: number }) {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.fontSize;
    root.style.fontSize = `${16 * fontScale}px`;
    return () => {
      root.style.fontSize = previous;
    };
  }, [fontScale]);
  return null;
}

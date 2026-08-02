import twemoji from "@twemoji/api";
import type { HTMLAttributes } from "react";

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]!,
  );
}

export function TwemojiText({
  text,
  className = "",
  ...props
}: Omit<HTMLAttributes<HTMLSpanElement>, "children"> & { text: string }) {
  const html = twemoji.parse(escapeHtml(text), {
    folder: "svg",
    ext: ".svg",
    className: "twemoji",
  });

  return (
    <span
      {...props}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

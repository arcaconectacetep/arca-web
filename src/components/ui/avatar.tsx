import Image from "next/image";
export function Avatar({
  url,
  name,
  size = 44,
}: {
  url?: string | null;
  name?: string | null;
  size?: number;
}) {
  const initials = (name || "C")
    .split(" ")
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();
  return url ? (
    <span
      className="relative block aspect-square shrink-0 overflow-hidden rounded-full bg-paper ring-1 ring-line"
      style={{ width: size, height: size }}
    >
      <Image
        src={url}
        alt={`Foto de ${name || "usuário"}`}
        fill
        sizes={`${size}px`}
        className="object-cover"
      />
    </span>
  ) : (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full bg-brand-soft font-bold text-brand"
      style={{ width: size, height: size }}
    >
      {initials}
    </span>
  );
}

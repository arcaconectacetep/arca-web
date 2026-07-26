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
    <Image
      src={url}
      alt={`Foto de ${name || "usuário"}`}
      width={size}
      height={size}
      className="shrink-0 rounded-full object-cover ring-1 ring-line"
    />
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

import Image from "next/image";
import Link from "next/link";

export function BrandLogo({
  href = "/",
  compact = false,
  className = "",
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="ConectaCETEP"
      className={`group inline-flex items-center gap-2.5 font-extrabold tracking-[-0.02em] ${className}`}
    >
      <Image
        src="/brand/conectacetep-icon.png"
        width={40}
        height={40}
        priority
        alt=""
        className="size-9 rounded-[11px] shadow-sm ring-1 ring-white/10 transition-transform duration-200 group-hover:rotate-[-4deg] group-hover:scale-[1.04]"
      />
      {!compact && <span>ConectaCETEP</span>}
    </Link>
  );
}

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function AdminPagination({
  path,
  page,
  totalPages,
  params = {},
}: {
  path: string;
  page: number;
  totalPages: number;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;
  const href = (target: number) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value && query.set(key, value));
    if (target > 1) query.set("pagina", String(target));
    const suffix = query.toString();
    return suffix ? `${path}?${suffix}` : path;
  };
  return (
    <nav className="mt-5 flex items-center justify-between gap-3" aria-label="Paginação">
      {page > 1 ? (
        <Link className="btn-secondary" href={href(page - 1)}>
          <ChevronLeft className="size-4" /> Anterior
        </Link>
      ) : <span />}
      <span className="text-sm font-semibold text-muted">
        Página <span className="text-ink tabular-nums">{page}</span> de{" "}
        <span className="text-ink tabular-nums">{totalPages}</span>
      </span>
      {page < totalPages ? (
        <Link className="btn-secondary" href={href(page + 1)}>
          Próxima <ChevronRight className="size-4" />
        </Link>
      ) : <span />}
    </nav>
  );
}

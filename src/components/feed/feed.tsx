import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PostComposer } from "./post-composer";
import { PostCard } from "./post-card";
import type { Post, PostType, Section } from "@/types/database";
import { SelectField } from "@/components/ui/select-field";

const PAGE_SIZE = 10;
const categories: Array<{ value: PostType | ""; label: string }> = [
  { value: "", label: "Todas as categorias" },
  { value: "GENERAL", label: "Geral" },
  { value: "ANNOUNCEMENT", label: "Comunicados" },
  { value: "PEDAGOGICAL", label: "Pedagógico" },
  { value: "HEALTH", label: "Saúde" },
  { value: "SAFETY", label: "Segurança" },
  { value: "OPPORTUNITY", label: "Oportunidades" },
  { value: "CULTURE", label: "Cultura" },
  { value: "ENTREPRENEURSHIP", label: "Empreendedorismo" },
];

function pageHref(
  basePath: string,
  page: number,
  search: string,
  type: string,
) {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (type) params.set("categoria", type);
  if (page > 1) params.set("pagina", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export async function Feed({
  section = "FEED",
  composer = true,
  search = "",
  type = "",
  page = 1,
}: {
  section?: Section;
  composer?: boolean;
  search?: string;
  type?: string;
  page?: number;
}) {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;

  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const validType = categories.some((category) => category.value === type)
    ? type
    : "";
  const normalizedSearch = search.trim().slice(0, 80);
  const safeSearch = normalizedSearch
    .replace(/[^\p{L}\p{N}\s@#_-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  const currentPage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  const from = (currentPage - 1) * PAGE_SIZE;

  let query = db
    .from("posts")
    .select(
      "*,profiles!posts_author_id_fkey(username,full_name,avatar_url,role),post_images(image_url,thumbnail_url,imgchest_image_id,imgchest_post_id,alt_text,position),post_likes(user_id),comments(id)",
      { count: "exact" },
    )
    .eq("section", section)
    .is("deleted_at", null)
    .is("hidden_at", null)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (validType) query = query.eq("type", validType);
  if (safeSearch)
    query = query.or(
      `title.ilike.%${safeSearch}%,content.ilike.%${safeSearch}%`,
    );
  const { data, error, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const basePath =
    section === "FEED"
      ? "/inicio"
      : section === "PEDAGOGICAL"
        ? "/espaco"
        : section === "WALL"
          ? "/mural"
          : "/tendencias";
  const filtering = Boolean(normalizedSearch || validType);

  return (
    <div>
      {composer && (
        <PostComposer section={section} role={profile?.role ?? "STUDENT"} />
      )}

      <form
        method="get"
        className="card mb-5 grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_220px_auto]"
        role="search"
      >
        <label className="relative">
          <span className="sr-only">Buscar publicações</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            className="field pl-10"
            name="q"
            defaultValue={normalizedSearch}
            maxLength={80}
            placeholder="Buscar no conteúdo…"
          />
        </label>
        <label className="relative">
          <span className="sr-only">Filtrar por categoria</span>
          <SlidersHorizontal className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <SelectField className="pl-10" name="categoria" defaultValue={validType} options={categories} />
        </label>
        <button className="btn-primary" type="submit">
          Aplicar
        </button>
      </form>

      {filtering && (
        <div className="mb-4 flex items-center justify-between gap-3 text-sm text-muted">
          <p>
            <strong className="text-ink tabular-nums">{count ?? 0}</strong>{" "}
            {count === 1 ? "resultado encontrado" : "resultados encontrados"}
          </p>
          <Link
            className="inline-flex min-h-10 items-center gap-1.5 font-semibold text-brand hover:underline"
            href={basePath}
          >
            <X className="size-4" />
            Limpar filtros
          </Link>
        </div>
      )}

      {error ? (
        <div role="alert" className="card p-8 text-center text-danger">
          Não foi possível carregar as publicações.
        </div>
      ) : !data?.length ? (
        <div className="card p-10 text-center">
          <h2 className="text-xl font-semibold">
            {filtering
              ? "Nenhuma publicação encontrada."
              : "Ainda não há publicações aqui."}
          </h2>
          <p className="mt-2 text-muted">
            {filtering
              ? "Tente remover um filtro ou buscar outro termo."
              : "Compartilhe a primeira contribuição com a comunidade."}
          </p>
          {filtering && (
            <Link className="btn-secondary mt-5" href={basePath}>
              Ver todas as publicações
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {(data as unknown as Post[]).map((post) => (
            <PostCard key={post.id} post={post} currentUser={user.id} />
          ))}
        </div>
      )}

      {!error && totalPages > 1 && (
        <nav
          className="mt-7 flex items-center justify-between gap-3"
          aria-label="Paginação do feed"
        >
          {currentPage > 1 ? (
            <Link
              className="btn-secondary"
              href={pageHref(
                basePath,
                currentPage - 1,
                normalizedSearch,
                validType,
              )}
            >
              <ChevronLeft className="size-4" />
              Anterior
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm font-semibold text-muted">
            Página{" "}
            <strong className="text-ink tabular-nums">{currentPage}</strong> de{" "}
            <strong className="text-ink tabular-nums">{totalPages}</strong>
          </span>
          {currentPage < totalPages ? (
            <Link
              className="btn-secondary"
              href={pageHref(
                basePath,
                currentPage + 1,
                normalizedSearch,
                validType,
              )}
            >
              Próxima
              <ChevronRight className="size-4" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Clock3,
  FileText,
  GraduationCap,
  Heart,
  Pencil,
  UsersRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { PostCard } from "@/components/feed/post-card";
import { TwemojiText } from "@/components/ui/twemoji-text";
import { labelFor, roleLabels } from "@/lib/labels";
import { formatAppMonthYear } from "@/lib/date";
import type { Post } from "@/types/database";

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  const { data: profile } = await db
    .from("profiles")
    .select("*,courses(name)")
    .eq("username", username)
    .single();
  if (!profile || !user) notFound();

  const { data: postIds, count: postCount } = await db
    .from("posts")
    .select("id", { count: "exact" })
    .eq("author_id", profile.id)
    .is("deleted_at", null)
    .is("hidden_at", null);

  const [likesResult, recentResult] = await Promise.all([
    postIds?.length
      ? db
          .from("post_likes")
          .select("post_id", { count: "exact", head: true })
          .in(
            "post_id",
            postIds.map((post) => post.id),
          )
      : Promise.resolve({ count: 0 }),
    db
      .from("posts")
      .select(
        "*,profiles!posts_author_id_fkey(username,full_name,avatar_url,role,class_name),post_images(image_url,thumbnail_url,imgchest_image_id,imgchest_post_id,alt_text,position),post_likes(user_id),comments(id)",
      )
      .eq("author_id", profile.id)
      .is("deleted_at", null)
      .is("hidden_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);
  const ownProfile = user.id === profile.id;
  const firstName = profile.full_name?.trim().split(/\s+/)[0] || `@${username}`;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section className="card overflow-hidden">
        <div className="h-1 bg-brand" aria-hidden />
        <div className="p-5 sm:p-7">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="shrink-0 rounded-full bg-paper p-1 shadow-quiet">
              <Avatar
                url={profile.avatar_url}
                name={profile.full_name}
                size={108}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="break-words text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                    <TwemojiText text={profile.full_name || `@${username}`} />
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-muted">@{profile.username}</span>
                    <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand">
                      {labelFor(roleLabels, profile.role)}
                    </span>
                  </div>
                </div>
                {ownProfile && (
                  <Link href="/configuracoes" className="btn-secondary shrink-0">
                    <Pencil className="size-4" aria-hidden />
                    Editar perfil
                  </Link>
                )}
              </div>

              {profile.bio ? (
                <TwemojiText
                  text={profile.bio}
                  className="mt-5 block max-w-2xl whitespace-pre-wrap leading-7 text-ink/90"
                />
              ) : (
                <p className="mt-5 text-sm italic text-muted">
                  {ownProfile
                    ? "Adicione uma biografia para se apresentar à comunidade."
                    : "Este perfil ainda não tem biografia."}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-2 text-sm text-muted">
                {profile.courses?.name && (
                  <span className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-canvas px-3">
                    <GraduationCap className="size-4" aria-hidden />
                    {profile.courses.name}
                  </span>
                )}
                {profile.class_name && (
                  <span className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-canvas px-3">
                    <UsersRound className="size-4" aria-hidden />
                    Turma {profile.class_name}
                  </span>
                )}
                {profile.shift && (
                  <span className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-canvas px-3">
                    <Clock3 className="size-4" aria-hidden />
                    {profile.shift}
                  </span>
                )}
                <span className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-canvas px-3">
                  <CalendarDays className="size-4" aria-hidden />
                  Desde {formatAppMonthYear(profile.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 border-t border-line/70 bg-canvas/45">
          <div className="flex items-center gap-3 p-4 sm:px-7 sm:py-5">
            <FileText className="size-5 shrink-0 text-brand" aria-hidden />
            <div>
              <dd className="text-xl font-extrabold leading-none tabular-nums">
                {postCount ?? 0}
              </dd>
              <dt className="mt-1 text-xs text-muted">publicações</dt>
            </div>
          </div>
          <div className="flex items-center gap-3 border-l border-line/70 p-4 sm:px-7 sm:py-5">
            <Heart className="size-5 shrink-0 text-danger" aria-hidden />
            <div>
              <dd className="text-xl font-extrabold leading-none tabular-nums">
                {likesResult.count ?? 0}
              </dd>
              <dt className="mt-1 text-xs text-muted">curtidas recebidas</dt>
            </div>
          </div>
        </dl>
      </section>

      <section aria-labelledby="profile-posts">
        <div className="mb-4 flex items-end justify-between gap-4 px-1">
          <div>
            <p className="eyebrow">Atividade</p>
            <h2 id="profile-posts" className="section-title mt-1">
              Publicações de {firstName}
            </h2>
          </div>
          {(postCount ?? 0) > 5 && (
            <span className="text-xs font-semibold text-muted">
              Mostrando as 5 mais recentes
            </span>
          )}
        </div>
        {recentResult.data?.length ? (
          <div className="space-y-5">
            {(recentResult.data as unknown as Post[]).map((post) => (
              <PostCard key={post.id} post={post} currentUser={user.id} />
            ))}
          </div>
        ) : (
          <div className="card px-6 py-10 text-center">
            <FileText className="mx-auto size-6 text-muted" aria-hidden />
            <p className="mt-3 font-semibold">Nenhuma publicação ainda</p>
            <p className="mt-1 text-sm text-muted">
              {ownProfile
                ? "Sua próxima contribuição aparecerá aqui."
                : "As contribuições deste perfil aparecerão aqui."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

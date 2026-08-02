create table public.comment_reports(
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  details text check(char_length(details) <= 1000),
  status public.report_status not null default 'OPEN',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(comment_id, reporter_id)
);

create index comment_reports_status_idx
  on public.comment_reports(status, created_at desc);

alter table public.comment_reports enable row level security;

create policy comment_reports_add
  on public.comment_reports
  for insert
  to authenticated
  with check(
    reporter_id = auth.uid()
    and public.current_user_role() is not null
  );

create policy comment_reports_staff
  on public.comment_reports
  for all
  to authenticated
  using(public.is_staff())
  with check(public.is_staff());

create or replace function public.guard_community_content()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  value text;
  compact text;
begin
  value := lower(coalesce(new.content, ''));
  if tg_table_name = 'posts' then
    value := value || ' ' || lower(coalesce(new.title, ''));
  end if;

  compact := regexp_replace(value, '[^a-z0-9.]', '', 'g');
  if compact ~ '(pornhub|xvideos|xnxx|xhamster|redtube|youporn|spankbang|brazzers|onlyfans|chaturbate|stripchat)'
    or value ~ '(^|[^[:alnum:]])(pornografia|pornografico|porno|hentai|nudes)([^[:alnum:]]|$)'
    or value ~ '(nudez[[:space:]]+explicita|sexo[[:space:]]+explicito|videos?[[:space:]]+de[[:space:]]+sexo|conteudo[[:space:]]+adulto)'
  then
    raise exception 'Conteúdo sexualmente explícito não é permitido.'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger guard_posts_community_content
before insert or update of title, content on public.posts
for each row execute function public.guard_community_content();

create trigger guard_comments_community_content
before insert or update of content on public.comments
for each row execute function public.guard_community_content();

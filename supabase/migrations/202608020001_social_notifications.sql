alter table public.notifications
  add column actor_id uuid references public.profiles(id) on delete set null,
  add column post_id uuid references public.posts(id) on delete set null;

create index notifications_actor_idx
  on public.notifications(actor_id)
  where actor_id is not null;

create index notifications_post_idx
  on public.notifications(post_id)
  where post_id is not null;

create or replace function public.guard_notification_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.recipient_id := old.recipient_id;
  new.type := old.type;
  new.title := old.title;
  new.body := old.body;
  new.href := old.href;
  new.actor_id := old.actor_id;
  new.post_id := old.post_id;
  new.created_at := old.created_at;
  return new;
end;
$$;

create or replace function public.social_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  post_owner uuid;
begin
  select author_id into post_owner
  from public.posts
  where id = new.post_id;

  if post_owner is not null and post_owner <> new.user_id then
    insert into public.notifications(
      recipient_id, type, title, body, href, actor_id, post_id
    ) values (
      post_owner,
      'LIKE',
      'Nova curtida',
      'Sua publicação recebeu uma curtida.',
      '/publicacao/' || new.post_id::text,
      new.user_id,
      new.post_id
    );
  end if;
  return new;
end;
$$;

create or replace function public.on_comment_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  post_owner uuid;
begin
  select author_id into post_owner
  from public.posts
  where id = new.post_id;

  if post_owner is not null and post_owner <> new.author_id then
    insert into public.notifications(
      recipient_id, type, title, body, href, actor_id, post_id
    ) values (
      post_owner,
      'COMMENT',
      'Novo comentário',
      left(new.content, 180),
      '/publicacao/' || new.post_id::text || '#comentarios',
      new.author_id,
      new.post_id
    );
  end if;
  return new;
end;
$$;

create or replace function public.on_support_status_changed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    insert into public.support_alert_events(
      alert_id, actor_id, event_type, previous_status, new_status, metadata
    ) values (
      new.id, auth.uid(), 'STATUS_CHANGED', old.status, new.status,
      jsonb_build_object('internal', false)
    );

    insert into public.notifications(
      recipient_id, type, title, body, href, actor_id
    ) values (
      new.author_id,
      'SUPPORT_UPDATE',
      'Solicitação atualizada',
      'O status de uma solicitação de suporte foi atualizado.',
      '/suporte/' || new.id::text,
      auth.uid()
    );
  end if;
  return new;
end;
$$;

create or replace function public.alert_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.support_alert_events(
    alert_id, actor_id, event_type, new_status, metadata
  ) values (
    new.id, new.author_id, 'CREATED', new.status, '{"internal":false}'
  );

  insert into public.notifications(
    recipient_id, type, title, body, href, actor_id
  )
  select
    id,
    'ADMIN',
    'Nova solicitação de suporte',
    'Uma nova solicitação aguarda acolhimento.',
    '/admin/alertas',
    new.author_id
  from public.profiles
  where role in ('STAFF', 'ADMIN')
    and suspended_at is null
    and id <> new.author_id;

  return new;
end;
$$;

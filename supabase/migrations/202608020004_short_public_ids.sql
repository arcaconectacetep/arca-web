create function public.generate_short_id()
returns text
language sql
volatile
set search_path = ''
as $$
  select lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
$$;

alter table public.posts
  add column short_id text not null default public.generate_short_id(),
  add constraint posts_short_id_format check (short_id ~ '^[0-9a-f]{10}$'),
  add constraint posts_short_id_key unique (short_id);

alter table public.comments
  add column short_id text not null default public.generate_short_id(),
  add constraint comments_short_id_format check (short_id ~ '^[0-9a-f]{10}$'),
  add constraint comments_short_id_key unique (short_id);

drop trigger if exists guard_notification_update on public.notifications;

update public.notifications as notification
set href = '/publicacao/' || post.short_id
from public.posts as post
where notification.type = 'LIKE'
  and notification.post_id = post.id;

update public.notifications as notification
set href = '/publicacao/' || post.short_id || '#comentario-' || comment.short_id
from public.posts as post, public.comments as comment
where notification.type = 'COMMENT'
  and notification.post_id = post.id
  and notification.comment_id = comment.id;

create trigger guard_notification_update
before update on public.notifications
for each row execute function public.guard_notification_update();

create or replace function public.social_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  post_owner uuid;
  post_short_id text;
begin
  select author_id, short_id into post_owner, post_short_id
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
      '/publicacao/' || post_short_id,
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
  post_short_id text;
begin
  select author_id, short_id into post_owner, post_short_id
  from public.posts
  where id = new.post_id;

  if post_owner is not null and post_owner <> new.author_id then
    insert into public.notifications(
      recipient_id, type, title, body, href, actor_id, post_id, comment_id
    ) values (
      post_owner,
      'COMMENT',
      'Novo comentário',
      left(new.content, 180),
      '/publicacao/' || post_short_id || '#comentario-' || new.short_id,
      new.author_id,
      new.post_id,
      new.id
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
      '/suporte/' || new.protocol,
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
    '/admin/alertas/' || new.protocol,
    new.author_id
  from public.profiles
  where role in ('STAFF', 'ADMIN')
    and suspended_at is null
    and id <> new.author_id;

  return new;
end;
$$;

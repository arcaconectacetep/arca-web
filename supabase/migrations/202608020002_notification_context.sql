alter table public.notifications
  add column comment_id uuid references public.comments(id) on delete set null;

create index notifications_comment_idx
  on public.notifications(comment_id)
  where comment_id is not null;

drop trigger if exists guard_notification_update on public.notifications;

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
  new.comment_id := old.comment_id;
  new.created_at := old.created_at;
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
      recipient_id, type, title, body, href, actor_id, post_id, comment_id
    ) values (
      post_owner,
      'COMMENT',
      'Novo comentário',
      left(new.content, 180),
      '/publicacao/' || new.post_id::text || '#comentario-' || new.id::text,
      new.author_id,
      new.post_id,
      new.id
    );
  end if;
  return new;
end;
$$;

update public.notifications as notification
set
  comment_id = comment.id,
  href = '/publicacao/' || comment.post_id::text || '#comentario-' || comment.id::text
from public.comments as comment
where notification.type = 'COMMENT'
  and notification.comment_id is null
  and notification.actor_id = comment.author_id
  and notification.post_id = comment.post_id
  and notification.body = left(comment.content, 180)
  and abs(extract(epoch from (notification.created_at - comment.created_at))) < 10;

create trigger guard_notification_update
before update on public.notifications
for each row execute function public.guard_notification_update();

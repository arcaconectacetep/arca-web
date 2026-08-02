drop trigger if exists guard_notification_update on public.notifications;

with matches as (
  select distinct on (notification.id)
    notification.id as notification_id,
    post_like.user_id as actor_id,
    post_like.post_id
  from public.notifications as notification
  join public.posts as post
    on post.author_id = notification.recipient_id
  join public.post_likes as post_like
    on post_like.post_id = post.id
   and post_like.user_id <> notification.recipient_id
   and abs(extract(epoch from (
     notification.created_at - post_like.created_at
   ))) < 1
  where notification.type = 'LIKE'
    and notification.actor_id is null
  order by
    notification.id,
    abs(extract(epoch from (
      notification.created_at - post_like.created_at
    )))
)
update public.notifications as notification
set
  actor_id = matches.actor_id,
  post_id = matches.post_id,
  title = 'Nova curtida',
  body = 'Sua publicação recebeu uma curtida.',
  href = '/publicacao/' || matches.post_id::text
from matches
where notification.id = matches.notification_id;

with matches as (
  select distinct on (notification.id)
    notification.id as notification_id,
    comment.author_id as actor_id,
    comment.post_id,
    comment.id as comment_id,
    comment.content
  from public.notifications as notification
  join public.posts as post
    on post.author_id = notification.recipient_id
  join public.comments as comment
    on comment.post_id = post.id
   and comment.author_id <> notification.recipient_id
   and abs(extract(epoch from (
     notification.created_at - comment.created_at
   ))) < 1
  where notification.type = 'COMMENT'
    and notification.actor_id is null
  order by
    notification.id,
    abs(extract(epoch from (
      notification.created_at - comment.created_at
    )))
)
update public.notifications as notification
set
  actor_id = matches.actor_id,
  post_id = matches.post_id,
  comment_id = matches.comment_id,
  title = 'Novo comentário',
  body = left(matches.content, 180),
  href = '/publicacao/' || matches.post_id::text ||
    '#comentario-' || matches.comment_id::text
from matches
where notification.id = matches.notification_id;

create trigger guard_notification_update
before update on public.notifications
for each row execute function public.guard_notification_update();

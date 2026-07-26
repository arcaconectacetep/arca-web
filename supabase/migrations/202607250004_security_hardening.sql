-- Invariantes que não podem depender da interface ou das Server Actions.
create function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.username is not null then
    new.username := lower(trim(new.username));
  end if;

  if new.onboarding_completed and (
    new.username is null or new.full_name is null or trim(new.full_name) = '' or
    new.course_id is null or new.terms_accepted_at is null
  ) then
    raise exception 'Perfil incompleto para concluir onboarding';
  end if;

  if old.role = 'ADMIN' and (
    new.role <> 'ADMIN' or new.suspended_at is not null
  ) and (
    select count(*) from public.profiles
    where role = 'ADMIN' and suspended_at is null and id <> old.id
  ) = 0 then
    raise exception 'O sistema precisa manter ao menos um administrador ativo';
  end if;
  return new;
end;
$$;

create trigger guard_profile_update
before update on public.profiles
for each row execute function public.guard_profile_update();

create function public.guard_post_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare actor_role public.account_role;
begin
  if auth.uid() is null then return new; end if;
  actor_role := public.current_user_role();
  if actor_role is null then raise exception 'Conta suspensa'; end if;

  if tg_op = 'INSERT' then
    new.author_id := auth.uid();
  else
    new.author_id := old.author_id;
    if auth.uid() = old.author_id and actor_role not in ('STAFF', 'ADMIN') then
      new.hidden_at := old.hidden_at;
      new.hidden_by := old.hidden_by;
    end if;
  end if;

  if actor_role = 'STUDENT' and (
    new.official or new.pinned or new.type = 'ANNOUNCEMENT'
  ) then
    raise exception 'Papel sem permissão para comunicado ou destaque';
  end if;
  return new;
end;
$$;

create trigger guard_post_write
before insert or update on public.posts
for each row execute function public.guard_post_write();

create function public.guard_comment_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then return new; end if;
  if tg_op = 'INSERT' then
    new.author_id := auth.uid();
    new.hidden_at := null;
  else
    new.author_id := old.author_id;
    new.post_id := old.post_id;
    if not public.is_staff() then new.hidden_at := old.hidden_at; end if;
  end if;
  return new;
end;
$$;

create trigger guard_comment_write
before insert or update on public.comments
for each row execute function public.guard_comment_write();

create function public.guard_support_alert_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then return new; end if;
  if tg_op = 'INSERT' then
    new.author_id := auth.uid();
    new.status := 'RECEIVED';
    new.assigned_to := null;
    new.resolved_at := null;
  else
    new.author_id := old.author_id;
    new.protocol := old.protocol;
    new.created_at := old.created_at;
    new.category := old.category;
    new.urgency := old.urgency;
    new.description := old.description;
    new.location := old.location;
    new.happened_at := old.happened_at;
    new.allow_contact := old.allow_contact;
  end if;
  return new;
end;
$$;

-- O prefixo no nome garante execução antes do rate limit, impedindo spoof de author_id.
create trigger a_guard_support_alert_write
before insert or update on public.support_alerts
for each row execute function public.guard_support_alert_write();

create function public.guard_notification_update()
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
  new.created_at := old.created_at;
  return new;
end;
$$;

create trigger guard_notification_update
before update on public.notifications
for each row execute function public.guard_notification_update();

create function public.on_support_status_changed()
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
    insert into public.notifications(recipient_id, type, title, body, href)
    values (
      new.author_id, 'SUPPORT_UPDATE', 'Solicitação atualizada',
      'O status de uma solicitação de suporte foi atualizado.',
      '/suporte/' || new.id::text
    );
  end if;
  return new;
end;
$$;

create trigger on_support_status_changed
after update of status on public.support_alerts
for each row execute function public.on_support_status_changed();

drop policy events_read on public.support_alert_events;
create policy events_read on public.support_alert_events
for select to authenticated
using (
  public.is_staff() or (
    coalesce(metadata ->> 'internal', 'false') = 'false' and
    exists (
      select 1 from public.support_alerts a
      where a.id = alert_id and a.author_id = auth.uid()
    )
  )
);

create function public.on_comment_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare post_owner uuid;
begin
  select author_id into post_owner from public.posts where id = new.post_id;
  if post_owner is not null and post_owner <> new.author_id then
    insert into public.notifications(recipient_id, type, title, body, href)
    values (
      post_owner, 'COMMENT', 'Novo comentário',
      'Sua publicação recebeu um comentário.', '/inicio'
    );
  end if;
  return new;
end;
$$;

create trigger on_comment_created
after insert on public.comments
for each row execute function public.on_comment_created();

alter table public.post_images
  add constraint post_images_imgchest_url
  check (image_url ~ '^https://cdn[.]imgchest[.]com/files/'),
  add constraint post_images_imgchest_thumbnail
  check (thumbnail_url is null or thumbnail_url ~ '^https://cdn[.]imgchest[.]com/files/');

alter table public.profiles
  add constraint profiles_imgchest_avatar
  check (avatar_url is null or avatar_url ~ '^https://cdn[.]imgchest[.]com/files/');

drop policy posts_insert on public.posts;
create policy posts_insert on public.posts
for insert to authenticated
with check (
  author_id = auth.uid() and public.current_user_role() is not null and
  (type <> 'ANNOUNCEMENT' or public.current_user_role() in ('TEACHER','STAFF','ADMIN')) and
  (not official or public.current_user_role() in ('TEACHER','STAFF','ADMIN')) and
  (not pinned or public.current_user_role() in ('TEACHER','STAFF','ADMIN'))
);

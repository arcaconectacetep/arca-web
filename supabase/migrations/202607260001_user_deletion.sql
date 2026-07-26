-- Permite que a exclusão administrativa no Supabase Auth remova o perfil sem
-- deixar referências órfãs. Conteúdo privado e autoral é removido em cascata;
-- referências de moderação e auditoria são preservadas de forma anônima.
alter table public.posts drop constraint posts_author_id_fkey,
  add constraint posts_author_id_fkey foreign key (author_id) references public.profiles(id) on delete cascade;
alter table public.posts drop constraint posts_hidden_by_fkey,
  add constraint posts_hidden_by_fkey foreign key (hidden_by) references public.profiles(id) on delete set null;
alter table public.comments drop constraint comments_author_id_fkey,
  add constraint comments_author_id_fkey foreign key (author_id) references public.profiles(id) on delete cascade;
alter table public.post_reports drop constraint post_reports_reporter_id_fkey,
  add constraint post_reports_reporter_id_fkey foreign key (reporter_id) references public.profiles(id) on delete cascade;
alter table public.post_reports drop constraint post_reports_reviewed_by_fkey,
  add constraint post_reports_reviewed_by_fkey foreign key (reviewed_by) references public.profiles(id) on delete set null;
alter table public.support_alerts drop constraint support_alerts_author_id_fkey,
  add constraint support_alerts_author_id_fkey foreign key (author_id) references public.profiles(id) on delete cascade;
alter table public.support_alerts drop constraint support_alerts_assigned_to_fkey,
  add constraint support_alerts_assigned_to_fkey foreign key (assigned_to) references public.profiles(id) on delete set null;
alter table public.support_alert_notes drop constraint support_alert_notes_author_id_fkey,
  add constraint support_alert_notes_author_id_fkey foreign key (author_id) references public.profiles(id) on delete cascade;
alter table public.support_alert_events drop constraint support_alert_events_actor_id_fkey,
  add constraint support_alert_events_actor_id_fkey foreign key (actor_id) references public.profiles(id) on delete set null;
alter table public.audit_logs drop constraint audit_logs_actor_id_fkey,
  add constraint audit_logs_actor_id_fkey foreign key (actor_id) references public.profiles(id) on delete set null;

create function public.guard_last_admin_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'ADMIN' and old.suspended_at is null and (
    select count(*) from public.profiles
    where role = 'ADMIN' and suspended_at is null and id <> old.id
  ) = 0 then
    raise exception 'O sistema precisa manter ao menos um administrador ativo';
  end if;
  return old;
end;
$$;

create trigger guard_last_admin_delete
before delete on public.profiles
for each row execute function public.guard_last_admin_delete();

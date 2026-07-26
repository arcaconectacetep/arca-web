-- A exclusao explicita de uma conta deve prevalecer mesmo quando ela e o
-- ultimo ADMIN. As protecoes contra rebaixamento e suspensao continuam ativas.
drop trigger if exists guard_last_admin_delete on public.profiles;
drop function if exists public.guard_last_admin_delete();

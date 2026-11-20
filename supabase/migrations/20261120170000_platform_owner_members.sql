-- Review and apply ONLY after local integration testing.
-- Ownership is bootstrapped exclusively from the single active admin.
-- Intentionally no member is invited or role changed during this migration.

create table if not exists private.platform_owner (
  slot smallint primary key default 1 check (slot = 1),
  user_id uuid not null unique references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

do $$
declare admin_id uuid;
begin
  if (select count(*) from public.user_roles where role='admin' and is_active) <> 1 then
    raise exception 'Owner bootstrap requires exactly one active admin; inspect roles before migration';
  end if;
  select user_id into admin_id from public.user_roles where role='admin' and is_active limit 1;
  insert into private.platform_owner(slot,user_id) values (1,admin_id)
  on conflict(slot) do update set user_id=excluded.user_id
    where private.platform_owner.user_id=excluded.user_id;
  if not exists(select 1 from private.platform_owner where slot=1 and user_id=admin_id) then
    raise exception 'Existing platform owner differs from sole active admin: manual security review required';
  end if;
end $$;

revoke all on private.platform_owner from public, anon, authenticated;

create or replace function public.is_platform_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from private.platform_owner p
    join public.user_roles r on r.user_id=p.user_id
    where p.slot=1 and p.user_id=(select auth.uid())
      and r.role='admin' and r.is_active
  );
$$;
revoke execute on function public.is_platform_owner() from public, anon;
grant execute on function public.is_platform_owner() to authenticated, service_role;

-- Existing policy grants every admin the ability to change the role table.
-- Replace the write privileges with an owner-only predicate.
drop policy if exists user_roles_admin_insert on public.user_roles;
drop policy if exists user_roles_admin_update on public.user_roles;
drop policy if exists user_roles_admin_delete on public.user_roles;
drop policy if exists user_roles_owner_insert on public.user_roles;
drop policy if exists user_roles_owner_update on public.user_roles;
drop policy if exists user_roles_owner_delete on public.user_roles;

create policy user_roles_owner_insert on public.user_roles for insert
  to authenticated with check ((select public.is_platform_owner()));
create policy user_roles_owner_update on public.user_roles for update
  to authenticated using ((select public.is_platform_owner()))
  with check ((select public.is_platform_owner()));
create policy user_roles_owner_delete on public.user_roles for delete
  to authenticated using ((select public.is_platform_owner()));

-- Block accidental or hostile removal of the sole general manager.
create or replace function private.protect_platform_owner_role()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if exists (select 1 from private.platform_owner where user_id=old.user_id) then
    if tg_op='DELETE' then
      raise exception 'Platform general manager cannot be deleted from user roles';
    end if;
    if new.role <> 'admin' or new.is_active is not true or new.user_id <> old.user_id then
      raise exception 'Platform general manager role cannot be deactivated or changed';
    end if;
  end if;
  return case when tg_op='DELETE' then old else new end;
end $$;
drop trigger if exists protect_platform_owner_role on public.user_roles;
create trigger protect_platform_owner_role before update or delete on public.user_roles
  for each row execute function private.protect_platform_owner_role();

-- Owners change only via a reviewed SQL migration, never from the member UI.

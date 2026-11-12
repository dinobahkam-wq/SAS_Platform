create or replace function private.has_any_role(required_roles text[])
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid()) and ur.is_active = true and ur.role = any(required_roles)
  );
$$;

create or replace function private.can_manage_content(p_content_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.content_items ci
    where ci.id = p_content_id and (
      private.has_any_role(array['admin'])
      or (ci.status = 'draft' and private.has_any_role(array['editor']))
      or (ci.status = 'draft' and ci.created_by = (select auth.uid()) and private.has_any_role(array['author']))
    )
  );
$$;

revoke all on function private.has_any_role(text[]) from public, anon, authenticated;
revoke all on function private.can_manage_content(uuid) from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.has_any_role(text[]) to authenticated;
grant execute on function private.can_manage_content(uuid) to authenticated;

alter table public.media_assets enable row level security;
alter table public.authors enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.content_sources enable row level security;
alter table public.user_roles enable row level security;
alter table public.content_items enable row level security;
alter table public.content_authors enable row level security;
alter table public.content_tags enable row level security;
alter table public.content_source_links enable row level security;

grant select on public.content_items, public.authors, public.categories, public.tags,
  public.media_assets, public.content_sources, public.content_authors,
  public.content_tags, public.content_source_links to anon, authenticated;
grant select, insert, update, delete on public.content_items, public.authors,
  public.categories, public.tags, public.media_assets, public.content_sources,
  public.content_authors, public.content_tags, public.content_source_links,
  public.user_roles to authenticated;

create policy content_items_public_read on public.content_items for select to anon, authenticated
using (status = 'published');
create policy content_items_staff_read on public.content_items for select to authenticated
using (private.has_any_role(array['admin','editor']) or
  (private.has_any_role(array['author']) and created_by = (select auth.uid())));
create policy content_items_staff_insert on public.content_items for insert to authenticated
with check (created_by = (select auth.uid()) and private.has_any_role(array['admin','editor','author']));
create policy content_items_staff_update on public.content_items for update to authenticated
using (private.can_manage_content(id))
with check (
  private.has_any_role(array['admin'])
  or (private.has_any_role(array['editor']) and status in ('draft','published','archived'))
  or (private.has_any_role(array['author']) and created_by = (select auth.uid()) and status = 'draft')
);
create policy content_items_staff_delete on public.content_items for delete to authenticated
using (private.has_any_role(array['admin'])
  or (status = 'draft' and private.has_any_role(array['editor']))
  or (status = 'draft' and created_by = (select auth.uid()) and private.has_any_role(array['author'])));

create policy authors_public_read on public.authors for select to anon, authenticated using (is_active = true);
create policy authors_staff_read on public.authors for select to authenticated using (private.has_any_role(array['admin','editor','author']));
create policy authors_staff_insert on public.authors for insert to authenticated with check (private.has_any_role(array['admin','editor']));
create policy authors_staff_update on public.authors for update to authenticated using (private.has_any_role(array['admin','editor'])) with check (private.has_any_role(array['admin','editor']));
create policy authors_staff_delete on public.authors for delete to authenticated using (private.has_any_role(array['admin','editor']));

create policy categories_public_read on public.categories for select to anon, authenticated using (is_active = true);
create policy categories_staff_read on public.categories for select to authenticated using (private.has_any_role(array['admin','editor','author']));
create policy categories_staff_insert on public.categories for insert to authenticated with check (private.has_any_role(array['admin','editor']));
create policy categories_staff_update on public.categories for update to authenticated using (private.has_any_role(array['admin','editor'])) with check (private.has_any_role(array['admin','editor']));
create policy categories_staff_delete on public.categories for delete to authenticated using (private.has_any_role(array['admin','editor']));

create policy tags_public_read on public.tags for select to anon, authenticated using (is_active = true);
create policy tags_staff_read on public.tags for select to authenticated using (private.has_any_role(array['admin','editor','author']));
create policy tags_staff_insert on public.tags for insert to authenticated with check (private.has_any_role(array['admin','editor']));
create policy tags_staff_update on public.tags for update to authenticated using (private.has_any_role(array['admin','editor'])) with check (private.has_any_role(array['admin','editor']));
create policy tags_staff_delete on public.tags for delete to authenticated using (private.has_any_role(array['admin','editor']));

create policy content_sources_public_read on public.content_sources for select to anon, authenticated
using (exists (
  select 1 from public.content_source_links csl
  join public.content_items ci on ci.id = csl.content_id
  where csl.source_id = content_sources.id and ci.status = 'published'
));
create policy content_sources_staff_read on public.content_sources for select to authenticated
using (private.has_any_role(array['admin','editor','author']));
create policy content_sources_staff_insert on public.content_sources for insert to authenticated
with check (private.has_any_role(array['admin','editor']));
create policy content_sources_staff_update on public.content_sources for update to authenticated
using (private.has_any_role(array['admin']) or (
  private.has_any_role(array['editor']) and not exists (
    select 1 from public.content_source_links csl
    join public.content_items ci on ci.id = csl.content_id
    where csl.source_id = content_sources.id and ci.status = 'published'
  )
))
with check (private.has_any_role(array['admin','editor']));
create policy content_sources_staff_delete on public.content_sources for delete to authenticated
using (private.has_any_role(array['admin']) or (
  private.has_any_role(array['editor']) and not exists (
    select 1 from public.content_source_links csl
    join public.content_items ci on ci.id = csl.content_id
    where csl.source_id = content_sources.id and ci.status = 'published'
  )
));

create policy user_roles_self_or_admin_read on public.user_roles for select to authenticated
using (user_id = (select auth.uid()) or private.has_any_role(array['admin']));
create policy user_roles_admin_insert on public.user_roles for insert to authenticated with check (private.has_any_role(array['admin']));
create policy user_roles_admin_update on public.user_roles for update to authenticated using (private.has_any_role(array['admin'])) with check (private.has_any_role(array['admin']));
create policy user_roles_admin_delete on public.user_roles for delete to authenticated using (private.has_any_role(array['admin']));

create policy media_assets_public_read on public.media_assets for select to anon, authenticated
using (
  exists (select 1 from public.content_items ci where ci.cover_asset_id = media_assets.id and ci.status = 'published')
  or exists (select 1 from public.authors a where a.avatar_asset_id = media_assets.id and a.is_active = true)
);
create policy media_assets_staff_read on public.media_assets for select to authenticated using (private.has_any_role(array['admin','editor','author']));
create policy media_assets_staff_insert on public.media_assets for insert to authenticated
with check (uploaded_by = (select auth.uid()) and private.has_any_role(array['admin','editor','author']));
create policy media_assets_staff_update on public.media_assets for update to authenticated
using (private.has_any_role(array['admin']) or (
  private.has_any_role(array['editor','author'])
  and (private.has_any_role(array['editor']) or uploaded_by = (select auth.uid()))
  and not exists (select 1 from public.content_items ci where ci.cover_asset_id = media_assets.id and ci.status = 'published')
))
with check (private.has_any_role(array['admin']) or (
  private.has_any_role(array['editor','author'])
  and (private.has_any_role(array['editor']) or uploaded_by = (select auth.uid()))
  and not exists (select 1 from public.content_items ci where ci.cover_asset_id = media_assets.id and ci.status = 'published')
));
create policy media_assets_staff_delete on public.media_assets for delete to authenticated
using (private.has_any_role(array['admin']) or (
  private.has_any_role(array['editor','author'])
  and (private.has_any_role(array['editor']) or uploaded_by = (select auth.uid()))
  and not exists (select 1 from public.content_items ci where ci.cover_asset_id = media_assets.id and ci.status = 'published')
));

create policy content_authors_public_read on public.content_authors for select to anon, authenticated
using (exists (select 1 from public.content_items ci where ci.id = content_authors.content_id and ci.status = 'published'));
create policy content_authors_staff_read on public.content_authors for select to authenticated using (private.can_manage_content(content_id));
create policy content_authors_staff_insert on public.content_authors for insert to authenticated with check (private.can_manage_content(content_id));
create policy content_authors_staff_update on public.content_authors for update to authenticated using (private.can_manage_content(content_id)) with check (private.can_manage_content(content_id));
create policy content_authors_staff_delete on public.content_authors for delete to authenticated using (private.can_manage_content(content_id));

create policy content_tags_public_read on public.content_tags for select to anon, authenticated
using (exists (select 1 from public.content_items ci where ci.id = content_tags.content_id and ci.status = 'published'));
create policy content_tags_staff_read on public.content_tags for select to authenticated using (private.can_manage_content(content_id));
create policy content_tags_staff_insert on public.content_tags for insert to authenticated with check (private.can_manage_content(content_id));
create policy content_tags_staff_update on public.content_tags for update to authenticated using (private.can_manage_content(content_id)) with check (private.can_manage_content(content_id));
create policy content_tags_staff_delete on public.content_tags for delete to authenticated using (private.can_manage_content(content_id));

create policy content_source_links_public_read on public.content_source_links for select to anon, authenticated
using (exists (select 1 from public.content_items ci where ci.id = content_source_links.content_id and ci.status = 'published'));
create policy content_source_links_staff_read on public.content_source_links for select to authenticated using (private.can_manage_content(content_id));
create policy content_source_links_staff_insert on public.content_source_links for insert to authenticated with check (private.can_manage_content(content_id));
create policy content_source_links_staff_update on public.content_source_links for update to authenticated using (private.can_manage_content(content_id)) with check (private.can_manage_content(content_id));
create policy content_source_links_staff_delete on public.content_source_links for delete to authenticated using (private.can_manage_content(content_id));

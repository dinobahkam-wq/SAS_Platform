drop policy content_items_public_read on public.content_items;
create policy content_items_public_read on public.content_items for select to anon using (status='published');

drop policy authors_public_read on public.authors;
create policy authors_public_read on public.authors for select to anon using (is_active=true);
drop policy authors_staff_read on public.authors;
create policy authors_staff_read on public.authors for select to authenticated
using (is_active=true or private.has_any_role(array['admin','editor','author']));

drop policy categories_public_read on public.categories;
create policy categories_public_read on public.categories for select to anon using (is_active=true);
drop policy categories_staff_read on public.categories;
create policy categories_staff_read on public.categories for select to authenticated
using (is_active=true or private.has_any_role(array['admin','editor','author']));

drop policy tags_public_read on public.tags;
create policy tags_public_read on public.tags for select to anon using (is_active=true);
drop policy tags_staff_read on public.tags;
create policy tags_staff_read on public.tags for select to authenticated
using (is_active=true or private.has_any_role(array['admin','editor','author']));

drop policy content_sources_public_read on public.content_sources;
create policy content_sources_public_read on public.content_sources for select to anon
using (exists (select 1 from public.content_source_links csl
  join public.content_items ci on ci.id=csl.content_id
  where csl.source_id=content_sources.id and ci.status='published'));
drop policy content_sources_staff_read on public.content_sources;
create policy content_sources_staff_read on public.content_sources for select to authenticated
using (private.has_any_role(array['admin','editor','author']) or exists (
  select 1 from public.content_source_links csl
  join public.content_items ci on ci.id=csl.content_id
  where csl.source_id=content_sources.id and ci.status='published'
));

drop policy content_items_staff_read on public.content_items;
create policy content_items_staff_read on public.content_items for select to authenticated
using (status='published' or private.has_any_role(array['admin','editor'])
  or (private.has_any_role(array['author']) and created_by=(select auth.uid())));

drop policy media_assets_public_read on public.media_assets;
create policy media_assets_public_read on public.media_assets for select to anon
using (
  exists (select 1 from public.content_items ci where ci.cover_asset_id=media_assets.id and ci.status='published')
  or exists (select 1 from public.authors a where a.avatar_asset_id=media_assets.id and a.is_active=true)
);
drop policy media_assets_staff_read on public.media_assets;
create policy media_assets_staff_read on public.media_assets for select to authenticated
using (private.has_any_role(array['admin','editor','author'])
  or exists (select 1 from public.content_items ci where ci.cover_asset_id=media_assets.id and ci.status='published')
  or exists (select 1 from public.authors a where a.avatar_asset_id=media_assets.id and a.is_active=true));

drop policy content_authors_public_read on public.content_authors;
create policy content_authors_public_read on public.content_authors for select to anon
using (exists (select 1 from public.content_items ci where ci.id=content_authors.content_id and ci.status='published'));
drop policy content_authors_staff_read on public.content_authors;
create policy content_authors_staff_read on public.content_authors for select to authenticated
using (private.can_manage_content(content_id) or exists (
  select 1 from public.content_items ci where ci.id=content_authors.content_id and ci.status='published'
));

drop policy content_tags_public_read on public.content_tags;
create policy content_tags_public_read on public.content_tags for select to anon
using (exists (select 1 from public.content_items ci where ci.id=content_tags.content_id and ci.status='published'));
drop policy content_tags_staff_read on public.content_tags;
create policy content_tags_staff_read on public.content_tags for select to authenticated
using (private.can_manage_content(content_id) or exists (
  select 1 from public.content_items ci where ci.id=content_tags.content_id and ci.status='published'
));

drop policy content_source_links_public_read on public.content_source_links;
create policy content_source_links_public_read on public.content_source_links for select to anon
using (exists (select 1 from public.content_items ci where ci.id=content_source_links.content_id and ci.status='published'));
drop policy content_source_links_staff_read on public.content_source_links;
create policy content_source_links_staff_read on public.content_source_links for select to authenticated
using (private.can_manage_content(content_id) or exists (
  select 1 from public.content_items ci where ci.id=content_source_links.content_id and ci.status='published'
));

create index authors_avatar_asset_idx on public.authors (avatar_asset_id);
create index content_items_created_by_idx on public.content_items (created_by);
create index content_items_updated_by_idx on public.content_items (updated_by);
create index content_sources_created_by_idx on public.content_sources (created_by);
create index user_roles_assigned_by_idx on public.user_roles (assigned_by);
drop index if exists public.authors_auth_user_idx;

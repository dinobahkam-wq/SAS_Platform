create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null default 'sas-public-media',
  object_path text not null,
  file_name text not null,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp','image/avif')),
  file_size bigint not null check (file_size > 0 and file_size <= 10485760),
  width integer,
  height integer,
  alt_text text,
  caption text,
  credit text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint media_assets_dimensions_check check (
    (width is null or width > 0) and (height is null or height > 0)
    and (width is null or width <= 2560) and (height is null or height <= 2560)
  ),
  constraint media_assets_object_unique unique (bucket_id, object_path)
);

create table public.authors (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (length(btrim(display_name)) > 0),
  slug text not null unique check (length(btrim(slug)) > 0),
  bio text,
  avatar_asset_id uuid references public.media_assets(id) on delete restrict,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) > 0),
  slug text not null unique check (length(btrim(slug)) > 0),
  description text,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) > 0),
  slug text not null unique check (length(btrim(slug)) > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_sources (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in (
    'official_statement','official_document','news_agency','media_organization',
    'sas_correspondent','field_observation','interview','other'
  )),
  source_name text not null check (length(btrim(source_name)) > 0),
  organization_name text,
  source_url text,
  source_reference text,
  publication_date date,
  attribution_note text,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_sources_url_check check (source_url is null or source_url ~* '^https?://')
);

create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','editor','author')),
  is_active boolean not null default true,
  assigned_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('news','analysis','research','media')),
  format text not null,
  title text not null check (length(btrim(title)) > 0),
  slug text not null unique check (length(btrim(slug)) > 0),
  excerpt text,
  body jsonb,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  cover_asset_id uuid references public.media_assets(id) on delete restrict,
  category_id uuid references public.categories(id) on delete restrict,
  is_featured boolean not null default false,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_items_section_format_check check (
    (section = 'news' and format in ('news_brief','news_report','official_statement')) or
    (section = 'analysis' and format in ('analysis','opinion','interview')) or
    (section = 'research' and format in ('research_paper','policy_brief','study_report')) or
    (section = 'media' and format in ('video','podcast','interview','infographic','photo_gallery'))
  ),
  constraint content_items_body_object_check check (body is null or jsonb_typeof(body) = 'object'),
  constraint content_items_published_body_check check (status <> 'published' or (body is not null and body <> '{}'::jsonb)),
  constraint content_items_published_at_check check (status <> 'published' or published_at is not null)
);

create table public.content_authors (
  content_id uuid not null references public.content_items(id) on delete cascade,
  author_id uuid not null references public.authors(id) on delete restrict,
  author_order integer not null default 0 check (author_order >= 0),
  contribution_label text,
  created_at timestamptz not null default now(),
  primary key (content_id, author_id)
);

create table public.content_tags (
  content_id uuid not null references public.content_items(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (content_id, tag_id)
);

create table public.content_source_links (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content_items(id) on delete cascade,
  source_id uuid not null references public.content_sources(id) on delete restrict,
  source_role text not null default 'reference' check (source_role in ('primary','supporting','reference','field_reporting')),
  attribution_text text,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  unique (content_id, source_id)
);

create index content_items_public_feed_idx on public.content_items (status, published_at desc);
create index content_items_section_feed_idx on public.content_items (section, status, published_at desc);
create index content_items_category_idx on public.content_items (category_id);
create index content_items_cover_asset_idx on public.content_items (cover_asset_id);
create index content_authors_author_idx on public.content_authors (author_id, content_id);
create index content_tags_tag_idx on public.content_tags (tag_id, content_id);
create index content_source_links_source_idx on public.content_source_links (source_id, content_id);
create index content_sources_type_idx on public.content_sources (source_type);
create index media_assets_uploaded_by_idx on public.media_assets (uploaded_by);
create index authors_auth_user_idx on public.authors (auth_user_id);

create or replace function private.set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$ begin new.updated_at := now(); return new; end; $$;

create trigger authors_set_updated_at before update on public.authors
for each row execute function private.set_updated_at();
create trigger categories_set_updated_at before update on public.categories
for each row execute function private.set_updated_at();
create trigger tags_set_updated_at before update on public.tags
for each row execute function private.set_updated_at();
create trigger content_sources_set_updated_at before update on public.content_sources
for each row execute function private.set_updated_at();
create trigger user_roles_set_updated_at before update on public.user_roles
for each row execute function private.set_updated_at();
create trigger content_items_set_updated_at before update on public.content_items
for each row execute function private.set_updated_at();

create or replace function private.prepare_content_item()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    new.published_at := coalesce(new.published_at, now());
  end if;
  return new;
end;
$$;

create trigger content_items_prepare before insert or update on public.content_items
for each row execute function private.prepare_content_item();

create or replace function private.enforce_news_source_on_publish()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.status = 'published' and new.section = 'news'
     and not exists (select 1 from public.content_source_links csl where csl.content_id = new.id) then
    raise exception 'A news item must have at least one linked source before publication.'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger content_items_require_news_source
before insert or update of status, section on public.content_items
for each row execute function private.enforce_news_source_on_publish();

create or replace function private.protect_last_news_source()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare v_section text; v_status text;
begin
  select ci.section, ci.status into v_section, v_status
  from public.content_items ci where ci.id = old.content_id;
  if v_section = 'news' and v_status = 'published'
     and not exists (
       select 1 from public.content_source_links csl
       where csl.content_id = old.content_id and csl.id <> old.id
     ) then
    raise exception 'The last source linked to a published news item cannot be removed.'
      using errcode = '23514';
  end if;
  return old;
end;
$$;

create trigger content_source_links_protect_last_news_source
before delete or update of content_id on public.content_source_links
for each row execute function private.protect_last_news_source();

revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.prepare_content_item() from public, anon, authenticated;
revoke all on function private.enforce_news_source_on_publish() from public, anon, authenticated;
revoke all on function private.protect_last_news_source() from public, anon, authenticated;

-- SAS Daily Briefing V1 — Package 1 draft migration
-- Draft for review only. Do not apply to the hosted Supabase project.
-- Generate the final migration filename locally with:
--   supabase migration new daily_briefing_package1
-- Then copy this reviewed draft into the generated file.
-- Preconditions: public.content_sources/content_items/user_roles and
-- private.has_any_role(text[]) already exist.

-- 1. Extend the shared source registry; preserve publication_date semantics.
alter table public.content_sources
  add column if not exists source_title text,
  add column if not exists published_at timestamptz,
  add column if not exists language_code text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.content_sources'::regclass
      and conname = 'content_sources_language_code_check'
  ) then
    alter table public.content_sources
      add constraint content_sources_language_code_check
      check (
        language_code is null
        or language_code ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$'
      );
  end if;
end;
$$;

-- Existing editorial-core table grants are intentionally unchanged by this feature migration.

-- 2. Stable edition identity and immutable editorial revisions.
create table public.briefing_editions (
  id uuid primary key default gen_random_uuid(),
  edition_no bigint generated always as identity unique,
  slug text not null unique check (slug = lower(slug) and length(btrim(slug)) > 0),
  edition_date date not null,
  edition_type text not null default 'daily'
    check (edition_type in ('daily','special')),
  status text not null default 'active'
    check (status in ('active','archived','withdrawn')),
  current_revision_id uuid,
  created_by uuid not null default auth.uid()
    references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index briefing_editions_one_daily_per_date_idx
  on public.briefing_editions(edition_date)
  where edition_type = 'daily' and status <> 'withdrawn';

create table public.briefing_revisions (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references public.briefing_editions(id) on delete restrict,
  revision_no integer not null check (revision_no > 0),
  revision_kind text not null default 'initial'
    check (revision_kind in ('initial','correction')),
  based_on_revision_id uuid,
  status text not null default 'draft'
    check (status in ('draft','in_review','approved','published')),
  title_ar text not null check (length(btrim(title_ar)) > 0),
  analysis_ar text not null check (length(btrim(analysis_ar)) > 0),
  methodology_ar text not null check (length(btrim(methodology_ar)) > 0),
  coverage_note_ar text not null check (length(btrim(coverage_note_ar)) > 0),
  window_start timestamptz not null,
  window_end timestamptz not null,
  checked_at timestamptz not null default now(),
  review_note_ar text,
  change_reason_ar text,
  published_snapshot jsonb,
  created_by uuid not null default auth.uid()
    references auth.users(id) on delete restrict,
  submitted_by uuid references auth.users(id) on delete restrict,
  reviewed_by uuid references auth.users(id) on delete restrict,
  approved_by uuid references auth.users(id) on delete restrict,
  published_by uuid references auth.users(id) on delete restrict,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (edition_id, revision_no),
  unique (edition_id, id),
  foreign key (edition_id, based_on_revision_id)
    references public.briefing_revisions(edition_id, id) on delete restrict,
  check (window_start < window_end),
  check (
    (revision_kind = 'initial' and based_on_revision_id is null)
    or
    (revision_kind = 'correction'
      and based_on_revision_id is not null
      and nullif(btrim(change_reason_ar),'') is not null)
  ),
  check (
    (status = 'published' and published_snapshot is not null
      and published_at is not null and published_by is not null)
    or
    (status <> 'published' and published_snapshot is null
      and published_at is null and published_by is null)
  )
);

create unique index briefing_revisions_one_initial_per_edition_idx
  on public.briefing_revisions(edition_id)
  where revision_kind = 'initial';

alter table public.briefing_editions
  add constraint briefing_editions_current_revision_fkey
  foreign key (id, current_revision_id)
  references public.briefing_revisions(edition_id, id) on delete restrict;

-- 3. Reusable developments and evidence.
create table public.briefing_developments (
  id uuid primary key default gen_random_uuid(),
  headline_ar text not null check (length(btrim(headline_ar)) > 0),
  summary_ar text not null check (length(btrim(summary_ar)) > 0),
  category text not null check (category in (
    'politics','security','economy','humanitarian',
    'diplomacy','regional','international','other'
  )),
  information_class text not null
    check (information_class in ('fact','position','claim','analysis')),
  verification_status text not null default 'unverified'
    check (verification_status in (
      'verified','attributed','disputed','unverified','not_applicable'
    )),
  verification_note_ar text,
  occurred_at timestamptz,
  occurred_on date,
  time_precision text not null default 'unknown'
    check (time_precision in ('exact','approximate','date_only','unknown')),
  location_text text,
  geographic_scope text not null default 'national'
    check (geographic_scope in ('local','national','regional','international')),
  related_content_item_id uuid
    references public.content_items(id) on delete set null,
  status text not null default 'draft'
    check (status in ('draft','ready','archived')),
  created_by uuid not null default auth.uid()
    references auth.users(id) on delete restrict,
  updated_by uuid references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (time_precision = 'exact' and occurred_at is not null)
    or (time_precision = 'date_only' and occurred_on is not null)
    or (time_precision = 'approximate'
      and (occurred_at is not null or occurred_on is not null))
    or (time_precision = 'unknown'
      and occurred_at is null and occurred_on is null)
  )
);

create table public.briefing_development_sources (
  development_id uuid not null
    references public.briefing_developments(id) on delete cascade,
  source_id uuid not null
    references public.content_sources(id) on delete restrict,
  source_role text not null default 'supporting'
    check (source_role in ('primary','supporting','context')),
  -- Evidence may remain internal; public display requires an explicit editorial choice.
  display_publicly boolean not null default false,
  source_excerpt text,
  attribution_note text,
  accessed_at timestamptz not null default now(),
  display_order integer not null default 0 check (display_order >= 0),
  created_by uuid not null default auth.uid()
    references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (development_id, source_id)
);

create table public.briefing_edition_items (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null
    references public.briefing_revisions(id) on delete restrict,
  development_id uuid not null
    references public.briefing_developments(id) on delete restrict,
  display_section text not null
    check (display_section in ('executive_summary','developments')),
  display_order integer not null check (display_order >= 0),
  summary_text_ar text,
  headline_override_ar text,
  what_changed_ar text,
  why_it_matters_ar text,
  context_ar text,
  created_at timestamptz not null default now(),
  unique (revision_id, development_id, display_section),
  unique (revision_id, display_section, display_order),
  check (
    display_section <> 'executive_summary'
    or nullif(btrim(summary_text_ar),'') is not null
  )
);

create table public.briefing_development_relations (
  id uuid primary key default gen_random_uuid(),
  source_development_id uuid not null
    references public.briefing_developments(id) on delete cascade,
  target_development_id uuid not null
    references public.briefing_developments(id) on delete cascade,
  relation_type text not null
    check (relation_type in ('updates','supersedes','contradicts','related_to')),
  note_ar text,
  created_by uuid not null default auth.uid()
    references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  check (source_development_id <> target_development_id),
  unique (source_development_id,target_development_id,relation_type)
);

create table public.briefing_edition_events (
  id bigint generated always as identity primary key,
  edition_id uuid not null
    references public.briefing_editions(id) on delete restrict,
  revision_id uuid
    references public.briefing_revisions(id) on delete restrict,
  event_type text not null,
  from_status text,
  to_status text,
  actor_id uuid references auth.users(id) on delete set null,
  note_ar text,
  event_data jsonb not null default '{}'::jsonb
    check (jsonb_typeof(event_data) = 'object'),
  created_at timestamptz not null default now()
);

-- 4. Index foreign keys, workflow lookups, and archive pagination.
create index briefing_revisions_edition_status_idx
  on public.briefing_revisions(edition_id,status,revision_no desc);
create index briefing_revisions_based_on_idx
  on public.briefing_revisions(based_on_revision_id)
  where based_on_revision_id is not null;
create index briefing_developments_status_created_idx
  on public.briefing_developments(status,created_at desc);
create index briefing_developments_related_content_idx
  on public.briefing_developments(related_content_item_id)
  where related_content_item_id is not null;
create index briefing_development_sources_source_idx
  on public.briefing_development_sources(source_id);
create index briefing_edition_items_revision_section_order_idx
  on public.briefing_edition_items(revision_id,display_section,display_order);
create index briefing_edition_items_development_idx
  on public.briefing_edition_items(development_id);
create index briefing_development_relations_target_idx
  on public.briefing_development_relations(target_development_id);
create index briefing_edition_events_edition_created_idx
  on public.briefing_edition_events(edition_id,created_at desc);
create index briefing_edition_events_revision_created_idx
  on public.briefing_edition_events(revision_id,created_at desc)
  where revision_id is not null;

-- 5. RLS and explicit least-privilege table grants.
alter table public.briefing_editions enable row level security;
alter table public.briefing_revisions enable row level security;
alter table public.briefing_developments enable row level security;
alter table public.briefing_development_sources enable row level security;
alter table public.briefing_edition_items enable row level security;
alter table public.briefing_development_relations enable row level security;
alter table public.briefing_edition_events enable row level security;

revoke all on table public.briefing_editions, public.briefing_revisions,
  public.briefing_developments, public.briefing_development_sources,
  public.briefing_edition_items, public.briefing_development_relations,
  public.briefing_edition_events from public, anon, authenticated;

grant select,insert,update on public.briefing_editions to authenticated;
grant select,insert,update on public.briefing_revisions to authenticated;
grant select,insert,update,delete on public.briefing_developments to authenticated;
grant select,insert,update,delete on public.briefing_development_sources to authenticated;
grant select,insert,update,delete on public.briefing_edition_items to authenticated;
grant select,insert,update,delete on public.briefing_development_relations to authenticated;
grant select on public.briefing_edition_events to authenticated;

create policy briefing_editions_staff_select on public.briefing_editions
  for select to authenticated
  using ((select private.has_any_role(array['admin','editor'])));
create policy briefing_editions_staff_insert on public.briefing_editions
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and status = 'active'
    and current_revision_id is null
    and (select private.has_any_role(array['admin','editor']))
  );
create policy briefing_editions_staff_update on public.briefing_editions
  for update to authenticated
  using ((select private.has_any_role(array['admin','editor'])))
  with check ((select private.has_any_role(array['admin','editor'])));

create policy briefing_revisions_staff_select on public.briefing_revisions
  for select to authenticated
  using ((select private.has_any_role(array['admin','editor'])));
create policy briefing_revisions_staff_insert on public.briefing_revisions
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and status = 'draft'
    and (select private.has_any_role(array['admin','editor']))
  );
create policy briefing_revisions_staff_update on public.briefing_revisions
  for update to authenticated
  using (
    (select private.has_any_role(array['admin']))
    or (status = 'draft' and (select private.has_any_role(array['editor'])))
  )
  with check (
    (select private.has_any_role(array['admin']))
    or (status in ('draft','in_review')
      and (select private.has_any_role(array['editor'])))
  );

create policy briefing_developments_staff_select on public.briefing_developments
  for select to authenticated
  using ((select private.has_any_role(array['admin','editor'])));
create policy briefing_developments_staff_insert on public.briefing_developments
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and (select private.has_any_role(array['admin','editor']))
  );
create policy briefing_developments_staff_update on public.briefing_developments
  for update to authenticated
  using ((select private.has_any_role(array['admin','editor'])))
  with check ((select private.has_any_role(array['admin','editor'])));
create policy briefing_developments_admin_delete on public.briefing_developments
  for delete to authenticated
  using ((select private.has_any_role(array['admin'])));

create policy briefing_development_sources_staff_select
  on public.briefing_development_sources for select to authenticated
  using ((select private.has_any_role(array['admin','editor'])));
create policy briefing_development_sources_staff_insert
  on public.briefing_development_sources for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and (select private.has_any_role(array['admin','editor']))
  );
create policy briefing_development_sources_staff_update
  on public.briefing_development_sources for update to authenticated
  using ((select private.has_any_role(array['admin','editor'])))
  with check ((select private.has_any_role(array['admin','editor'])));
create policy briefing_development_sources_staff_delete
  on public.briefing_development_sources for delete to authenticated
  using ((select private.has_any_role(array['admin','editor'])));

create policy briefing_edition_items_staff_select
  on public.briefing_edition_items for select to authenticated
  using ((select private.has_any_role(array['admin','editor'])));
create policy briefing_edition_items_staff_insert
  on public.briefing_edition_items for insert to authenticated
  with check (
    (select private.has_any_role(array['admin','editor']))
    and exists (
      select 1 from public.briefing_revisions r
      where r.id = revision_id and r.status = 'draft'
    )
  );
create policy briefing_edition_items_staff_update
  on public.briefing_edition_items for update to authenticated
  using (
    exists (select 1 from public.briefing_revisions r
      where r.id = revision_id and r.status = 'draft')
    and (select private.has_any_role(array['admin','editor']))
  )
  with check (
    exists (select 1 from public.briefing_revisions r
      where r.id = revision_id and r.status = 'draft')
    and (select private.has_any_role(array['admin','editor']))
  );
create policy briefing_edition_items_staff_delete
  on public.briefing_edition_items for delete to authenticated
  using (
    exists (select 1 from public.briefing_revisions r
      where r.id = revision_id and r.status = 'draft')
    and (select private.has_any_role(array['admin','editor']))
  );

create policy briefing_development_relations_staff_select
  on public.briefing_development_relations for select to authenticated
  using ((select private.has_any_role(array['admin','editor'])));
create policy briefing_development_relations_staff_insert
  on public.briefing_development_relations for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and (select private.has_any_role(array['admin','editor']))
  );
create policy briefing_development_relations_staff_update
  on public.briefing_development_relations for update to authenticated
  using ((select private.has_any_role(array['admin','editor'])))
  with check ((select private.has_any_role(array['admin','editor'])));
create policy briefing_development_relations_staff_delete
  on public.briefing_development_relations for delete to authenticated
  using ((select private.has_any_role(array['admin','editor'])));

create policy briefing_edition_events_staff_select
  on public.briefing_edition_events for select to authenticated
  using ((select private.has_any_role(array['admin','editor'])));

-- 6. Timestamp triggers and transition/immutability guards.
create or replace function private.briefing_touch_updated_at()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  new.updated_at := now();
  if tg_table_name = 'briefing_developments' then
    new.updated_by := auth.uid();
  end if;
  return new;
end;
$$;

create trigger briefing_editions_touch_updated_at
  before update on public.briefing_editions
  for each row execute function private.briefing_touch_updated_at();
create trigger briefing_revisions_touch_updated_at
  before update on public.briefing_revisions
  for each row execute function private.briefing_touch_updated_at();
create trigger briefing_developments_touch_updated_at
  before update on public.briefing_developments
  for each row execute function private.briefing_touch_updated_at();

create or replace function private.briefing_guard_revision()
returns trigger language plpgsql security invoker set search_path = ''
as $$
declare
  v_admin boolean := private.has_any_role(array['admin']);
  v_staff boolean := private.has_any_role(array['admin','editor']);
begin
  if tg_op = 'INSERT' then
    if new.status <> 'draft' or not v_staff then
      raise exception 'New briefing revisions must be staff-created drafts';
    end if;
    if new.revision_kind = 'correction' and not exists (
      select 1 from public.briefing_revisions b
      where b.id = new.based_on_revision_id
        and b.edition_id = new.edition_id and b.status = 'published'
    ) then
      raise exception 'Correction must reference a published revision of the same edition';
    end if;
    return new;
  end if;

  if old.status = 'published' then
    raise exception 'Published revisions are immutable; create a correction revision';
  end if;

  if row(new.edition_id,new.revision_no,new.revision_kind,
         new.based_on_revision_id,new.created_by,new.created_at)
     is distinct from
     row(old.edition_id,old.revision_no,old.revision_kind,
         old.based_on_revision_id,old.created_by,old.created_at) then
    raise exception 'Revision identity and creator metadata are immutable';
  end if;

  if old.status <> 'draft'
     and row(new.title_ar,new.analysis_ar,new.methodology_ar,
             new.coverage_note_ar,new.window_start,new.window_end,new.checked_at,
             new.change_reason_ar)
       is distinct from
         row(old.title_ar,old.analysis_ar,old.methodology_ar,
             old.coverage_note_ar,old.window_start,old.window_end,old.checked_at,
             old.change_reason_ar) then
    raise exception 'Only draft revision content can be edited';
  end if;

  if new.status = old.status
     and row(new.submitted_by,new.submitted_at,new.reviewed_by,new.reviewed_at,
             new.approved_by,new.approved_at,new.published_by,new.published_at,
             new.published_snapshot,new.review_note_ar)
       is distinct from
         row(old.submitted_by,old.submitted_at,old.reviewed_by,old.reviewed_at,
             old.approved_by,old.approved_at,old.published_by,old.published_at,
             old.published_snapshot,old.review_note_ar) then
    raise exception 'Workflow metadata can only change through lifecycle transitions';
  end if;

  if new.status is distinct from old.status then
    if current_setting('sas.briefing_transition_id',true) is distinct from new.id::text then
      raise exception 'Use the briefing lifecycle RPC for status transitions';
    end if;
    if old.status = 'draft' and new.status = 'in_review' and v_staff then
      if new.submitted_by is distinct from auth.uid() or new.submitted_at is null then
        raise exception 'Submission metadata is required';
      end if;
    elsif old.status = 'in_review' and new.status = 'draft' and v_admin then
      if new.reviewed_by is distinct from auth.uid() or nullif(btrim(new.review_note_ar),'') is null then
        raise exception 'A reviewer and return note are required';
      end if;
    elsif old.status = 'in_review' and new.status = 'approved' and v_admin then
      if new.approved_by is distinct from auth.uid() or new.reviewed_by is distinct from auth.uid() then
        raise exception 'Approval metadata is required';
      end if;
    elsif old.status = 'approved' and new.status = 'published' and v_admin then
      if new.published_by is distinct from auth.uid()
         or new.published_at is null or new.published_snapshot is null then
        raise exception 'Publication metadata and snapshot are required';
      end if;
    else
      raise exception 'Invalid briefing revision transition: % -> %',old.status,new.status;
    end if;
  end if;
  return new;
end;
$$;

create trigger briefing_revisions_guard
  before insert or update on public.briefing_revisions
  for each row execute function private.briefing_guard_revision();

create or replace function private.briefing_guard_created_metadata()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  if tg_table_name = 'briefing_editions' then
    if new.created_by is distinct from old.created_by
       or new.created_at is distinct from old.created_at then
      raise exception 'Edition creator metadata is immutable';
    end if;
  elsif tg_table_name = 'briefing_developments' then
    if new.created_by is distinct from old.created_by
       or new.created_at is distinct from old.created_at then
      raise exception 'Development creator metadata is immutable';
    end if;
  elsif tg_table_name = 'briefing_development_sources' then
    if new.created_by is distinct from old.created_by
       or new.created_at is distinct from old.created_at then
      raise exception 'Development-source creator metadata is immutable';
    end if;
  elsif tg_table_name = 'briefing_edition_items' then
    if new.created_at is distinct from old.created_at then
      raise exception 'Edition-item creation timestamp is immutable';
    end if;
  elsif tg_table_name = 'briefing_development_relations' then
    if new.created_by is distinct from old.created_by
       or new.created_at is distinct from old.created_at then
      raise exception 'Development-relation creator metadata is immutable';
    end if;
  end if;
  return new;
end;
$$;

create trigger briefing_editions_guard_created_metadata
  before update on public.briefing_editions
  for each row execute function private.briefing_guard_created_metadata();
create trigger briefing_developments_guard_created_metadata
  before update on public.briefing_developments
  for each row execute function private.briefing_guard_created_metadata();
create trigger briefing_development_sources_guard_created_metadata
  before update on public.briefing_development_sources
  for each row execute function private.briefing_guard_created_metadata();
create trigger briefing_edition_items_guard_created_metadata
  before update on public.briefing_edition_items
  for each row execute function private.briefing_guard_created_metadata();
create trigger briefing_development_relations_guard_created_metadata
  before update on public.briefing_development_relations
  for each row execute function private.briefing_guard_created_metadata();

create or replace function private.briefing_guard_edition_insert()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  if new.status <> 'active' or new.current_revision_id is not null then
    raise exception 'New editions must start active without a published revision';
  end if;
  if new.created_by is distinct from auth.uid() then
    raise exception 'Edition creator must be the authenticated user';
  end if;
  return new;
end;
$$;

create trigger briefing_editions_guard_insert
  before insert on public.briefing_editions
  for each row execute function private.briefing_guard_edition_insert();

create or replace function private.briefing_guard_edition()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  if new.current_revision_id is distinct from old.current_revision_id then
    if new.current_revision_id is null then
      raise exception 'Current published revision pointer cannot be cleared';
    end if;
    if not private.has_any_role(array['admin'])
       or current_setting('sas.briefing_publish_revision_id',true)
          is distinct from new.current_revision_id::text then
      raise exception 'Only the publish workflow can change the current published revision';
    end if;
    if new.current_revision_id is not null and not exists (
      select 1 from public.briefing_revisions r
      where r.id = new.current_revision_id
        and r.edition_id = new.id and r.status = 'published'
    ) then
      raise exception 'Current revision must be published and belong to this edition';
    end if;
  end if;

  if exists (
    select 1 from public.briefing_revisions r
    where r.edition_id = old.id
  ) and row(new.slug,new.edition_date,new.edition_type)
       is distinct from row(old.slug,old.edition_date,old.edition_type) then
    raise exception 'Edition identity is immutable once its first revision exists';
  end if;

  if new.status is distinct from old.status then
    if not private.has_any_role(array['admin']) then
      raise exception 'Only an administrator can archive or withdraw an edition';
    end if;
    if old.status = 'withdrawn' and new.status <> 'withdrawn' then
      raise exception 'Withdrawn editions cannot be reactivated';
    end if;
  end if;
  return new;
end;
$$;

create trigger briefing_editions_guard
  before update on public.briefing_editions
  for each row execute function private.briefing_guard_edition();

-- Shared development evidence cannot change while a revision is in review/approved.
create or replace function private.briefing_guard_locked_development()
returns trigger language plpgsql security invoker set search_path = ''
as $$
declare
  v_id uuid;
begin
  if tg_table_name = 'briefing_development_sources' then
    v_id := case when tg_op = 'DELETE' then old.development_id else new.development_id end;
  else
    v_id := case when tg_op = 'DELETE' then old.id else new.id end;
  end if;

  if exists (
    select 1 from public.briefing_edition_items i
    join public.briefing_revisions r on r.id = i.revision_id
    where i.development_id = v_id and r.status in ('in_review','approved')
  ) then
    raise exception 'Development evidence is locked by a revision under review or approved';
  end if;

  if tg_op = 'UPDATE' and tg_table_name = 'briefing_development_sources'
     and old.development_id is distinct from new.development_id
     and exists (
       select 1 from public.briefing_edition_items i
       join public.briefing_revisions r on r.id = i.revision_id
       where i.development_id = old.development_id
         and r.status in ('in_review','approved')
     ) then
    raise exception 'Previous development evidence is locked';
  end if;

  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;

create trigger briefing_developments_guard_locked
  before update or delete on public.briefing_developments
  for each row execute function private.briefing_guard_locked_development();
create trigger briefing_development_sources_guard_locked
  before insert or update or delete on public.briefing_development_sources
  for each row execute function private.briefing_guard_locked_development();

-- The shared source registry is mutable elsewhere in the platform. Freeze a
-- source row while any briefing revision using it is under review or approved,
-- so the reviewer cannot approve one evidence record and publish another.
create or replace function private.briefing_guard_locked_source_registry()
returns trigger language plpgsql security invoker set search_path = ''
as $
begin
  if exists (
    select 1
    from public.briefing_development_sources ds
    join public.briefing_edition_items i on i.development_id = ds.development_id
    join public.briefing_revisions r on r.id = i.revision_id
    where ds.source_id = old.id
      and r.status in ('in_review','approved')
  ) then
    raise exception 'Source registry record is locked by a briefing revision under review or approved';
  end if;
  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$;

create trigger content_sources_guard_briefing_locked
  before update or delete on public.content_sources
  for each row execute function private.briefing_guard_locked_source_registry();

-- Make audit append-only even if table grants are broadened accidentally later.
create or replace function private.briefing_reject_event_mutation()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  raise exception 'Briefing audit events are append-only';
end;
$$;

create trigger briefing_edition_events_append_only
  before update or delete on public.briefing_edition_events
  for each row execute function private.briefing_reject_event_mutation();

revoke all on function private.briefing_reject_event_mutation() from public,anon,authenticated;

-- Append-only audit events are written by definer-owned triggers, not app DML.
create or replace function private.briefing_audit_revision()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  v_event text;
begin
  if tg_op = 'INSERT' then
    v_event := case when new.revision_kind = 'correction'
      then 'correction_created' else 'revision_created' end;
    insert into public.briefing_edition_events
      (edition_id,revision_id,event_type,to_status,actor_id,note_ar)
    values (new.edition_id,new.id,v_event,new.status,auth.uid(),new.change_reason_ar);
  elsif new.status is distinct from old.status then
    v_event := case new.status
      when 'in_review' then 'submitted_for_review'
      when 'draft' then 'returned_for_editing'
      when 'approved' then 'approved'
      when 'published' then 'published'
      else 'status_changed' end;
    insert into public.briefing_edition_events
      (edition_id,revision_id,event_type,from_status,to_status,actor_id,note_ar)
    values (new.edition_id,new.id,v_event,old.status,new.status,auth.uid(),
            coalesce(new.review_note_ar,new.change_reason_ar));
  end if;
  return new;
end;
$$;

create trigger briefing_revisions_audit_insert
  after insert on public.briefing_revisions
  for each row execute function private.briefing_audit_revision();
create trigger briefing_revisions_audit_status
  after update of status on public.briefing_revisions
  for each row execute function private.briefing_audit_revision();

create or replace function private.briefing_audit_edition()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.briefing_edition_events(edition_id,event_type,to_status,actor_id)
    values (new.id,'edition_created',new.status,auth.uid());
  elsif new.status is distinct from old.status then
    insert into public.briefing_edition_events
      (edition_id,event_type,from_status,to_status,actor_id)
    values (new.id,
      case new.status when 'archived' then 'edition_archived'
        when 'withdrawn' then 'edition_withdrawn' else 'edition_status_changed' end,
      old.status,new.status,auth.uid());
  elsif new.current_revision_id is distinct from old.current_revision_id then
    insert into public.briefing_edition_events
      (edition_id,revision_id,event_type,actor_id)
    values (new.id,new.current_revision_id,'current_revision_changed',auth.uid());
  end if;
  return new;
end;
$$;

create trigger briefing_editions_audit_insert
  after insert on public.briefing_editions
  for each row execute function private.briefing_audit_edition();
create trigger briefing_editions_audit_update
  after update on public.briefing_editions
  for each row execute function private.briefing_audit_edition();

revoke all on function private.briefing_touch_updated_at() from public,anon,authenticated;
revoke all on function private.briefing_guard_created_metadata() from public,anon,authenticated;
revoke all on function private.briefing_guard_revision() from public,anon,authenticated;
revoke all on function private.briefing_guard_edition_insert() from public,anon,authenticated;
revoke all on function private.briefing_guard_edition() from public,anon,authenticated;
revoke all on function private.briefing_guard_locked_development() from public,anon,authenticated;
revoke all on function private.briefing_guard_locked_source_registry() from public,anon,authenticated;
revoke all on function private.briefing_audit_revision() from public,anon,authenticated;
revoke all on function private.briefing_audit_edition() from public,anon,authenticated;

-- 7. Snapshot builder; invoker rights keep staff RLS in force.
create or replace function private.build_briefing_snapshot(p_revision_id uuid)
returns jsonb language sql stable security invoker set search_path = ''
as $$
  select jsonb_build_object(
    'schema_version',1,
    'edition',jsonb_build_object(
      'edition_no',e.edition_no,'slug',e.slug,
      'edition_date',e.edition_date,'edition_type',e.edition_type
    ),
    'revision',jsonb_build_object(
      'revision_no',r.revision_no,'revision_kind',r.revision_kind,
      'title_ar',r.title_ar,'analysis_ar',r.analysis_ar,
      'methodology_ar',r.methodology_ar,'coverage_note_ar',r.coverage_note_ar,
      'window_start',r.window_start,'window_end',r.window_end,
      'checked_at',r.checked_at,'published_at',now(),
      'change_reason_ar',r.change_reason_ar
    ),
    'executive_summary',coalesce((
      select jsonb_agg(jsonb_build_object(
        'order',i.display_order,'text_ar',i.summary_text_ar,
        'headline_ar',coalesce(i.headline_override_ar,d.headline_ar),
        'information_class',d.information_class,
        'verification_status',d.verification_status,
        'sources',(
          select coalesce(jsonb_agg(jsonb_build_object(
            'source_name',s.source_name,'source_title',s.source_title,
            'organization_name',s.organization_name,'source_type',s.source_type,
            'source_url',s.source_url,'source_reference',s.source_reference,
            'publication_date',s.publication_date,'published_at',s.published_at,
            'language_code',s.language_code,'source_role',ds.source_role,
            'source_excerpt',ds.source_excerpt,
            'attribution_note',coalesce(ds.attribution_note,s.attribution_note),
            'accessed_at',ds.accessed_at
          ) order by ds.display_order,s.source_name),'[]'::jsonb)
          from public.briefing_development_sources ds
          join public.content_sources s on s.id=ds.source_id
          where ds.development_id=d.id and ds.display_publicly = true and s.is_active = true
        )
      ) order by i.display_order)
      from public.briefing_edition_items i
      join public.briefing_developments d on d.id=i.development_id
      where i.revision_id=p_revision_id and i.display_section='executive_summary'
    ),'[]'::jsonb),
    'developments',coalesce((
      select jsonb_agg(jsonb_build_object(
        'order',i.display_order,
        'headline_ar',coalesce(i.headline_override_ar,d.headline_ar),
        'summary_ar',coalesce(i.summary_text_ar,d.summary_ar),
        'what_changed_ar',i.what_changed_ar,'why_it_matters_ar',i.why_it_matters_ar,
        'context_ar',i.context_ar,'category',d.category,
        'information_class',d.information_class,
        'verification_status',d.verification_status,
        'verification_note_ar',d.verification_note_ar,
        'occurred_at',d.occurred_at,'occurred_on',d.occurred_on,
        'time_precision',d.time_precision,'location_text',d.location_text,
        'geographic_scope',d.geographic_scope,
        'sources',(
          select coalesce(jsonb_agg(jsonb_build_object(
            'source_name',s.source_name,'source_title',s.source_title,
            'organization_name',s.organization_name,'source_type',s.source_type,
            'source_url',s.source_url,'source_reference',s.source_reference,
            'publication_date',s.publication_date,'published_at',s.published_at,
            'language_code',s.language_code,'source_role',ds.source_role,
            'source_excerpt',ds.source_excerpt,
            'attribution_note',coalesce(ds.attribution_note,s.attribution_note),
            'accessed_at',ds.accessed_at
          ) order by ds.display_order,s.source_name),'[]'::jsonb)
          from public.briefing_development_sources ds
          join public.content_sources s on s.id=ds.source_id
          where ds.development_id=d.id and ds.display_publicly = true and s.is_active = true
        )
      ) order by i.display_order)
      from public.briefing_edition_items i
      join public.briefing_developments d on d.id=i.development_id
      where i.revision_id=p_revision_id and i.display_section='developments'
    ),'[]'::jsonb)
  )
  from public.briefing_revisions r
  join public.briefing_editions e on e.id=r.edition_id
  where r.id=p_revision_id;
$$;
revoke all on function private.build_briefing_snapshot(uuid) from public,anon;
grant execute on function private.build_briefing_snapshot(uuid) to authenticated;

-- 8. Lifecycle RPCs. They run as the caller; RLS is not bypassed.
create or replace function public.create_briefing_edition(
  p_slug text,p_edition_date date,p_edition_type text,
  p_title_ar text,p_analysis_ar text,p_methodology_ar text,p_coverage_note_ar text,
  p_window_start timestamptz,p_window_end timestamptz
)
returns jsonb language plpgsql security invoker set search_path = ''
as $$
declare v_edition uuid; v_revision uuid; v_no bigint;
begin
  if not private.has_any_role(array['admin','editor']) then
    raise exception 'Insufficient briefing permissions';
  end if;
  insert into public.briefing_editions(slug,edition_date,edition_type,created_by)
  values(lower(btrim(p_slug)),p_edition_date,p_edition_type,auth.uid())
  returning id,edition_no into v_edition,v_no;
  insert into public.briefing_revisions(
    edition_id,revision_no,revision_kind,status,title_ar,analysis_ar,
    methodology_ar,coverage_note_ar,window_start,window_end,checked_at,created_by
  ) values (
    v_edition,1,'initial','draft',p_title_ar,p_analysis_ar,
    p_methodology_ar,p_coverage_note_ar,p_window_start,p_window_end,now(),auth.uid()
  ) returning id into v_revision;
  return jsonb_build_object('edition_id',v_edition,'edition_no',v_no,
    'slug',lower(btrim(p_slug)),'revision_id',v_revision,'revision_no',1,'status','draft');
end;
$$;

create or replace function public.submit_briefing_revision(p_revision_id uuid)
returns void language plpgsql security invoker set search_path = ''
as $$
begin
  if not private.has_any_role(array['admin','editor']) then
    raise exception 'Insufficient briefing permissions';
  end if;
  perform set_config('sas.briefing_transition_id',p_revision_id::text,true);
  update public.briefing_revisions
  set status='in_review',submitted_by=auth.uid(),submitted_at=now()
  where id=p_revision_id and status='draft';
  if not found then raise exception 'Revision not found or not draft'; end if;
end;
$$;

create or replace function public.return_briefing_revision(p_revision_id uuid,p_note_ar text)
returns void language plpgsql security invoker set search_path = ''
as $$
begin
  if not private.has_any_role(array['admin']) then
    raise exception 'Only an administrator can return a revision';
  end if;
  if nullif(btrim(p_note_ar),'') is null then raise exception 'Return note is required'; end if;
  perform set_config('sas.briefing_transition_id',p_revision_id::text,true);
  update public.briefing_revisions
  set status='draft',reviewed_by=auth.uid(),reviewed_at=now(),review_note_ar=p_note_ar
  where id=p_revision_id and status='in_review';
  if not found then raise exception 'Revision not found or not in review'; end if;
end;
$$;

create or replace function public.approve_briefing_revision(p_revision_id uuid,p_note_ar text default null)
returns void language plpgsql security invoker set search_path = ''
as $$
begin
  if not private.has_any_role(array['admin']) then
    raise exception 'Only an administrator can approve a revision';
  end if;
  perform set_config('sas.briefing_transition_id',p_revision_id::text,true);
  update public.briefing_revisions
  set status='approved',reviewed_by=auth.uid(),reviewed_at=now(),
      approved_by=auth.uid(),approved_at=now(),review_note_ar=p_note_ar
  where id=p_revision_id and status='in_review';
  if not found then raise exception 'Revision not found or not in review'; end if;
end;
$$;

create or replace function public.create_briefing_correction(p_edition_id uuid,p_change_reason_ar text)
returns uuid language plpgsql security invoker set search_path = ''
as $$
declare v_base public.briefing_revisions%rowtype; v_new uuid; v_no integer;
begin
  if not private.has_any_role(array['admin','editor']) then
    raise exception 'Insufficient briefing permissions';
  end if;
  if nullif(btrim(p_change_reason_ar),'') is null then raise exception 'Correction reason is required'; end if;
  perform 1 from public.briefing_editions where id=p_edition_id for update;
  select r.* into v_base
  from public.briefing_editions e
  join public.briefing_revisions r on r.id=e.current_revision_id
  where e.id=p_edition_id and e.status <> 'withdrawn' and r.status='published';
  if not found then raise exception 'No current published revision exists'; end if;
  select coalesce(max(revision_no),0)+1 into v_no
  from public.briefing_revisions where edition_id=p_edition_id;
  insert into public.briefing_revisions(
    edition_id,revision_no,revision_kind,based_on_revision_id,status,
    title_ar,analysis_ar,methodology_ar,coverage_note_ar,
    window_start,window_end,checked_at,change_reason_ar,created_by
  ) values (
    p_edition_id,v_no,'correction',v_base.id,'draft',
    v_base.title_ar,v_base.analysis_ar,v_base.methodology_ar,v_base.coverage_note_ar,
    v_base.window_start,v_base.window_end,v_base.checked_at,p_change_reason_ar,auth.uid()
  ) returning id into v_new;
  insert into public.briefing_edition_items(
    revision_id,development_id,display_section,display_order,summary_text_ar,
    headline_override_ar,what_changed_ar,why_it_matters_ar,context_ar
  )
  select v_new,development_id,display_section,display_order,summary_text_ar,
    headline_override_ar,what_changed_ar,why_it_matters_ar,context_ar
  from public.briefing_edition_items where revision_id=v_base.id;
  return v_new;
end;
$$;

create or replace function public.publish_briefing_revision(p_revision_id uuid)
returns jsonb language plpgsql security invoker set search_path = ''
as $$
declare
  v_revision public.briefing_revisions%rowtype;
  v_edition public.briefing_editions%rowtype;
  v_summary integer; v_developments integer; v_missing integer; v_words integer;
  v_snapshot jsonb;
begin
  if not private.has_any_role(array['admin']) then raise exception 'Only an administrator can publish'; end if;
  select * into v_revision from public.briefing_revisions
  where id=p_revision_id and status='approved' for update;
  if not found then raise exception 'Only an approved revision can be published'; end if;
  select * into v_edition from public.briefing_editions
  where id=v_revision.edition_id for update;
  if not found or v_edition.status='withdrawn' then raise exception 'Edition is missing or withdrawn'; end if;

  v_words := cardinality(regexp_split_to_array(btrim(v_revision.analysis_ar),'\s+'));
  if v_words < 400 or v_words > 650 then
    raise exception 'Main analysis must contain 400-650 words; current count: %',v_words;
  end if;

  select count(*) into v_summary from public.briefing_edition_items
  where revision_id=p_revision_id and display_section='executive_summary';
  if v_summary < 3 or v_summary > 5 then raise exception 'Executive summary must contain 3-5 items'; end if;

  if exists (
    select 1
    from public.briefing_edition_items s
    where s.revision_id=p_revision_id
      and s.display_section='executive_summary'
      and not exists (
        select 1 from public.briefing_edition_items d
        where d.revision_id=s.revision_id
          and d.display_section='developments'
          and d.development_id=s.development_id
      )
  ) then
    raise exception 'Every executive-summary item must reference a development listed in the development ledger';
  end if;

  select count(*) into v_developments from public.briefing_edition_items
  where revision_id=p_revision_id and display_section='developments';
  if v_developments < 1 then raise exception 'At least one development is required'; end if;

  select count(*) into v_missing
  from (
    select distinct i.development_id
    from public.briefing_edition_items i
    join public.briefing_developments d on d.id=i.development_id
    where i.revision_id=p_revision_id
      and (d.status <> 'ready' or not exists (
        select 1 from public.briefing_development_sources ds
        join public.content_sources s on s.id=ds.source_id
        where ds.development_id=d.id
          and ds.display_publicly = true
          and s.is_active = true
          and (nullif(btrim(s.source_url),'') is not null
            or nullif(btrim(s.source_reference),'') is not null)
      ))
  ) missing_developments;
  if v_missing > 0 then raise exception '% selected development(s) are not ready or lack traceable sources',v_missing; end if;

  v_snapshot := private.build_briefing_snapshot(p_revision_id);
  if v_snapshot is null then raise exception 'Could not build publication snapshot'; end if;

  perform set_config('sas.briefing_transition_id',p_revision_id::text,true);
  update public.briefing_revisions
  set status='published',published_snapshot=v_snapshot,published_at=now(),published_by=auth.uid()
  where id=p_revision_id;

  perform set_config('sas.briefing_publish_revision_id',p_revision_id::text,true);
  update public.briefing_editions
  set current_revision_id=p_revision_id
  where id=v_revision.edition_id;
  return v_snapshot;
end;
$$;

-- 9. Public readers return only the current published snapshot.
create or replace function public.get_public_briefing(p_slug text)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'edition',jsonb_build_object(
      'edition_no',e.edition_no,'slug',e.slug,'edition_date',e.edition_date,
      'edition_type',e.edition_type,'status',e.status
    ),
    'snapshot',r.published_snapshot
  )
  from public.briefing_editions e
  join public.briefing_revisions r
    on r.id=e.current_revision_id and r.edition_id=e.id
  where e.slug=p_slug and e.status in ('active','archived')
    and r.status='published' and r.published_snapshot is not null
  limit 1;
$$;

create or replace function public.get_public_briefing_archive(
  p_limit integer default 20,p_before_date date default null,
  p_before_edition_no bigint default null
)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(to_jsonb(q) order by q.edition_date desc,q.edition_no desc),'[]'::jsonb)
  from (
    select e.edition_no,e.slug,e.edition_date,e.edition_type,r.published_at,r.title_ar
    from public.briefing_editions e
    join public.briefing_revisions r
      on r.id=e.current_revision_id and r.edition_id=e.id
    where e.status in ('active','archived') and r.status='published'
      and r.published_snapshot is not null
      and (
        p_before_date is null
        or (
          p_before_edition_no is null and e.edition_date < p_before_date
        )
        or (
          p_before_edition_no is not null
          and (e.edition_date,e.edition_no) < (p_before_date,p_before_edition_no)
        )
      )
    order by e.edition_date desc,e.edition_no desc
    limit greatest(1,least(coalesce(p_limit,20),50))
  ) q;
$$;

comment on function public.get_public_briefing(text)
  is 'Intentional read-only public endpoint. Returns only the current published snapshot for a non-withdrawn edition.';
comment on function public.get_public_briefing_archive(integer,date,bigint)
  is 'Intentional read-only public endpoint. Returns bounded metadata for current published editions only.';

-- Explicit function ACLs: public read only; lifecycle functions authenticated only.
revoke all on function public.get_public_briefing(text) from public,anon,authenticated;
revoke all on function public.get_public_briefing_archive(integer,date,bigint) from public,anon,authenticated;
grant execute on function public.get_public_briefing(text) to anon,authenticated;
grant execute on function public.get_public_briefing_archive(integer,date,bigint) to anon,authenticated;

revoke all on function public.create_briefing_edition(text,date,text,text,text,text,text,timestamptz,timestamptz) from public,anon,authenticated;
revoke all on function public.submit_briefing_revision(uuid) from public,anon,authenticated;
revoke all on function public.return_briefing_revision(uuid,text) from public,anon,authenticated;
revoke all on function public.approve_briefing_revision(uuid,text) from public,anon,authenticated;
revoke all on function public.create_briefing_correction(uuid,text) from public,anon,authenticated;
revoke all on function public.publish_briefing_revision(uuid) from public,anon,authenticated;
grant execute on function public.create_briefing_edition(text,date,text,text,text,text,text,timestamptz,timestamptz) to authenticated;
grant execute on function public.submit_briefing_revision(uuid) to authenticated;
grant execute on function public.return_briefing_revision(uuid,text) to authenticated;
grant execute on function public.approve_briefing_revision(uuid,text) to authenticated;
grant execute on function public.create_briefing_correction(uuid,text) to authenticated;
grant execute on function public.publish_briefing_revision(uuid) to authenticated;

revoke all on function private.build_briefing_snapshot(uuid) from public,anon;

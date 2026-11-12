-- SAS Daily Briefing V1 — Package 1 verification
-- Run only against the LOCAL Supabase database after applying the generated
-- local migration. Read-only metadata checks; no sample records are inserted.

-- A. All seven briefing tables exist and have RLS enabled.
select c.relname as table_name, c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as force_rls
from pg_class c
join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public'
  and c.relname in (
    'briefing_editions','briefing_revisions','briefing_developments',
    'briefing_development_sources','briefing_edition_items',
    'briefing_development_relations','briefing_edition_events'
  )
order by c.relname;

-- B. anon has no direct table privileges on briefing tables.
select table_name,grantee,privilege_type
from information_schema.role_table_grants
where table_schema='public'
  and table_name like 'briefing_%'
  and grantee='anon'
order by table_name,privilege_type;

-- C. authenticated has no TRUNCATE/REFERENCES/TRIGGER on the editorial core.
select table_name,privilege_type
from information_schema.role_table_grants
where table_schema='public'
  and table_name in ('content_items','content_sources','content_source_links','user_roles')
  and grantee='authenticated'
  and privilege_type in ('TRUNCATE','REFERENCES','TRIGGER')
order by table_name,privilege_type;

-- D. Audit table is SELECT-only for authenticated.
select privilege_type
from information_schema.role_table_grants
where table_schema='public'
  and table_name='briefing_edition_events'
  and grantee='authenticated'
order by privilege_type;

-- E. Public readers are the only intentionally exposed SECURITY DEFINER RPCs.
select p.proname,
       p.prosecdef as security_definer,
       has_function_privilege('anon',p.oid,'EXECUTE') as anon_execute,
       has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_execute
from pg_proc p
join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public'
  and p.proname in (
    'get_public_briefing','get_public_briefing_archive',
    'create_briefing_edition','submit_briefing_revision',
    'return_briefing_revision','approve_briefing_revision',
    'create_briefing_correction','publish_briefing_revision'
  )
order by p.proname;

-- F. Private trigger functions must not be directly executable by API roles.
select p.proname,
       has_function_privilege('anon',p.oid,'EXECUTE') as anon_execute,
       has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_execute
from pg_proc p
join pg_namespace n on n.oid=p.pronamespace
where n.nspname='private'
  and p.proname in (
    'briefing_touch_updated_at','briefing_guard_revision',
    'briefing_guard_edition','briefing_guard_locked_development',
    'briefing_audit_revision','briefing_audit_edition'
  )
order by p.proname;

-- G. New source metadata fields exist and the old publication_date remains date.
select column_name,data_type
from information_schema.columns
where table_schema='public' and table_name='content_sources'
  and column_name in ('source_title','published_at','language_code','publication_date')
order by column_name;

-- G2. Public source visibility is opt-in and defaults to false.
select column_name,data_type,column_default
from information_schema.columns
where table_schema='public'
  and table_name='briefing_development_sources'
  and column_name='display_publicly';

-- H. No test/sample briefing records should exist after schema-only migration.
select 'briefing_editions' as table_name,count(*) as row_count from public.briefing_editions
union all select 'briefing_revisions',count(*) from public.briefing_revisions
union all select 'briefing_developments',count(*) from public.briefing_developments
union all select 'briefing_edition_events',count(*) from public.briefing_edition_events;

-- I. Manual behavior tests (use dedicated local test users only):
-- 1. anon direct SELECT on each briefing table must fail.
-- 2. anon can execute get_public_briefing/get_public_briefing_archive and
--    receives no rows for an unknown slug or when no published edition exists.
-- 3. editor can create/edit a draft, link sources, add 3-5 summary entries,
--    and submit it; editor cannot approve or publish.
-- 4. editor cannot update a revision after it enters in_review; admin can
--    return it to draft with a mandatory note.
-- 5. admin can approve and publish only after all publication gates pass.
-- 6. a published revision cannot be updated or deleted; a correction creates
--    a new draft revision and preserves the old published_snapshot byte-for-byte.
-- 7. changing a development/source linked to an in_review or approved revision
--    must fail; changing it after publication must not alter the old snapshot.
-- 8. editor/author/anon cannot archive or withdraw an edition; admin can.
-- 9. withdrawn editions are not returned by public read RPCs or the archive.
-- 10. no workflow RPC is executable by anon; public readers are executable by
--     anon and authenticated.
-- 11. direct INSERT of an edition with archived/withdrawn status or a
--     non-null current_revision_id must fail; new editions start active.
-- 12. edition slug/date/type become immutable once its first revision exists.
-- 13. direct UPDATE/DELETE of briefing_edition_events must fail even if a
--     future grant is accidentally added; audit history is append-only.
-- 14. current_revision_id cannot be cleared after publication; it can only
--     move to another published revision through the publish RPC.
-- 15. A source link defaults to display_publicly=false; private source links
--     never appear in the published_snapshot, even when the development is
--     selected in the edition. Only active, explicitly public sources appear.
-- 16. Publishing must fail if a selected development has no active public
--     source with a source_url or source_reference.
-- 17. Existing grants on content_items/content_sources/content_source_links/
--     user_roles are unchanged by this feature migration.

-- Daily Briefing: source-first policy. Optional SAS commentary; developments, source attribution and human approval remain mandatory.
alter table public.briefing_revisions drop constraint briefing_revisions_analysis_ar_check;
alter table public.briefing_revisions alter column analysis_ar drop not null;

create or replace function public.publish_briefing_revision(p_revision_id uuid)
returns jsonb language plpgsql security invoker set search_path = ''
as $$
declare
  v_revision public.briefing_revisions%rowtype;
  v_edition public.briefing_editions%rowtype;
  v_summary integer; v_developments integer; v_missing integer;
  v_snapshot jsonb;
begin
  if not private.has_any_role(array['admin']) then raise exception 'Only an administrator can publish'; end if;
  select * into v_revision from public.briefing_revisions
  where id=p_revision_id and status='approved' for update;
  if not found then raise exception 'Only an approved revision can be published'; end if;
  select * into v_edition from public.briefing_editions
  where id=v_revision.edition_id for update;
  if not found or v_edition.status='withdrawn' then raise exception 'Edition is missing or withdrawn'; end if;

  -- Source-first editorial editions may have no SAS commentary.

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

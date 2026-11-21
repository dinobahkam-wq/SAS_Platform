-- SAS briefing editorial dimensions, version 1.
-- Safe additive change: existing published snapshots remain immutable.
-- Apply through reviewed migrations; do not manually rewrite published_snapshot.

alter table public.briefing_developments
  add column priority_level text
    check (priority_level in ('critical','high','standard')),
  add column yemen_relevance text
    check (yemen_relevance in ('direct','regional','strategic')),
  add column issuer_identity_id text
    check (issuer_identity_id is null or (length(issuer_identity_id) between 2 and 90 and issuer_identity_id ~ '^[a-z0-9-]+$')),
  add column publisher_identity_id text
    check (publisher_identity_id is null or (length(publisher_identity_id) between 2 and 90 and publisher_identity_id ~ '^[a-z0-9-]+$')),
  add column editorial_impact_note_ar text
    check (editorial_impact_note_ar is null or length(editorial_impact_note_ar) <= 1800);

comment on column public.briefing_developments.priority_level is 'Reviewed editorial importance; null means never evaluated, not standard';
comment on column public.briefing_developments.yemen_relevance is 'Evidence-based relation to Yemen; null means not evaluated';
comment on column public.briefing_developments.issuer_identity_id is 'ID of subject/issuer when explicitly confirmed; separate from publication source';
comment on column public.briefing_developments.publisher_identity_id is 'ID of the publisher used as source, not necessarily issuer';
comment on column public.briefing_developments.editorial_impact_note_ar is 'Brief, evidence-grounded editorial relevance assessment';

-- Updated builder affects future publications only: previous revision JSON snapshots are untouched.
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
        'priority_level',d.priority_level,
        'yemen_relevance',d.yemen_relevance,
        'issuer_identity_id',d.issuer_identity_id,
        'publisher_identity_id',d.publisher_identity_id,
        'editorial_impact_note_ar',d.editorial_impact_note_ar,
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

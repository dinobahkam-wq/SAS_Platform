-- SAS geospatial registry v1, 2026-11-21.
-- Explicit editorial selection only: no inference from old location_text, no snapshot rewrite.
-- City coordinates are *approximate city centres* from GeoNames, not event-site coordinates.
create table public.briefing_places (
  slug text primary key check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and length(slug) <= 100),
  name_ar text not null check (length(btrim(name_ar)) between 2 and 140),
  kind text not null check (kind in ('country','governorate','city','site')),
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  parent_slug text references public.briefing_places(slug) on delete restrict,
  latitude numeric(9,6) check (latitude between -90 and 90),
  longitude numeric(9,6) check (longitude between -180 and 180),
  coordinate_precision text not null check (coordinate_precision in ('none','city_centroid','approximate','verified_site')),
  source_name text not null check(length(btrim(source_name))>2),
  source_url text not null check(source_url ~ '^https://'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint briefing_places_coordinate_pair check ((latitude is null) = (longitude is null)),
  constraint briefing_places_precision_consistency check (
    (latitude is null and coordinate_precision='none') or
    (latitude is not null and coordinate_precision<>'none')
  ),
  constraint briefing_places_parent_type check (parent_slug is distinct from slug)
);
create index briefing_places_parent_idx on public.briefing_places(parent_slug);
create index briefing_places_country_active_idx on public.briefing_places(country_code,kind) where is_active;

alter table public.briefing_places enable row level security;
revoke all on public.briefing_places from public,anon,authenticated;
grant select on public.briefing_places to authenticated;
grant insert,update on public.briefing_places to authenticated;
create policy briefing_places_staff_read on public.briefing_places for select to authenticated
using ((select private.has_any_role(array['admin','editor'])));
create policy briefing_places_admin_insert on public.briefing_places for insert to authenticated
with check ((select private.has_any_role(array['admin'])));
create policy briefing_places_admin_update on public.briefing_places for update to authenticated
using ((select private.has_any_role(array['admin'])))
with check ((select private.has_any_role(array['admin'])));

-- Country/governorate boundaries are NOT loaded here; unverified centroids stay null.
insert into public.briefing_places
  (slug,name_ar,kind,country_code,parent_slug,latitude,longitude,coordinate_precision,source_name,source_url)
values
  ('ye','اليمن','country','YE',null,null,null,'none','Natural Earth','https://www.naturalearthdata.com/about/terms-of-use/'),
  ('ye-hadramawt','حضرموت','governorate','YE','ye',null,null,'none','geoBoundaries','https://www.geoboundaries.org/api/current/gbOpen/YEM/ADM1/'),
  ('ye-capital','أمانة العاصمة','governorate','YE','ye',null,null,'none','geoBoundaries','https://www.geoboundaries.org/api/current/gbOpen/YEM/ADM1/'),
  ('ye-aden','عدن (المحافظة)','governorate','YE','ye',null,null,'none','geoBoundaries','https://www.geoboundaries.org/api/current/gbOpen/YEM/ADM1/'),
  ('ye-hudaydah','الحديدة (المحافظة)','governorate','YE','ye',null,null,'none','geoBoundaries','https://www.geoboundaries.org/api/current/gbOpen/YEM/ADM1/'),
  ('ye-sanaa-city','صنعاء','city','YE','ye-capital',15.355,44.206,'city_centroid','GeoNames','https://www.geonames.org/YE/largest-cities-in-yemen.html'),
  ('ye-aden-city','عدن','city','YE','ye-aden',12.780,45.039,'city_centroid','GeoNames','https://www.geonames.org/YE/largest-cities-in-yemen.html'),
  ('ye-mukalla','المكلا','city','YE','ye-hadramawt',14.542,49.124,'city_centroid','GeoNames','https://www.geonames.org/YE/largest-cities-in-yemen.html'),
  ('ye-hudaydah-city','الحديدة','city','YE','ye-hudaydah',14.798,42.955,'city_centroid','GeoNames','https://www.geonames.org/YE/largest-cities-in-yemen.html');

alter table public.briefing_developments
  add column place_slug text references public.briefing_places(slug) on delete restrict;

comment on column public.briefing_developments.place_slug is 'Explicit editor-approved place only. Historical location_text is never automatically geocoded.';

-- Updated builder impacts FUTURE approvals, not old immutable published snapshots.
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
        'place',(
          select jsonb_build_object(
            'slug',p.slug,'name_ar',p.name_ar,'kind',p.kind,'country_code',p.country_code,
            'latitude',p.latitude,'longitude',p.longitude,'precision',p.coordinate_precision,
            'source_name',p.source_name,'source_url',p.source_url
          )
          from public.briefing_places p where p.slug=d.place_slug and p.is_active=true
        ),
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

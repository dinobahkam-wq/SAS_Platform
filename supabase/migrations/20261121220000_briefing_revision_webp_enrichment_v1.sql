-- SAS briefing visual enrichment v1.
-- No mutation of any existing published_snapshot or public historical revision.
ALTER TABLE public.media_assets
  ADD COLUMN rights_basis text
    CHECK (rights_basis IN ('owned','permission','public_domain','cc_by')),
  ADD COLUMN original_source_url text
    CHECK (original_source_url IS NULL OR original_source_url ~ '^https://'),
  ADD COLUMN original_file_name text;

CREATE TABLE public.briefing_revision_images (
  revision_id uuid NOT NULL REFERENCES public.briefing_revisions(id) ON DELETE RESTRICT,
  development_id uuid NOT NULL REFERENCES public.briefing_developments(id) ON DELETE RESTRICT,
  media_asset_id uuid NOT NULL REFERENCES public.media_assets(id) ON DELETE RESTRICT,
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(revision_id,development_id)
);
CREATE INDEX briefing_revision_images_asset_idx ON public.briefing_revision_images(media_asset_id);
ALTER TABLE public.briefing_revision_images ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.briefing_revision_images FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.briefing_revision_images TO authenticated;
CREATE POLICY sas_briefing_revision_images_staff_read ON public.briefing_revision_images FOR SELECT TO authenticated
  USING ((SELECT private.has_any_role(ARRAY['admin','editor'])));
CREATE POLICY sas_briefing_revision_images_admin_insert ON public.briefing_revision_images FOR INSERT TO authenticated
  WITH CHECK (created_by=(SELECT auth.uid()) AND (SELECT private.has_any_role(ARRAY['admin']))
    AND EXISTS(SELECT 1 FROM public.briefing_revisions r WHERE r.id=revision_id AND r.status='draft'));
CREATE POLICY sas_briefing_revision_images_admin_update ON public.briefing_revision_images FOR UPDATE TO authenticated
  USING ((SELECT private.has_any_role(ARRAY['admin'])) AND EXISTS(SELECT 1 FROM public.briefing_revisions r WHERE r.id=revision_id AND r.status='draft'))
  WITH CHECK ((SELECT private.has_any_role(ARRAY['admin'])) AND EXISTS(SELECT 1 FROM public.briefing_revisions r WHERE r.id=revision_id AND r.status='draft'));
CREATE POLICY sas_briefing_revision_images_admin_delete ON public.briefing_revision_images FOR DELETE TO authenticated
  USING ((SELECT private.has_any_role(ARRAY['admin'])) AND EXISTS(SELECT 1 FROM public.briefing_revisions r WHERE r.id=revision_id AND r.status='draft'));

CREATE OR REPLACE FUNCTION private.guard_briefing_revision_image()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE rev uuid;
BEGIN
  IF TG_OP='DELETE' THEN
    rev:=OLD.revision_id;
  ELSE
    rev:=NEW.revision_id;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM public.briefing_revisions r WHERE r.id=rev AND r.status='draft') THEN
    RAISE EXCEPTION 'Only draft revisions accept photo changes';
  END IF;
  IF TG_OP <> 'DELETE' THEN
    IF NOT EXISTS(SELECT 1 FROM public.briefing_edition_items i
       WHERE i.revision_id=NEW.revision_id AND i.development_id=NEW.development_id AND i.display_section='developments') THEN
      RAISE EXCEPTION 'This development does not belong to this revision';
    END IF;
    IF NOT EXISTS(SELECT 1 FROM public.media_assets a
       WHERE a.id=NEW.media_asset_id AND a.mime_type='image/webp' AND a.bucket_id='sas-public-media'
       AND nullif(btrim(a.alt_text),'') IS NOT NULL AND nullif(btrim(a.credit),'') IS NOT NULL
       AND a.rights_basis IS NOT NULL AND (a.rights_basis='owned' OR a.original_source_url IS NOT NULL)) THEN
      RAISE EXCEPTION 'Only attributed, rights-checked WebP assets may be linked';
    END IF;
  END IF;
  RETURN CASE WHEN TG_OP='DELETE' THEN OLD ELSE NEW END;
END;
$$;
CREATE TRIGGER sas_briefing_revision_image_guard
BEFORE INSERT OR UPDATE OR DELETE ON public.briefing_revision_images
FOR EACH ROW EXECUTE FUNCTION private.guard_briefing_revision_image();

-- The public reader embellishes only the CURRENT published revision's returned
-- JSON. Its stored immutable snapshot remains byte-identical. Old revisions
-- never gain new photos retroactively; photos are keyed by revision.
CREATE OR REPLACE FUNCTION public.get_public_briefing(p_slug text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $fn$
  SELECT jsonb_build_object(
    'edition',jsonb_build_object(
      'edition_no',e.edition_no,'slug',e.slug,'edition_date',e.edition_date,
      'edition_type',e.edition_type,'status',e.status
    ),
    'snapshot',jsonb_set(r.published_snapshot,'{developments}',
      COALESCE((
        SELECT jsonb_agg(d.value || CASE
            WHEN a.id IS NOT NULL THEN jsonb_build_object('image',jsonb_build_object(
              'bucket_id',a.bucket_id,'object_path',a.object_path,'alt_text',a.alt_text,
              'caption',a.caption,'credit',a.credit,'rights_basis',a.rights_basis,
              'source_url',a.original_source_url
            ))
            ELSE '{}'::jsonb END ORDER BY d.ordinality)
        FROM jsonb_array_elements(r.published_snapshot->'developments') WITH ORDINALITY AS d(value,ordinality)
        LEFT JOIN public.briefing_edition_items item
          ON item.revision_id=r.id AND item.display_section='developments'
          AND item.display_order=(d.value->>'order')::integer
        LEFT JOIN public.briefing_revision_images ri
          ON ri.revision_id=r.id AND ri.development_id=item.development_id
        LEFT JOIN public.media_assets a ON a.id=ri.media_asset_id
      ),'[]'::jsonb),false)
  )
  FROM public.briefing_editions e
  JOIN public.briefing_revisions r ON r.id=e.current_revision_id AND r.edition_id=e.id
  WHERE e.slug=p_slug AND e.status IN ('active','archived')
    AND r.status='published' AND r.published_snapshot IS NOT NULL
  LIMIT 1;
$fn$;
REVOKE ALL ON FUNCTION public.get_public_briefing(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_briefing(text) TO anon,authenticated;
COMMENT ON TABLE public.briefing_revision_images IS
'Optional visual enrichments keyed by revision and development. Draft-only mutation, separate from immutable published snapshots.';

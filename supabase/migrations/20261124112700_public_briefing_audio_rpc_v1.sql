-- Public audio is exposed only through this narrow stable RPC,
-- not through direct RLS reads of protected briefing editorial tables.
DROP POLICY IF EXISTS sas_audio_public_published ON public.briefing_audio_assets;
REVOKE SELECT ON public.briefing_audio_assets FROM anon;

CREATE OR REPLACE FUNCTION public.get_public_briefing_audio(p_slug text)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $fn$
  SELECT jsonb_build_object(
    'object_path',a.object_path,
    'file_name',a.file_name,
    'duration_seconds',a.duration_seconds,
    'revision_id',a.revision_id,
    'edition_slug',e.slug
  )
  FROM public.briefing_editions e
  JOIN public.briefing_revisions r
    ON r.id=e.current_revision_id AND r.edition_id=e.id
  JOIN public.briefing_audio_assets a
    ON a.edition_id=e.id AND a.revision_id=r.id
  WHERE e.slug=p_slug
    AND e.status IN ('active','archived')
    AND r.status='published' AND r.published_snapshot IS NOT NULL
    AND a.status='published'
  LIMIT 1;
$fn$;
REVOKE ALL ON FUNCTION public.get_public_briefing_audio(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_briefing_audio(text) TO anon,authenticated;
COMMENT ON FUNCTION public.get_public_briefing_audio(text) IS
'Public current edition published audio only, without exposing draft assets or protected editorial tables.';

-- SAS briefing audio: separate optional reviewed audio companion to a published revision.
-- Never modify immutable briefing snapshots.
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('sas-briefing-audio','sas-briefing-audio',true,10485760,ARRAY['audio/mp4','audio/mpeg','audio/x-m4a'])
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.briefing_audio_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id uuid NOT NULL REFERENCES public.briefing_editions(id) ON DELETE RESTRICT,
  revision_id uuid NOT NULL REFERENCES public.briefing_revisions(id) ON DELETE RESTRICT,
  object_path text NOT NULL UNIQUE CHECK (object_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\\.(m4a|mp3)$'),
  file_name text NOT NULL CHECK(length(file_name)>0 AND length(file_name)<=220),
  mime_type text NOT NULL CHECK(mime_type IN ('audio/mp4','audio/mpeg')),
  file_size integer NOT NULL CHECK(file_size > 0 AND file_size <= 10485760),
  duration_seconds integer NOT NULL CHECK(duration_seconds BETWEEN 15 AND 1800),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  UNIQUE (edition_id,revision_id),
  FOREIGN KEY (edition_id,revision_id) REFERENCES public.briefing_revisions(edition_id,id)
);
CREATE INDEX IF NOT EXISTS sas_briefing_audio_status_idx ON public.briefing_audio_assets(edition_id,revision_id,status);
ALTER TABLE public.briefing_audio_assets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.briefing_audio_assets FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.briefing_audio_assets TO anon,authenticated;
GRANT INSERT,UPDATE ON public.briefing_audio_assets TO authenticated;

CREATE POLICY sas_audio_public_published ON public.briefing_audio_assets
  FOR SELECT TO anon,authenticated USING (
    status='published' AND EXISTS (
      SELECT 1 FROM public.briefing_editions e
      WHERE e.id=edition_id AND e.current_revision_id=revision_id AND e.status IN ('active','archived'))
  );
CREATE POLICY sas_audio_admin_read ON public.briefing_audio_assets
  FOR SELECT TO authenticated USING ((SELECT private.has_any_role(ARRAY['admin'])));
CREATE POLICY sas_audio_admin_insert ON public.briefing_audio_assets
  FOR INSERT TO authenticated WITH CHECK (
    created_by=(SELECT auth.uid()) AND status='draft'
    AND (SELECT private.has_any_role(ARRAY['admin']))
    AND EXISTS (SELECT 1 FROM public.briefing_editions e
      WHERE e.id=edition_id AND e.current_revision_id=revision_id AND e.status IN ('active','archived'))
  );
CREATE POLICY sas_audio_admin_update ON public.briefing_audio_assets
  FOR UPDATE TO authenticated USING (
    status='draft' AND (SELECT private.has_any_role(ARRAY['admin'])))
  WITH CHECK (
    (SELECT private.has_any_role(ARRAY['admin']))
    AND EXISTS (SELECT 1 FROM public.briefing_editions e
      WHERE e.id=edition_id AND e.current_revision_id=revision_id AND e.status IN ('active','archived'))
  );

-- Uploaded audio paths are unguessable; the public player uses only rows marked published.
CREATE POLICY sas_audio_storage_admin_upload ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id='sas-briefing-audio' AND (storage.foldername(name))[1]=(SELECT auth.uid()::text)
    AND (SELECT private.has_any_role(ARRAY['admin'])));
CREATE POLICY sas_audio_storage_admin_read ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id='sas-briefing-audio' AND (SELECT private.has_any_role(ARRAY['admin'])));
CREATE POLICY sas_audio_storage_admin_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id='sas-briefing-audio' AND (storage.foldername(name))[1]=(SELECT auth.uid()::text)
    AND (SELECT private.has_any_role(ARRAY['admin'])));

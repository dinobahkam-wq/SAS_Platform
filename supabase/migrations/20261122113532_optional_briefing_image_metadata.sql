-- Allow optional descriptive metadata on admin-selected briefing images.
-- Image validation, admin RLS, and draft-only revision guards remain enforced.
-- A blank rights_basis means "not documented", never "owned" or "licensed".
CREATE OR REPLACE FUNCTION private.guard_briefing_revision_image()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE rev uuid;
BEGIN
  IF TG_OP='DELETE' THEN
    rev:=OLD.revision_id;
  ELSE
    rev:=NEW.revision_id;
  END IF;
  IF NOT EXISTS(
    SELECT 1 FROM public.briefing_revisions r
    WHERE r.id=rev AND r.status='draft'
  ) THEN
    RAISE EXCEPTION 'Only draft revisions accept photo changes';
  END IF;
  IF TG_OP <> 'DELETE' THEN
    IF NOT EXISTS(
      SELECT 1 FROM public.briefing_edition_items i
      WHERE i.revision_id=NEW.revision_id
        AND i.development_id=NEW.development_id
        AND i.display_section='developments'
    ) THEN
      RAISE EXCEPTION 'This development does not belong to this revision';
    END IF;
    IF NOT EXISTS(
      SELECT 1 FROM public.media_assets a
      WHERE a.id=NEW.media_asset_id
        AND a.mime_type='image/webp'
        AND a.bucket_id='sas-public-media'
    ) THEN
      RAISE EXCEPTION 'Only verified WebP media from the briefing media bucket may be linked';
    END IF;
  END IF;
  RETURN CASE WHEN TG_OP='DELETE' THEN OLD ELSE NEW END;
END;
$$;

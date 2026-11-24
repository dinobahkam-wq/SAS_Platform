import "server-only";
import { createClient } from "@/lib/supabase/server";

export type PublishedBriefingAudio = {
  url: string;
  fileName: string;
  durationSeconds: number;
  editionSlug: string;
  revisionId: string;
};

/** Public audio belongs only to an approved, CURRENT published briefing revision. */
export async function getPublishedBriefingAudio(slug: string): Promise<PublishedBriefingAudio | null> {
  if (!/^[a-z0-9-]{3,180}$/.test(slug)) return null;
  const supabase = await createClient();
  const { data: edition, error: editionError } = await supabase
    .from("briefing_editions")
    .select("id,slug,status,current_revision_id")
    .eq("slug", slug).maybeSingle();
  if (editionError || !edition || !edition.current_revision_id
      || !["active", "archived"].includes(edition.status)) return null;
  const { data: asset, error: audioError } = await supabase.from("briefing_audio_assets")
    .select("object_path,file_name,duration_seconds,revision_id")
    .eq("edition_id", edition.id).eq("revision_id", edition.current_revision_id)
    .eq("status", "published").maybeSingle();
  if (audioError || !asset) return null;
  if (!/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(m4a|mp3)$/i.test(asset.object_path)) return null;
  const { data } = supabase.storage.from("sas-briefing-audio").getPublicUrl(asset.object_path);
  if (!data?.publicUrl) return null;
  return {
    url: data.publicUrl,
    fileName: asset.file_name,
    durationSeconds: asset.duration_seconds,
    editionSlug: slug,
    revisionId: asset.revision_id,
  };
}

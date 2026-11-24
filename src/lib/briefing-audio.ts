import "server-only";
import { createClient } from "@/lib/supabase/server";

export type PublishedBriefingAudio = {
  url: string;
  fileName: string;
  durationSeconds: number;
  editionSlug: string;
  revisionId: string;
};

/** Public audio is read only from the current published revision via an RLS-safe RPC. */
export async function getPublishedBriefingAudio(slug: string): Promise<PublishedBriefingAudio | null> {
  if (!/^[a-z0-9-]{3,180}$/.test(slug)) return null;
  const supabase = await createClient();
  const {data, error} = await supabase.rpc("get_public_briefing_audio", {p_slug:slug});
  if (error || !data || typeof data !== "object" || Array.isArray(data)) return null;
  const row = data as Record<string,unknown>;
  const objectPath = typeof row.object_path === "string" ? row.object_path : "";
  const revisionId = typeof row.revision_id === "string" ? row.revision_id : "";
  const fileName = typeof row.file_name === "string" ? row.file_name : "";
  const durationSeconds = typeof row.duration_seconds === "number" ? row.duration_seconds : 0;
  if (!/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(m4a|mp3)$/i.test(objectPath)
    || !/^[0-9a-f-]{36}$/i.test(revisionId)
    || !fileName || durationSeconds < 15 || durationSeconds > 1800) return null;
  const {data:publicUrl} = supabase.storage.from("sas-briefing-audio").getPublicUrl(objectPath);
  if (!publicUrl?.publicUrl) return null;
  return {url:publicUrl.publicUrl,fileName,durationSeconds,editionSlug:slug,revisionId};
}

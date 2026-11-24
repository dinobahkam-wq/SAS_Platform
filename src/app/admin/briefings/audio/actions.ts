"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

const validSlug = (slug: string) => /^[a-z0-9-]{3,180}$/.test(slug);
const adminHref = (slug: string, status: string) =>
  "/admin/briefings/audio/" + encodeURIComponent(slug) + (status ? "?" + status : "");

async function findCurrentEdition(slug: string) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("briefing_editions")
    .select("id,slug,status,current_revision_id").eq("slug",slug).maybeSingle();
  if (!data || !data.current_revision_id || !["active","archived"].includes(data.status)) return null;
  const { data: revision } = await supabase.from("briefing_revisions")
    .select("id,status").eq("id",data.current_revision_id).maybeSingle();
  if (revision?.status !== "published") return null;
  return data;
}

export async function uploadBriefingAudio(form: FormData) {
  const { supabase, userId } = await requireAdmin();
  const slug = String(form.get("slug") ?? "");
  if (!validSlug(slug)) redirect("/admin/briefings");
  const edition = await findCurrentEdition(slug);
  if (!edition?.current_revision_id) redirect(adminHref(slug,"error=edition"));
  const file = form.get("file");
  const duration = Math.round(Number(form.get("duration_seconds")));
  if (!(file instanceof File) || file.size < 1000 || file.size > 10 * 1024 * 1024
    || !/\.m4a$/i.test(file.name) || !["audio/mp4","audio/x-m4a",""].includes(file.type)
    || !Number.isInteger(duration) || duration < 15 || duration > 1800)
    redirect(adminHref(slug,"error=file"));

  const bytes = new Uint8Array(await file.slice(0,12).arrayBuffer());
  if (String.fromCharCode(...bytes.slice(4,8)) !== "ftyp")
    redirect(adminHref(slug,"error=file"));

  const { data: existing, error: existingError } = await supabase.from("briefing_audio_assets")
    .select("id,status,object_path").eq("edition_id",edition.id)
    .eq("revision_id",edition.current_revision_id).maybeSingle();
  if (existingError) redirect(adminHref(slug,"error=database"));
  if (existing?.status === "published") redirect(adminHref(slug,"error=locked"));

  const path = userId + "/" + crypto.randomUUID() + ".m4a";
  const { error: uploadError } = await supabase.storage.from("sas-briefing-audio")
    .upload(path,file,{contentType:"audio/mp4",cacheControl:"31536000",upsert:false});
  if (uploadError) redirect(adminHref(slug,"error=upload"));

  const { error: recordError } = await supabase.from("briefing_audio_assets").upsert({
    edition_id:edition.id,
    revision_id:edition.current_revision_id,
    object_path:path,
    file_name:file.name.slice(0,220),
    mime_type:"audio/mp4",
    file_size:file.size,
    duration_seconds:duration,
    status:"draft",
    created_by:userId,
    published_at:null,
  },{onConflict:"edition_id,revision_id"});
  if (recordError) {
    await supabase.storage.from("sas-briefing-audio").remove([path]);
    redirect(adminHref(slug,"error=database"));
  }
  if (existing?.object_path && existing.object_path.startsWith(userId + "/")) {
    await supabase.storage.from("sas-briefing-audio").remove([existing.object_path]);
  }
  revalidatePath("/admin/briefings/audio/" + slug);
  redirect(adminHref(slug,"uploaded=1"));
}

export async function publishBriefingAudio(form: FormData) {
  const {supabase} = await requireAdmin();
  const slug=String(form.get("slug")??"");
  if(!validSlug(slug))redirect("/admin/briefings");
  const edition=await findCurrentEdition(slug);
  if(!edition?.current_revision_id)redirect(adminHref(slug,"error=edition"));
  const {data:asset,error:readError}=await supabase.from("briefing_audio_assets")
    .select("id,status").eq("edition_id",edition.id)
    .eq("revision_id",edition.current_revision_id).maybeSingle();
  if(readError||!asset||asset.status!=="draft")redirect(adminHref(slug,"error=record"));
  const {data:published,error}=await supabase.from("briefing_audio_assets")
    .update({status:"published",published_at:new Date().toISOString()})
    .eq("id",asset.id).eq("status","draft").select("id").maybeSingle();
  if(error||!published)redirect(adminHref(slug,"error=publish"));
  revalidatePath("/");
  revalidatePath("/briefings/"+slug);
  revalidatePath("/admin/briefings/audio/"+slug);
  redirect(adminHref(slug,"published=1"));
}

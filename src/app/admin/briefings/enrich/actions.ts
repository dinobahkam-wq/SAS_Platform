"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function safeSlug(slug:string){return /^[a-z0-9-]{3,180}$/.test(slug);}
function adminUrl(slug:string,status:string){
  return "/admin/briefings/enrich/"+encodeURIComponent(slug)+"?"+status;
}
async function assertDraft(supabase:Awaited<ReturnType<typeof requireAdmin>>["supabase"],slug:string,revisionId:string,developmentId?:string) {
  if(!uuid.test(revisionId)||!safeSlug(slug)) return null;
  const {data:r,error}=await supabase.from("briefing_revisions").select("id,status,edition_id").eq("id",revisionId).maybeSingle();
  if(error||!r||r.status!=="draft")return null;
  const {data:e}=await supabase.from("briefing_editions").select("slug").eq("id",r.edition_id).maybeSingle();
  if(e?.slug!==slug)return null;
  if(developmentId){
    if(!uuid.test(developmentId))return null;
    const {data:item}=await supabase.from("briefing_edition_items").select("id")
      .eq("revision_id",revisionId).eq("development_id",developmentId).eq("display_section","developments").maybeSingle();
    if(!item)return null;
  }
  return r;
}

export async function startBriefingPhotoRevision(form:FormData) {
  const {supabase,userId}=await requireAdmin();
  const slug=String(form.get("slug")??"");
  if(!safeSlug(slug))redirect("/admin/briefings");
  const {data:edition}=await supabase.from("briefing_editions")
    .select("id,current_revision_id").eq("slug",slug).maybeSingle();
  if(!edition?.current_revision_id)redirect(adminUrl(slug,"error=record"));
  const {data:existing}=await supabase.from("briefing_revisions")
    .select("id").eq("edition_id",edition.id).eq("status","draft").order("revision_no",{ascending:false}).limit(1);
  if(existing?.[0])redirect(adminUrl(slug,"editing=1"));
  const {data:newId,error}=await supabase.rpc("create_briefing_correction",{
    p_edition_id:edition.id,
    p_change_reason_ar:"إثراء بصري اختياري موثق للعدد، دون تغيير الوقائع أو المصادر النصية.",
  });
  if(error||typeof newId!=="string")redirect(adminUrl(slug,"error=record"));
  const {data:existingImages,error:readError}=await supabase.from("briefing_revision_images")
    .select("development_id,media_asset_id").eq("revision_id",edition.current_revision_id);
  if(readError)redirect(adminUrl(slug,"error=link"));
  if(existingImages?.length){
    const {error:copyError}=await supabase.from("briefing_revision_images").insert(
      existingImages.map(photo=>({revision_id:newId,development_id:photo.development_id,media_asset_id:photo.media_asset_id,created_by:userId}))
    );
    if(copyError)redirect(adminUrl(slug,"error=link"));
  }
  revalidatePath(adminUrl(slug,""));
  redirect(adminUrl(slug,"editing=1"));
}

export async function uploadBriefingPhoto(form:FormData) {
  const {supabase,userId}=await requireAdmin();
  const slug=String(form.get("slug")??"");
  const revisionId=String(form.get("revision_id")??"");
  const developmentId=String(form.get("development_id")??"");
  if(!await assertDraft(supabase,slug,revisionId,developmentId))redirect(adminUrl(slug,"error=draft"));
  const file=form.get("file");
  const alt=String(form.get("alt_text")??"").trim().slice(0,300);
  const caption=String(form.get("caption")??"").trim().slice(0,600);
  const credit=String(form.get("credit")??"").trim().slice(0,200);
  const basis=String(form.get("rights_basis")??"");
  const source=String(form.get("original_source_url")??"").trim().slice(0,1200);
  const originalName=String(form.get("original_file_name")??"").slice(0,160);
  if(!(file instanceof File)||file.size<1||file.size>10*1024*1024||file.type!=="image/webp")
    redirect(adminUrl(slug,"error=file"));
  const header=new Uint8Array(await file.slice(0,12).arrayBuffer());
  if(String.fromCharCode(...header.slice(0,4))!=="RIFF"||String.fromCharCode(...header.slice(8,12))!=="WEBP")
    redirect(adminUrl(slug,"error=file"));
  if(basis && !["owned","permission","public_domain","cc_by"].includes(basis))
    redirect(adminUrl(slug,"error=rights"));
  if(source){
    try{if(new URL(source).protocol!=="https:")throw Error("source")}
    catch{redirect(adminUrl(slug,"error=rights"))}
  }
  const width=Number(form.get("width")),height=Number(form.get("height"));
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>2560||height>2560)
    redirect(adminUrl(slug,"error=file"));
  const objectPath=userId+"/"+crypto.randomUUID()+".webp";
  const {error:uploadError}=await supabase.storage.from("sas-public-media").upload(objectPath,file,{
    contentType:"image/webp",upsert:false,cacheControl:"31536000"
  });
  if(uploadError)redirect(adminUrl(slug,"error=upload"));
  const {data:asset,error:metadataError}=await supabase.from("media_assets").insert({
    bucket_id:"sas-public-media",object_path:objectPath,file_name:file.name,
    original_file_name:originalName||file.name,mime_type:"image/webp",
    file_size:file.size,width,height,alt_text:alt||null,caption:caption||null,credit:credit||null,
    rights_basis:basis||null,original_source_url:source||null,uploaded_by:userId
  }).select("id").single();
  if(metadataError||!asset){
    await supabase.storage.from("sas-public-media").remove([objectPath]);
    redirect(adminUrl(slug,"error=metadata"));
  }
  const {error:linkError}=await supabase.from("briefing_revision_images").upsert({
    revision_id:revisionId,development_id:developmentId,media_asset_id:asset.id,created_by:userId
  },{onConflict:"revision_id,development_id"});
  if(linkError){
    await supabase.from("media_assets").delete().eq("id",asset.id);
    await supabase.storage.from("sas-public-media").remove([objectPath]);
    redirect(adminUrl(slug,"error=link"));
  }
  revalidatePath(adminUrl(slug,""));
  redirect(adminUrl(slug,"added=1")+"#development-"+developmentId);
}

export async function removeBriefingPhoto(form:FormData) {
  const {supabase}=await requireAdmin();
  const slug=String(form.get("slug")??"");
  const revisionId=String(form.get("revision_id")??"");
  const developmentId=String(form.get("development_id")??"");
  if(!await assertDraft(supabase,slug,revisionId,developmentId))redirect(adminUrl(slug,"error=draft"));
  const {error}=await supabase.from("briefing_revision_images").delete()
    .eq("revision_id",revisionId).eq("development_id",developmentId);
  if(error)redirect(adminUrl(slug,"error=link"));
  revalidatePath(adminUrl(slug,""));
  redirect(adminUrl(slug,"removed=1")+"#development-"+developmentId);
}

export async function publishBriefingPhotoRevision(form:FormData) {
  const {supabase}=await requireAdmin();
  const slug=String(form.get("slug")??"");
  const revisionId=String(form.get("revision_id")??"");
  if(!await assertDraft(supabase,slug,revisionId))redirect(adminUrl(slug,"error=draft"));
  const {error:e1}=await supabase.rpc("submit_briefing_revision",{p_revision_id:revisionId});
  if(e1)redirect(adminUrl(slug,"error=publish"));
  const {error:e2}=await supabase.rpc("approve_briefing_revision",{
    p_revision_id:revisionId,p_note_ar:"اعتماد إضافة الصور دون تغيير المحتوى النصي؛ بيانات المصدر والحقوق بحسب المتاح."
  });
  if(e2)redirect(adminUrl(slug,"error=publish"));
  const {error:e3}=await supabase.rpc("publish_briefing_revision",{p_revision_id:revisionId});
  if(e3)redirect(adminUrl(slug,"error=publish"));
  revalidatePath("/briefings/"+slug);
  revalidatePath("/admin/briefings");
  redirect(adminUrl(slug,"published=1"));
}


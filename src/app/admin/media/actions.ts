"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

const allowedTypes = ["image/webp"];
const maxSize = 10 * 1024 * 1024;

export async function uploadMedia(formData: FormData) {
  const { supabase, userId } = await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size <= 0 || file.size > maxSize || !allowedTypes.includes(file.type)) {
    redirect("/admin/media?error=file");
  }

  const width = Number(formData.get("width") ?? 0) || null;
  const height = Number(formData.get("height") ?? 0) || null;
  const altText = String(formData.get("alt_text") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  const credit = String(formData.get("credit") ?? "").trim();
  const rightsBasis=String(formData.get("rights_basis")??"");
  const sourceUrl=String(formData.get("original_source_url")??"").trim();
  const originalName=String(formData.get("original_file_name")??file.name).slice(0,160);
  if(!["owned","permission","public_domain","cc_by"].includes(rightsBasis)
    || !altText || !credit || (rightsBasis!=="owned"&&!sourceUrl))
    redirect("/admin/media?error=rights");
  if(sourceUrl){
    try{if(new URL(sourceUrl).protocol!=="https:") throw Error("protocol")}
    catch{redirect("/admin/media?error=rights")}
  }
  const header=new Uint8Array(await file.slice(0,12).arrayBuffer());
  const riff=String.fromCharCode(...header.slice(0,4));
  const webp=String.fromCharCode(...header.slice(8,12));
  if(riff!=="RIFF"||webp!=="WEBP") redirect("/admin/media?error=file");
  const safeName = file.name.normalize("NFKC").replace(/[^\p{L}\p{N}._-]+/gu, "-").slice(-100);
  const objectPath = `${userId}/${crypto.randomUUID()}-${safeName || "image"}`;

  const { error: uploadError } = await supabase.storage
    .from("sas-public-media")
    .upload(objectPath, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) redirect("/admin/media?error=upload");

  const { error: insertError } = await supabase.from("media_assets").insert({
    bucket_id: "sas-public-media",
    object_path: objectPath,
    file_name: file.name,
    mime_type: file.type,
    file_size: file.size,
    width,
    height,
    alt_text: altText || null,
    caption: caption || null,
    credit,
    rights_basis:rightsBasis,
    original_source_url:sourceUrl || null,
    original_file_name:originalName,
    uploaded_by: userId,
  });

  if (insertError) {
    await supabase.storage.from("sas-public-media").remove([objectPath]);
    redirect("/admin/media?error=metadata");
  }

  revalidatePath("/admin/media");
  redirect("/admin/media?uploaded=1");
}

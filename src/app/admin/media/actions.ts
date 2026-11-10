"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
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
    credit: credit || null,
    uploaded_by: userId,
  });

  if (insertError) {
    await supabase.storage.from("sas-public-media").remove([objectPath]);
    redirect("/admin/media?error=metadata");
  }

  revalidatePath("/admin/media");
  redirect("/admin/media?uploaded=1");
}

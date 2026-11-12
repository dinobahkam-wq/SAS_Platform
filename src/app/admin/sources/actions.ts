"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

const sourceTypes = [
  "official_statement",
  "official_document",
  "news_agency",
  "media_organization",
  "sas_correspondent",
  "field_observation",
  "interview",
  "other",
];

export async function createSource(formData: FormData) {
  const { supabase, userId } = await requireAdmin();
  const sourceName = String(formData.get("source_name") ?? "").trim();
  const sourceType = String(formData.get("source_type") ?? "");
  const organization = String(formData.get("organization_name") ?? "").trim();
  const url = String(formData.get("source_url") ?? "").trim();
  const reference = String(formData.get("source_reference") ?? "").trim();
  const note = String(formData.get("attribution_note") ?? "").trim();
  const publicationDate = String(formData.get("publication_date") ?? "").trim();

  if (!sourceName || !sourceTypes.includes(sourceType)) redirect("/admin/sources?error=validation");
  if (url && !/^https?:\/\//i.test(url)) redirect("/admin/sources?error=url");

  const { error } = await supabase.from("content_sources").insert({
    source_name: sourceName,
    source_type: sourceType,
    organization_name: organization || null,
    source_url: url || null,
    source_reference: reference || null,
    attribution_note: note || null,
    publication_date: publicationDate || null,
    created_by: userId,
  });

  if (error) redirect("/admin/sources?error=save");
  revalidatePath("/admin/sources");
  revalidatePath("/admin/content/new");
  redirect("/admin/sources?created=1");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { formats, slugify, textToBody } from "@/lib/content";
import type { Json } from "@/types/database.types";

const allowedSections = ["news", "analysis", "research", "media"] as const;
const allowedBlockTypes = ["paragraph", "heading", "subheading", "quote", "list"] as const;

function readStructuredBody(formData: FormData): Json {
  const raw = String(formData.get("body_json") ?? "").trim();
  if (!raw) {
    const legacyText = String(formData.get("body") ?? "").trim();
    if (legacyText) return textToBody(legacyText);
    throw new Error("أدخل متن المادة قبل الحفظ.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("بنية متن المادة غير صالحة.");
  }
  if (!parsed || typeof parsed !== "object" || !("blocks" in parsed) || !Array.isArray(parsed.blocks)) {
    throw new Error("بنية متن المادة غير صالحة.");
  }
  if (parsed.blocks.length > 250) throw new Error("تجاوزت المادة الحد الأقصى للعناصر التحريرية.");

  const blocks: Array<Record<string, Json>> = [];
  for (const candidate of parsed.blocks as unknown[]) {
    if (!candidate || typeof candidate !== "object" || !("type" in candidate)) continue;
    const type = String(candidate.type);
    if (!allowedBlockTypes.includes(type as (typeof allowedBlockTypes)[number])) {
      throw new Error("نوع عنصر تحريري غير مسموح.");
    }
    if (type === "list") {
      const rawItems: unknown[] = "items" in candidate && Array.isArray(candidate.items) ? candidate.items : [];
      const items = rawItems.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, 50);
      if (items.length) blocks.push({ type, items });
      continue;
    }
    const text = "text" in candidate && typeof candidate.text === "string" ? candidate.text.trim() : "";
    if (text) blocks.push({ type, text: text.slice(0, 20000) });
  }

  if (!blocks.length) throw new Error("أدخل فقرة واحدة على الأقل في متن المادة.");
  return { version: 1, blocks } as Json;
}

function readContent(formData: FormData) {
  const section = String(formData.get("section") ?? "");
  const format = String(formData.get("format") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const categoryValue = String(formData.get("category_id") ?? "").trim();
  const coverAssetValue = String(formData.get("cover_asset_id") ?? "").trim();
  const statusValue = String(formData.get("status") ?? "draft");
  const isFeatured = formData.get("is_featured") === "on";
  const sourceIds = [...new Set(formData.getAll("source_ids").map(String).filter(Boolean))];

  if (!allowedSections.includes(section as (typeof allowedSections)[number])) throw new Error("اختر قسمًا صحيحًا للمحتوى.");
  if (!formats.some((item) => item.value === format && item.section === section)) throw new Error("نوع المحتوى لا يتوافق مع القسم المحدد.");
  if (!title) throw new Error("عنوان المحتوى مطلوب.");
  if (coverAssetValue && !/^[0-9a-f-]{36}$/i.test(coverAssetValue)) throw new Error("الصورة الرئيسية غير صالحة.");
  if (![ "draft", "published", "archived" ].includes(statusValue)) throw new Error("حالة النشر غير صحيحة.");

  if (section === "news" && statusValue === "published" && sourceIds.length === 0) {
    throw new Error("يجب ربط مصدر واحد على الأقل قبل نشر الخبر.");
  }

  const slug = slugify(slugInput || title);
  if (!slug) throw new Error("تعذر إنشاء رابط صالح للمحتوى.");

  return {
    section, format, title, slug,
    excerpt: excerpt || null,
    body: readStructuredBody(formData),
    category_id: categoryValue || null,
    cover_asset_id: coverAssetValue || null,
    status: statusValue,
    is_featured: isFeatured,
    sourceIds,
  };
}

async function linkRelations(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  contentId: string,
  userId: string,
  sourceIds: string[],
) {
  const { data: author } = await supabase.from("authors").select("id").eq("auth_user_id", userId).maybeSingle();
  if (author) {
    const { error } = await supabase.from("content_authors").upsert(
      { content_id: contentId, author_id: author.id, author_order: 0 },
      { onConflict: "content_id,author_id", ignoreDuplicates: true },
    );
    if (error) throw new Error("تعذر ربط المؤلف بالمحتوى.");
  }

  const { data: existingLinks, error: linksError } = await supabase
    .from("content_source_links").select("source_id").eq("content_id", contentId);
  if (linksError) throw new Error("تعذر قراءة مصادر المادة.");

  if (sourceIds.length) {
    const rows = sourceIds.map((source_id, index) => ({
      content_id: contentId, source_id,
      source_role: index === 0 ? "primary" : "supporting",
      display_order: index,
    }));
    const { error } = await supabase.from("content_source_links").upsert(rows, {
      onConflict: "content_id,source_id",
    });
    if (error) throw new Error("تعذر ربط المصادر بالمحتوى. تحقق من المصادر المحددة.");
  }

  const keep = new Set(sourceIds);
  const removeIds = (existingLinks ?? []).map((link) => link.source_id).filter((sourceId) => !keep.has(sourceId));
  if (removeIds.length) {
    const { error } = await supabase.from("content_source_links").delete().eq("content_id", contentId).in("source_id", removeIds);
    if (error) throw new Error("تعذر تحديث روابط المصادر.");
  }
}

export async function createContent(formData: FormData) {
  const { supabase, userId } = await requireAdmin();
  let values: ReturnType<typeof readContent>;
  try { values = readContent(formData); } catch { redirect("/admin/content/new?error=validation"); }

  const requestedStatus = values.status;
  const { data: item, error } = await supabase.from("content_items").insert({
    section: values.section, format: values.format, title: values.title, slug: values.slug,
    excerpt: values.excerpt, body: values.body, category_id: values.category_id,
    cover_asset_id: values.cover_asset_id, status: "draft", is_featured: values.is_featured,
    created_by: userId, updated_by: userId,
  }).select("id").single();
  if (error || !item) redirect("/admin/content/new?error=save");

  try { await linkRelations(supabase, item.id, userId, values.sourceIds); }
  catch { redirect(`/admin/content/${item.id}?error=relations`); }

  if (requestedStatus !== "draft") {
    const { error: publishError } = await supabase.from("content_items")
      .update({ status: requestedStatus, updated_by: userId }).eq("id", item.id);
    if (publishError) redirect(`/admin/content/${item.id}?error=publish`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/content");
  revalidatePath("/");
  revalidatePath("/" + values.section);
  revalidatePath("/content/" + values.slug);
  redirect("/admin/content?created=1");
}

export async function updateContent(formData: FormData) {
  const { supabase, userId } = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect("/admin/content?error=invalid-id");

  let values: ReturnType<typeof readContent>;
  try { values = readContent(formData); } catch { redirect(`/admin/content/${id}?error=validation`); }

  const { data: current } = await supabase.from("content_items").select("status, section").eq("id", id).maybeSingle();
  if (!current) redirect("/admin/content?error=not-found");

  if (current.status === "published" && (values.status !== "published" || (current.section === "news" && values.section !== "news"))) {
    const { error: statusError } = await supabase.from("content_items")
      .update({ status: "draft", updated_by: userId }).eq("id", id);
    if (statusError) redirect(`/admin/content/${id}?error=save`);
  }

  try { await linkRelations(supabase, id, userId, values.sourceIds); }
  catch { redirect(`/admin/content/${id}?error=relations`); }

  const { error } = await supabase.from("content_items").update({
    section: values.section, format: values.format, title: values.title, slug: values.slug,
    excerpt: values.excerpt, body: values.body, category_id: values.category_id,
    cover_asset_id: values.cover_asset_id, status: values.status,
    is_featured: values.is_featured, updated_by: userId,
  }).eq("id", id);
  if (error) redirect(`/admin/content/${id}?error=save`);

  revalidatePath("/admin");
  revalidatePath("/admin/content");
  revalidatePath(`/admin/content/${id}`);
  revalidatePath("/");
  revalidatePath("/" + values.section);
  revalidatePath("/content/" + values.slug);
  redirect("/admin/content?saved=1");
}

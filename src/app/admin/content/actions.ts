"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { formats, slugify, textToBody } from "@/lib/content";

const allowedSections = ["news", "analysis", "research", "media"] as const;

function readContent(formData: FormData) {
  const section = String(formData.get("section") ?? "");
  const format = String(formData.get("format") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const bodyText = String(formData.get("body") ?? "").trim();
  const categoryValue = String(formData.get("category_id") ?? "").trim();
  const statusValue = String(formData.get("status") ?? "draft");
  const isFeatured = formData.get("is_featured") === "on";
  const sourceIds = [...new Set(formData.getAll("source_ids").map(String).filter(Boolean))];

  if (!allowedSections.includes(section as (typeof allowedSections)[number])) {
    throw new Error("اختر قسمًا صحيحًا للمحتوى.");
  }
  if (!formats.some((item) => item.value === format && item.section === section)) {
    throw new Error("نوع المحتوى لا يتوافق مع القسم المحدد.");
  }
  if (!title) throw new Error("عنوان المحتوى مطلوب.");
  if (!bodyText) throw new Error("أدخل متن المحتوى قبل الحفظ.");
  if (!["draft", "published", "archived"].includes(statusValue)) {
    throw new Error("حالة النشر غير صحيحة.");
  }

  const slug = slugify(slugInput || title);
  if (!slug) throw new Error("تعذر إنشاء رابط صالح للمحتوى.");

  return {
    section,
    format,
    title,
    slug,
    excerpt: excerpt || null,
    body: textToBody(bodyText),
    category_id: categoryValue || null,
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
  const { data: author } = await supabase
    .from("authors")
    .select("id")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (author) {
    const { error } = await supabase.from("content_authors").upsert(
      { content_id: contentId, author_id: author.id, author_order: 0 },
      { onConflict: "content_id,author_id", ignoreDuplicates: true },
    );
    if (error) throw new Error("تعذر ربط المؤلف بالمحتوى.");
  }

  if (sourceIds.length) {
    const rows = sourceIds.map((source_id, index) => ({
      content_id: contentId,
      source_id,
      source_role: index === 0 ? "primary" : "supporting",
      display_order: index,
    }));
    const { error } = await supabase.from("content_source_links").upsert(rows, {
      onConflict: "content_id,source_id",
      ignoreDuplicates: true,
    });
    if (error) throw new Error("تعذر ربط المصادر بالمحتوى. تحقق من المصادر المحددة.");
  }
}

export async function createContent(formData: FormData) {
  const { supabase, userId } = await requireAdmin();
  let values: ReturnType<typeof readContent>;

  try {
    values = readContent(formData);
  } catch (error) {
    redirect("/admin/content/new?error=validation");
  }

  const requestedStatus = values.status;
  const { data: item, error } = await supabase
    .from("content_items")
    .insert({
      section: values.section,
      format: values.format,
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt,
      body: values.body,
      category_id: values.category_id,
      status: "draft",
      is_featured: values.is_featured,
      created_by: userId,
      updated_by: userId,
    })
    .select("id")
    .single();

  if (error || !item) redirect("/admin/content/new?error=save");

  try {
    await linkRelations(supabase, item.id, userId, values.sourceIds);
  } catch {
    redirect(`/admin/content/${item.id}?error=relations`);
  }

  if (requestedStatus !== "draft") {
    const { error: publishError } = await supabase
      .from("content_items")
      .update({ status: requestedStatus, updated_by: userId })
      .eq("id", item.id);

    if (publishError) redirect(`/admin/content/${item.id}?error=publish`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/content");
  redirect("/admin/content?created=1");
}

export async function updateContent(formData: FormData) {
  const { supabase, userId } = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect("/admin/content?error=invalid-id");

  let values: ReturnType<typeof readContent>;
  try {
    values = readContent(formData);
  } catch {
    redirect(`/admin/content/${id}?error=validation`);
  }

  try {
    await linkRelations(supabase, id, userId, values.sourceIds);
  } catch {
    redirect(`/admin/content/${id}?error=relations`);
  }

  const { error } = await supabase
    .from("content_items")
    .update({
      section: values.section,
      format: values.format,
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt,
      body: values.body,
      category_id: values.category_id,
      status: values.status,
      is_featured: values.is_featured,
      updated_by: userId,
    })
    .eq("id", id);

  if (error) redirect(`/admin/content/${id}?error=save`);

  revalidatePath("/admin");
  revalidatePath("/admin/content");
  revalidatePath(`/admin/content/${id}`);
  redirect("/admin/content?saved=1");
}

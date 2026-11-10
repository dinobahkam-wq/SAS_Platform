import { notFound } from "next/navigation";
import { ContentForm } from "@/components/content-form";
import { updateContent } from "../actions";
import { requireAdmin } from "@/lib/admin";
import { bodyToText } from "@/lib/content";

export default async function EditContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const search = await searchParams;
  const { supabase } = await requireAdmin();

  const [{ data: item, error }, { data: categories }, { data: sources }, { data: links }] = await Promise.all([
    supabase.from("content_items").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("display_order"),
    supabase.from("content_sources").select("*").order("source_name"),
    supabase.from("content_source_links").select("source_id").eq("content_id", id),
  ]);

  if (error || !item) notFound();

  return (
    <>
      <div className="page-heading">
        <div><span className="eyebrow">غرفة التحرير / تحرير</span><h1>تحرير المادة</h1><p>راجع البيانات والمصادر وحالة النشر قبل الحفظ.</p></div>
        <span className={`pill ${item.status === "published" ? "pill-green" : "pill-gold"}`}>{item.status === "published" ? "منشور" : item.status === "archived" ? "مؤرشف" : "مسودة"}</span>
      </div>
      <ContentForm
        action={updateContent}
        categories={categories ?? []}
        sources={sources ?? []}
        selectedSourceIds={(links ?? []).map((link) => link.source_id)}
        initial={{
          id: item.id,
          section: item.section,
          format: item.format,
          title: item.title,
          slug: item.slug,
          excerpt: item.excerpt ?? "",
          body: bodyToText(item.body),
          status: item.status,
          category_id: item.category_id ?? "",
          is_featured: item.is_featured,
        }}
        error={search.error ? "تعذر الحفظ. تحقق من الحقول والمصادر، وتأكد من إسناد مصدر واحد على الأقل عند نشر الخبر." : undefined}
      />
    </>
  );
}

import { ContentForm } from "@/components/content-form";
import { createContent } from "../actions";
import { requireAdmin } from "@/lib/admin";

export default async function NewContentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ data: categories }, { data: sources }, { data: mediaAssets }] = await Promise.all([
    supabase.from("categories").select("*").eq("is_active", true).order("display_order"),
    supabase.from("content_sources").select("*").eq("is_active", true).order("source_name"),
    supabase.from("media_assets").select("id,file_name,alt_text,caption,mime_type").order("created_at", { ascending: false }).limit(100),
  ]);

  return (
    <>
      <div className="page-heading">
        <div><span className="eyebrow">غرفة التحرير / إنشاء</span><h1>مادة تحريرية جديدة</h1><p>أنشئ مادة، وحدد قسمها، وأضف المصادر قبل النشر.</p></div>
      </div>
      <ContentForm
        action={createContent}
        categories={categories ?? []}
        sources={sources ?? []}
        mediaAssets={mediaAssets ?? []}
        error={params.error ? "تحقق من العنوان والقسم والنوع ومتن المادة، ثم أعد المحاولة." : undefined}
      />
    </>
  );
}

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
    supabase.from("media_assets").select("*").order("created_at", { ascending: false }).limit(100),
  ]);

  const assetsWithUrls = (mediaAssets ?? []).map((asset) => ({
    ...asset,
    publicUrl: supabase.storage.from(asset.bucket_id).getPublicUrl(asset.object_path).data.publicUrl,
  }));

  const errors: Record<string, string> = {
    validation: "تحقق من العنوان والقسم والنوع ومتن المادة، وأضف مصدرًا واحدًا على الأقل عند نشر الخبر.",
    save: "تعذر حفظ المادة. تحقق من عدم تكرار الرابط المختصر.",
  };

  return (
    <>
      <div className="page-heading">
        <div><span className="eyebrow">غرفة التحرير / إنشاء</span><h1>مادة تحريرية جديدة</h1><p>أنشئ مادة، وحدد قسمها وصورتها، وأضف اٶ��q�^
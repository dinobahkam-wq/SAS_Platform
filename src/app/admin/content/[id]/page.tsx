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

  const [{ data: item, error }, { data: categories }, { data: sources }, { data: links }, { data: mediaAssets }] = await Promise.all([
    supabase.from("content_items").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("display_order"),
    supabase.from("content_sources").select("*").order("source_name"),
    supabase.from("content_source_links").select("source_id").eq("content_id", id),
    supabase.from("media_assets").select("*").order("created_at", { ascending: false }).limit(100),
  ]);

  if (error || !item) notFound();

  const assetsWithUrls = (mediaAssets ?? []).map((asset) => ({
    ...asset,
    publicUrl: supabase.storage.from(asset.bucket_id).getPublicUrl(asset.object_path).data.publicUrl,
  }));

  const errors: Record<string, string> = {
    validation: "تحقق من الحقول والتصنيف والصورة والمصادر. الخبر المنشور يحتاج إلى مصدر واحد على الأقل.",
    re���q�^
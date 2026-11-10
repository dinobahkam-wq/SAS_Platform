import type { Database } from "@/types/database.types";
import { formats, sections } from "@/lib/content";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type Source = Database["public"]["Tables"]["content_sources"]["Row"];
type MediaAsset = Database["public"]["Tables"]["media_assets"]["Row"] & { publicUrl: string };

type ContentInitial = {
  id?: string;
  section: string;
  format: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: string;
  category_id: string;
  cover_asset_id: string;
  is_featured: boolean;
};

export function ContentForm({
  action,
  categories,
  sources,
  mediaAssets,
  initial,
  selectedSourceIds = [],
  error,
}: {
  action: (formData: FormData) => void | Promise<void>;
  categories: Category[];
  sources: Source[];
  mediaAssets: MediaAsset[];
  initial?: ContentInitial;
  selectedSourceIds?: string[];
  error?: string;
}) {
  const selectedCover = mediaAssets.find((asset) => asset.id === initial?.cover_asset_id);

  return (
    <form action={action} className="panel">
      <div className="panel-header">
        <h2>{initial ? "بيانات المحتوى" : "بيانات المادة الجديدة"}</h2>
        <span className="pill">جميع الأقسام</span>
      </div>
      <div className="panel-body">
        {error ? <div className="notice notice-error">{error}</div> : null}
        {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
        <div cl���q�^
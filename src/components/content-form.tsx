import type { Database } from "@/types/database.types";
import { formats, sections } from "@/lib/content";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type Source = Database["public"]["Tables"]["content_sources"]["Row"];
type MediaAsset = Pick<Database["public"]["Tables"]["media_assets"]["Row"], "id" | "file_name" | "alt_text" | "caption" | "mime_type">;

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
  is_featured: boolean;
  cover_asset_id: string;
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
  return (
    <form action={action} className="panel">
      <div className="panel-header">
        <h2>{initial ? "بيانات المحتوى" : "بيانات المادة الجديدة"}</h2>
        <span className="pill">جميع الأقسام</span>
      </div>
      <div className="panel-body">
        {error ? <div className="notice notice-error">{error}</div> : null}
        {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
        <div className="form-grid">
          <label className="field">
            <span>القسم التحريري</span>
            <select name="section" defaultValue={initial?.section ?? "news"} required>
              {sections.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label className="field">
            <span>نوع المادة</span>
            <select name="format" defaultValue={initial?.format ?? "news_brief"} required>
              {formats.map((item) => <option key={`${item.section}-${item.value}`} value={item.value}>{item.label} — {sections.find((s) => s.value === item.section)?.label}</option>)}
            </select>
          </label>
          <label className="field field-full">
            <span>عنوان المادة</span>
            <input name="title" defaultValue={initial?.title ?? ""} placeholder="اكتب عنوانًا واضحًا ودقيقًا" required maxLength={240} />
          </label>
          <label className="field">
            <span>الرابط المختصر (Slug)</span>
            <input name="slug" defaultValue={initial?.slug ?? ""} placeholder="يُنشأ تلقائيًا من العنوان عند تركه فارغًا" dir="ltr" />
          </label>
          <label className="field">
            <span>التصنيف</span>
            <select name="category_id" defaultValue={initial?.category_id ?? ""}>
              <option value="">بدون تصنيف</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label className="field field-full">
            <span>الصورة الرئيسية</span>
            <select name="cover_asset_id" defaultValue={initial?.cover_asset_id ?? ""}>
              <option value="">بدون صورة رئيسية</option>
              {mediaAssets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.file_name}{asset.alt_text ? " — " + asset.alt_text : ""}
                </option>
              ))}
            </select>
            <small className="helper-text">اختر صورة من مكتبة الوسائط لتظهر في بطاقة المادة وصفحتها. لا تُعرض الملفات غير المرتبطة بمادة منشورة للعامة.</small>
          </label>
          <label className="field field-full">
            <span>الموجز / المقدمة</span>
            <textarea name="excerpt" defaultValue={initial?.excerpt ?? ""} rows={3} placeholder="ملخص قصير يظهر في بطاقات المحتوى..." />
          </label>
          <label className="field field-full">
            <span>متن المادة</span>
            <textarea name="body" defaultValue={initial?.body ?? ""} rows={14} placeholder="اكتب النص. افصل بين الفقرات بسطر فارغ." required />
            <small className="helper-text">يُحفظ النص حاليًا في بنية فقرات منظمة داخل JSONB. سنضيف محررًا بصريًا متقدمًا في مرحلة لاحقة.</small>
          </label>
          <div className="field field-full">
            <span>المصادر المرتبطة</span>
            {sources.length ? (
              <div className="source-option-list">
                {sources.map((source) => (
                  <label className="source-option" key={source.id}>
                    <input type="checkbox" name="source_ids" value={source.id} defaultChecked={selectedSourceIds.includes(source.id)} />
                    <span><strong>{source.source_name}</strong>{source.organization_name ? ` — ${source.organization_name}` : ""}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="helper-text">لا توجد مصادر مسجلة بعد. أضف مصدرًا من قسم «المصادر» ثم ارجع لربطه بالمادة.</p>
            )}
          </div>
          <label className="field">
            <span>حالة المادة</span>
            <select name="status" defaultValue={initial?.status ?? "draft"}>
              <option value="draft">مسودة</option>
              <option value="published">منشور</option>
              <option value="archived">مؤرشف</option>
            </select>
          </label>
          <div className="field">
            <span>خيارات العرض</span>
            <label className="check-row">
              <input type="checkbox" name="is_featured" defaultChecked={initial?.is_featured ?? false} />
              إبراز المادة في الواجهة
            </label>
          </div>
        </div>
        <div className="form-actions">
          <button className="button button-primary" type="submit">{initial ? "حفظ التعديلات" : "إنشاء المادة"}</button>
          <a className="button button-secondary" href="/admin/content">إلغاء</a>
        </div>
      </div>
    </form>
  );
}

import { createCategory } from "./actions";
import { requireAdmin } from "@/lib/admin";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <>
      <div className="page-heading">
        <div><span className="eyebrow">تنظيم المحتوى</span><h1>التصنيفات</h1><p>تصنيفات تحريرية مشتركة يمكن استخدامها في جميع أقسام المنصة.</p></div>
      </div>
      {params.created ? <div className="notice notice-success">تم إنشاء التصنيف.</div> : null}
      {params.error ? <div className="notice notice-error">تعذر إنشاء التصنيف. تحقق من الاسم والرابط المختصر وعدم تكرارهما.</div> : null}

      <div className="admin-grid">
        <section className="panel">
          <div className="panel-header"><h2>التصنيفات المسجلة</h2><span className="pill">{categories?.length ?? 0} تصنيف</span></div>
          {error ? <div className="empty-state">تعذر تحميل التصنيفات.</div> : categories?.length ? (
            <div className="table-wrap"><table className="data-table">
              <thead><tr><th>التصنيف</th><th>الرابط</th><th>الترتيب</th><th>الحالة</th></tr></thead>
              <tbody>{categories.map((category) => <tr key={category.id}>
                <td><span className="table-title">{category.name}</span><div className="table-subtitle">{category.description ?? ""}</div></td>
                <td dir="ltr">{category.slug}</td><td>{category.display_order}</td>
                <td><span className={category.is_active ? "pill pill-green" : "pill"}>{category.is_active ? "نشط" : "متوقف"}</span></td>
              </tr>)}</tbody>
            </table></div>
          ) : <div className="empty-state">لا توجد تصنيفات بعد.</div>}
        </section>

        <section className="panel">
          <div className="panel-header"><h2>إضافة تصنيف</h2></div>
          <div className="panel-body">
            <form action={createCategory} className="form-stack">
              <label className="field"><span>اسم التصنيف</span><input name="name" required placeholder="مثال: الشؤون اليمنية" /></label>
              <label className="field"><span>الرابط المختصر</span><input name="slug" dir="ltr" placeholder="يُنشأ من الاسم تلقائيًا" /></label>
              <label className="field"><span>الوصف</span><textarea name="description" rows={4} /></label>
              <label className="field"><span>ترتيب العرض</span><input name="display_order" type="number" defaultValue="0" /></label>
              <button className="button button-primary" type="submit">حفظ التصنيف</button>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}

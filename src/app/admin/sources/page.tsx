import { createSource } from "./actions";
import { requireAdmin } from "@/lib/admin";

const sourceTypes = [
  ["official_statement", "بيان رسمي"],
  ["official_document", "وثيقة رسمية"],
  ["news_agency", "وكالة أنباء"],
  ["media_organization", "مؤسسة إعلامية"],
  ["sas_correspondent", "مراسل ساس"],
  ["field_observation", "رصد ميداني"],
  ["interview", "مقابلة"],
  ["other", "أخرى"],
];

export default async function SourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: sources, error } = await supabase
    .from("content_sources")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <>
      <div className="page-heading">
        <div><span className="eyebrow">إدارة المعرفة التحريرية</span><h1>مصادر المعلومات</h1><p>سجل المصادر والوثائق التي تستند إليها المواد المنشورة في ساس.</p></div>
      </div>
      {params.created ? <div className="notice notice-success">تم تسجيل المصدر.</div> : null}
      {params.error ? <div className="notice notice-error">تعذر تسجيل المصدر. راجع الحقول والرابط ثم أعد المحاولة.</div> : null}

      <div className="admin-grid">
        <section className="panel">
          <div className="panel-header"><h2>سجل المصادر</h2><span className="pill">{sources?.length ?? 0} مصدر</span></div>
          {error ? <div className="empty-state">تعذر تحميل المصادر.</div> : sources?.length ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>المصدر</th><th>النوع</th><th>تاريخ النشر</th><th>الرابط</th></tr></thead>
                <tbody>{sources.map((source) => (
                  <tr key={source.id}>
                    <td><div className="table-title">{source.source_name}</div><div className="table-subtitle">{source.organization_name ?? "—"}</div></td>
                    <td>{sourceTypes.find(([value]) => value === source.source_type)?.[1] ?? source.source_type}</td>
                    <td dir="ltr">{source.publication_date ?? "—"}</td>
                    <td>{source.source_url ? <a href={source.source_url} target="_blank" rel="noreferrer" className="table-title">فتح ↗</a> : "—"}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : <div className="empty-state">لم تُسجل مصادر بعد.</div>}
        </section>

        <section className="panel">
          <div className="panel-header"><h2>إضافة مصدر</h2></div>
          <div className="panel-body">
            <form action={createSource} className="form-stack">
              <label className="field"><span>اسم المصدر</span><input name="source_name" required placeholder="مثال: وكالة الأنباء اليمنية" /></label>
              <label className="field"><span>تصنيف المصدر</span><select name="source_type" defaultValue="news_agency">{sourceTypes.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label className="field"><span>الجهة / المؤسسة</span><input name="organization_name" placeholder="اسم المؤسسة أو الجهة" /></label>
              <label className="field"><span>الرابط الإلكتروني</span><input name="source_url" type="url" dir="ltr" placeholder="https://" /></label>
              <label className="field"><span>رقم الوثيقة / مرجع</span><input name="source_reference" dir="ltr" /></label>
              <label className="field"><span>تاريخ النشر</span><input name="publication_date" type="date" dir="ltr" /></label>
              <label className="field"><span>ملاحظة الإسناد</span><textarea name="attribution_note" rows={3} /></label>
              <button className="button button-primary" type="submit">حفظ المصدر</button>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}

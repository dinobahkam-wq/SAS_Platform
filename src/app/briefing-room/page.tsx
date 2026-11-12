import Link from "next/link";
import { requireBriefingStaff } from "@/lib/briefing-auth";

const statusLabels: Record<string, string> = {
  draft: "مسودة",
  in_review: "قيد المراجعة",
  approved: "معتمد",
  published: "منشور",
};

export default async function BriefingRoomPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireBriefingStaff();
  const { data: editions, error } = await supabase
    .from("briefing_editions")
    .select("id,edition_no,slug,edition_date,edition_type,status,current_revision_id,updated_at")
    .order("edition_date", { ascending: false })
    .order("edition_no", { ascending: false })
    .limit(50);

  const revisionIds = (editions ?? []).map((edition) => edition.current_revision_id).filter((id): id is string => Boolean(id));
  const { data: revisions } = revisionIds.length
    ? await supabase.from("briefing_revisions").select("id,edition_id,revision_no,status,title_ar,updated_at").in("id", revisionIds)
    : { data: [] };

  const revisionById = new Map((revisions ?? []).map((revision) => [revision.id, revision]));

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">SAS DAILY BRIEFING / WORKSPACE</span>
          <h1>الأعداد التحريرية</h1>
          <p>إنشاء الإحاطات، متابعة النسخ التحريرية، وإدارة المراجعة والنشر.</p>
        </div>
        <Link href="/briefing-room/new" className="button button-primary">＋ إنشاء عدد جديد</Link>
      </div>

      {params.error === "admin-only" ? <div className="notice notice-error">هذا الإجراء متاح لمدير المنصة فقط.</div> : null}
      {error ? <div className="notice notice-error">تعذر تحميل الأعداد. تحقق من اتصال قاعدة البيانات والصلاحيات.</div> : null}

      <div className="briefing-stats">
        <div><span>الأعداد المسجلة</span><strong>{editions?.length ?? 0}</strong></div>
        <div><span>المسودات</span><strong>{(revisions ?? []).filter((revision) => revision.status === "draft").length}</strong></div>
        <div><span>قيد المراجعة</span><strong>{(revisions ?? []).filter((revision) => revision.status === "in_review").length}</strong></div>
        <div><span>المنشورة</span><strong>{(revisions ?? []).filter((revision) => revision.status === "published").length}</strong></div>
      </div>

      <section className="briefing-panel">
        <div className="briefing-panel-heading">
          <div><span className="eyebrow">EDITORIAL REGISTER</span><h2>سجل الإحاطات</h2></div>
          <span className="briefing-count">{editions?.length ?? 0} عدد</span>
        </div>
        {editions?.length ? (
          <div className="briefing-table-wrap">
            <table className="briefing-table">
              <thead><tr><th>العدد</th><th>التاريخ</th><th>النسخة</th><th>الحالة</th><th /></tr></thead>
              <tbody>
                {editions.map((edition) => {
                  const revision = edition.current_revision_id ? revisionById.get(edition.current_revision_id) : null;
                  return (
                    <tr key={edition.id}>
                      <td><strong>{revision?.title_ar ?? edition.slug}</strong><small>#{edition.edition_no} · {edition.edition_type === "daily" ? "يومي" : "خاص"}</small></td>
                      <td dir="ltr">{edition.edition_date}</td>
                      <td>{revision ? `R${revision.revision_no}` : "—"}</td>
                      <td><span className={`briefing-status status-${revision?.status ?? edition.status}`}>{statusLabels[revision?.status ?? edition.status] ?? edition.status}</span></td>
                      <td><Link href={`/briefing-room/${edition.id}`} className="briefing-open-link">فتح التحرير ←</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="briefing-empty">
            <span className="briefing-empty-mark">◷</span>
            <h3>لا توجد أعداد بعد</h3>
            <p>ابدأ بإنشاء العدد الأول، ثم أضف التطورات ومصادرها قبل إرساله للمراجعة.</p>
            <Link href="/briefing-room/new" className="button button-primary">إنشاء أول عدد</Link>
          </div>
        )}
      </section>
    </>
  );
}

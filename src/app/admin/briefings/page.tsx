import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getPublicBriefingArchive } from "@/lib/public-briefing";
import { formatBriefingDateOnly } from "@/components/briefing-public";
import "./admin-briefings.css";

export const dynamic = "force-dynamic";

export default async function AdminBriefingsPage() {
  await requireAdmin();
  let editions: Awaited<ReturnType<typeof getPublicBriefingArchive>> = [];
  let error = false;
  try {
    editions = await getPublicBriefingArchive(50);
  } catch {
    error = true;
  }

  return (
    <>
      <header className="page-heading">
        <div>
          <span className="eyebrow">غرفة التحرير / الإحاطة اليومية</span>
          <h1>أعداد الإحاطة اليومية</h1>
          <p>تصفّح التطورات المنشورة ومصادرها، واختر أي تطور لتحويله إلى بطاقة في استوديو ساس.</p>
        </div>
        <Link href="/admin/news-studio" className="button button-secondary">استوديو الصور</Link>
      </header>
      <div className="sas-admin-briefing-note">
        هذه الواجهة لقراءة الأعداد المنشورة وتحويل تطوراتها إلى تصميمات. لا تغيّر محتوى الإحاطة أو مراجعاتها الأصلية.
      </div>
      <section className="panel">
        <div className="panel-header"><h2>أرشيف الأعداد المنشورة</h2><span className="pill">{editions.length} عددًا</span></div>
        {error ? <div className="empty-state" role="alert">تعذر جلب أرشيف الإحاطات. تحقق من الاتصال بقاعدة البيانات.</div> :
          editions.length ? <div className="sas-admin-editions">
            {editions.map(edition => (
              <article key={edition.slug} className="sas-admin-edition">
                <div className="sas-admin-edition-meta">
                  <span>العدد {edition.edition_no}</span>
                  <time dateTime={edition.edition_date}>{formatBriefingDateOnly(edition.edition_date)}</time>
                  <span>{edition.edition_type === "special" ? "إحاطة خاصة" : "إحاطة يومية"}</span>
                </div>
                <h2>{edition.title_ar}</h2>
                <div className="sas-admin-edition-actions">
                  <Link className="button button-primary button-small" href={"/admin/briefings/"+encodeURIComponent(edition.slug)}>استعراض التطورات ←</Link>
                  <Link className="button button-quiet button-small" href={"/briefings/"+encodeURIComponent(edition.slug)} target="_blank" rel="noopener noreferrer">فتح النسخة العامة</Link>
                </div>
              </article>
            ))}
          </div> : <div className="empty-state">لا توجد أعداد منشورة متاحة حتى الآن.</div>}
      </section>
    </>
  );
}

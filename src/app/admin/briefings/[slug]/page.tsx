import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { getPublicBriefing } from "@/lib/public-briefing";
import { briefingCategoryLabel, briefingClassLabel, briefingVerificationLabel, formatBriefingDateOnly } from "@/components/briefing-public";
import { prioritizeBriefingDevelopments } from "@/lib/briefing-view";
import "../admin-briefings.css";

export const dynamic = "force-dynamic";

export default async function AdminBriefingDetailPage({
  params, searchParams,
}: {
  params: Promise<{slug:string}>;
  searchParams: Promise<{q?:string; category?:string}>;
}) {
  await requireAdmin();
  const {slug} = await params;
  if (!slug || slug.length > 200) notFound();
  const search = await searchParams;
  const query = typeof search.q === "string" ? search.q.trim().slice(0,90) : "";
  const category = typeof search.category === "string" ? search.category : "all";
  let briefing: Awaited<ReturnType<typeof getPublicBriefing>> = null;
  let loadError = false;
  try { briefing = await getPublicBriefing(slug); } catch { loadError = true; }
  if (!briefing && !loadError) notFound();
  if (!briefing) return (
    <section className="panel"><div className="empty-state" role="alert">
      تعذر تحميل الإحاطة من قاعدة البيانات.
      <Link href="/admin/briefings" className="button button-secondary">العودة إلى الأعداد</Link>
    </div></section>
  );

  const {edition,revision,developments}=briefing;
  const ordered=prioritizeBriefingDevelopments(developments);
  const categories=[...new Set(ordered.map(item=>item.category))];
  const filtered=ordered.filter(item=>
    (category==="all" || item.category===category) &&
    (!query || (item.headline_ar+" "+item.summary_ar+" "+(item.location_text??"")+" "+
      item.sources.map(source=>source.source_name).join(" ")).includes(query))
  );

  return (
    <>
      <header className="page-heading">
        <div>
          <span className="eyebrow">غرفة التحرير / الإحاطة اليومية / العدد {edition.edition_no}</span>
          <h1>{revision.title_ar}</h1>
          <p>بتاريخ {formatBriefingDateOnly(edition.edition_date)} · المراجعة المنشورة رقم {revision.revision_no} · {developments.length} تطورًا</p>
        </div>
        <Link href="/admin/briefings" className="button button-secondary">العودة إلى الأعداد</Link>
      </header>
      <div className="sas-admin-briefing-note">
        <strong>من تطور موثق إلى تصميم:</strong> يفتح زر «تصميم بطاقة» الخبر كاملًا في News Studio مع عنوانه وموجزه ومصدره وتاريخه وحالة التحقق. لا يغير الاستوديو بيانات الإحاطة المنشورة.
      </div>
      <form action={"/admin/briefings/"+encodeURIComponent(edition.slug)} method="GET" className="sas-admin-briefing-filters" role="search">
        <label htmlFor="admin-briefing-search">بحث في تطورات هذا العدد</label>
        <input id="admin-briefing-search" type="search" name="q" defaultValue={query} maxLength={90} placeholder="العنوان، المصدر، المكان..." />
        <label htmlFor="admin-briefing-category">التصنيف</label>
        <select id="admin-briefing-category" name="category" defaultValue={categories.includes(category) ? category : "all"}>
          <option value="all">جميع التصنيفات</option>
          {categories.map(item=><option key={item} value={item}>{briefingCategoryLabel(item)}</option>)}
        </select>
        <button type="submit" className="button button-primary">تطبيق</button>
        <Link href={"/admin/briefings/"+encodeURIComponent(edition.slug)} className="button button-quiet">مسح</Link>
      </form>
      <section className="panel">
        <div className="panel-header">
          <h2>التطورات المنشورة</h2>
          <span className="pill">{filtered.length} من {developments.length}</span>
        </div>
        {filtered.length ? <div className="sas-admin-developments">
          {filtered.map(item=>{
            const source=item.sources.find(s=>s.source_role==="primary")??item.sources[0];
            const transferUrl="/admin/news-studio/briefing/"+
              encodeURIComponent(edition.slug)+"/"+item.order+"?revision="+revision.revision_no;
            return (
              <article key={item.order} className="sas-admin-development">
                <div className="sas-admin-development-header">
                  <div className="sas-admin-development-tags">
                    <span className="pill">السجل {item.order}</span>
                    <span className="pill">{briefingCategoryLabel(item.category)}</span>
                    <span className="pill">{briefingClassLabel(item.information_class)}</span>
                    <span className="pill">{briefingVerificationLabel(item.verification_status)}</span>
                  </div>
                  <Link className="button button-primary button-small" href={transferUrl}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 15 3.5-3.5 2.5 2.5 3-4 3 4.5"/>
                    </svg>
                    تصميم بطاقة ←
                  </Link>
                </div>
                <h3>{item.headline_ar}</h3>
                {item.summary_ar?<p>{item.summary_ar}</p>:null}
                {item.what_changed_ar?<p className="sas-admin-development-change"><strong>ما تغيّر:</strong> {item.what_changed_ar}</p>:null}
                <div className="sas-admin-development-provenance">
                  {item.location_text?<span>المكان: {item.location_text}</span>:null}
                  {source?<span>المصدر: {source.source_name}</span>:<span className="sas-admin-warning">لا يوجد مصدر مسجل — راجع المادة قبل التصدير</span>}
                  {item.sources.length?<details><summary>المصادر ({item.sources.length})</summary>
                    <ul>{item.sources.map((s,index)=><li key={index}>{s.source_url?
                      <a href={s.source_url} target="_blank" rel="noopener noreferrer">{s.source_title||s.source_name}</a>
                      :(s.source_title||s.source_name)} — {s.source_role}</li>)}</ul>
                  </details>:null}
                </div>
              </article>
            );
          })}
        </div>:<div className="empty-state">لا توجد تطورات مطابقة للبحث أو التصنيف المحدد.</div>}
      </section>
    </>
  );
}

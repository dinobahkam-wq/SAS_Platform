import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getPublicBriefingArchive } from "@/lib/public-briefing";
import { formatBriefingDateOnly } from "@/components/briefing-public";
import "./admin-briefings.css";

export const dynamic = "force-dynamic";

export default async function AdminBriefingsPage() {
  const {supabase}=await requireAdmin();
  const {data:drafts,error:draftError}=await supabase.from("briefing_revisions")
    .select("id,edition_id,revision_no,title_ar,status").eq("status","draft").order("created_at",{ascending:false}).limit(50);
  const editionIds=[...new Set((drafts??[]).map(d=>d.edition_id))];
  const {data:draftEditions}=editionIds.length?await supabase.from("briefing_editions")
    .select("id,slug,edition_no,edition_date").in("id",editionIds):{data:[]};
  const draftEditionMap=new Map((draftEditions??[]).map(e=>[e.id,e]));
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
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><Link href="/admin/briefings/editorial" className="button button-primary">تصنيف التطورات</Link><Link href="/admin/news-studio" className="button button-secondary">استوديو الصور</Link></div>
      </header>
      <div className="sas-admin-briefing-note">
        هذه الواجهة لقراءة الأعداد المنشورة وتحويل تطوراتها إلى تصميمات. لا تغيّر محتوى الإحاطة أو مراجعاتها الأصلية.
      </div>
      <section className="panel">
        <div className="panel-header"><h2>المسودات غير المنشورة</h2><span className="pill">{drafts?.length??0} مسودة</span></div>
        {draftError?<div className="empty-state" role="alert">تعذرت قراءة المسودات.</div>:
        drafts?.length?<div className="sas-admin-editions">{drafts.map(draft=>{
          const e=draftEditionMap.get(draft.edition_id);
          if(!e)return null;
          return <article className="sas-admin-edition" key={draft.id}>
            <div className="sas-admin-edition-meta"><span>العدد {e.edition_no}</span><time dateTime={e.edition_date}>{formatBriefingDateOnly(e.edition_date)}</time><span>مراجعة {draft.revision_no} — مسودة</span></div>
            <h2>{draft.title_ar}</h2>
            <Link className="button button-primary button-small" href={"/admin/briefings/enrich/"+encodeURIComponent(e.slug)}>فتح المسودة وإضافة الصور</Link>
          </article>;
        })}</div>:<div className="empty-state">لا توجد مسودات قيد التحرير حالياً.</div>}
      </section>
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
                  <Link className="button button-primary button-small" href={"/admin/briefings/"+encodeURIComponent(edition.slug)}>استعراض التطورات ←</Link><Link className="button button-secondary button-small" href={"/admin/briefings/enrich/"+encodeURIComponent(edition.slug)}>إضافة صور</Link>
                  <Link className="button button-quiet button-small" href={"/briefings/"+encodeURIComponent(edition.slug)} target="_blank" rel="noopener noreferrer">فتح النسخة العامة</Link>
                </div>
              </article>
            ))}
          </div> : <div className="empty-state">لا توجد أعداد منشورة متاحة حتى الآن.</div>}
      </section>
    </>
  );
}

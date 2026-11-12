import Link from "next/link";
import { requireBriefingStaff } from "@/lib/briefing-auth";
import { approveRevisionAction, returnRevisionAction } from "../actions";

export default async function BriefingReviewPage() {
  const { supabase, role } = await requireBriefingStaff();
  const { data: revisions, error } = await supabase
    .from("briefing_revisions")
    .select("id,edition_id,revision_no,title_ar,submitted_at,created_by")
    .eq("status", "in_review")
    .order("submitted_at", { ascending: true })
    .limit(50);
  const editionIds = [...new Set((revisions ?? []).map((revision) => revision.edition_id))];
  const { data: editions } = editionIds.length
    ? await supabase.from("briefing_editions").select("id,edition_no,edition_date,slug").in("id", editionIds)
    : { data: [] };
  const editionById = new Map((editions ?? []).map((edition) => [edition.id, edition]));

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow">EDITORIAL REVIEW</span><h1>المراجعة والاعتماد</h1><p>النسخ التي أرسلها المحررون وتنتظر قرار المدير.</p></div></div>
      {error ? <div className="notice notice-error">تعذر تحميل قائمة المراجعة.</div> : null}
      <section className="briefing-panel">
        <div className="briefing-panel-heading"><div><span className="eyebrow">IN REVIEW</span><h2>قائمة الانتظار</h2></div><span className="briefing-count">{revisions?.length ?? 0} نسخة</span></div>
        {revisions?.length ? <div className="briefing-review-list">{revisions.map((revision) => {
          const edition = editionById.get(revision.edition_id);
          return <article className="briefing-review-row" key={revision.id}>
            <div><span className="briefing-item-kind">العدد #{edition?.edition_no ?? "—"} · R{revision.revision_no}</span><h3>{revision.title_ar}</h3><p>تاريخ العدد: <span dir="ltr">{edition?.edition_date ?? "—"}</span> · أُرسلت: <span dir="ltr">{revision.submitted_at ? new Date(revision.submitted_at).toLocaleString("en-GB") : "—"}</span></p></div>
            <div className="briefing-review-actions">
              <Link className="button button-secondary button-small" href={`/briefing-room/${revision.edition_id}`}>مراجعة النسخة</Link>
              {role === "admin" ? <>
                <form action={approveRevisionAction}><input type="hidden" name="edition_id" value={revision.edition_id}/><input type="hidden" name="revision_id" value={revision.id}/><button className="button button-primary button-small" type="submit">اعتماد</button></form>
                <form action={returnRevisionAction} className="briefing-review-return"><input type="hidden" name="edition_id" value={revision.edition_id}/><input type="hidden" name="revision_id" value={revision.id}/><input name="note_ar" required placeholder="ملاحظة الإعادة"/><button className="button button-quiet button-small" type="submit">إعادة</button></form>
              </> : <span className="briefing-inline-note">قرار الاعتماد للمدير</span>}
            </div>
          </article>;
        })}</div> : <div className="briefing-empty"><span className="briefing-empty-mark">✓</span><h3>لا توجد نسخ تنتظر المراجعة</h3><p>ستظهر هنا الإحاطات فور إرسالها من غرفة التحرير.</p></div>}
      </section>
    </>
  );
}

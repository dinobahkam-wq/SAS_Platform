import Link from "next/link";
import { createEditionAction } from "../actions";

const errors: Record<string, string> = {
  validation: "أكمل الحقول المطلوبة وتأكد من صحة نافذة التغطية.",
  save: "تعذر إنشاء العدد. قد يكون هناك عدد يومي مسجل للتاريخ نفسه أو أن الرابط مستخدم.",
};

export default async function NewBriefingEditionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      <div className="page-heading">
        <div><span className="eyebrow">SAS DAILY BRIEFING / NEW EDITION</span><h1>إنشاء عدد جديد</h1><p>يُنشأ العدد كمسودة أولية. لن يظهر للعامة قبل الاعتماد والنشر.</p></div>
        <Link href="/briefing-room" className="button button-secondary">العودة إلى الأعداد</Link>
      </div>

      {params.error && errors[params.error] ? <div className="notice notice-error">{errors[params.error]}</div> : null}

      <form action={createEditionAction} className="briefing-form">
        <section className="briefing-panel">
          <div className="briefing-panel-heading"><div><span className="eyebrow">01 / IDENTITY</span><h2>هوية العدد</h2></div></div>
          <div className="briefing-form-grid">
            <label className="field"><span>عنوان الإحاطة</span><input name="title_ar" required placeholder="الإحاطة اليومية — تطورات اليمن ومحيطه" /></label>
            <label className="field"><span>تاريخ العدد</span><input name="edition_date" type="date" required dir="ltr" /></label>
            <label className="field"><span>نوع العدد</span><select name="edition_type" defaultValue="daily"><option value="daily">يومي</option><option value="special">خاص</option></select></label>
            <label className="field"><span>الرابط المختصر (اختياري)</span><input name="slug" dir="ltr" placeholder="daily-briefing-2026-11-13" /></label>
          </div>
        </section>

        <section className="briefing-panel">
          <div className="briefing-panel-heading"><div><span className="eyebrow">02 / COVERAGE WINDOW</span><h2>نافذة التغطية</h2></div><p>التوقيت المحلي لليمن (UTC+03:00)</p></div>
          <div className="briefing-form-grid">
            <label className="field"><span>بداية التغطية</span><input name="window_start" type="datetime-local" required dir="ltr" /></label>
            <label className="field"><span>نهاية التغطية</span><input name="window_end" type="datetime-local" required dir="ltr" /></label>
          </div>
        </section>

        <section className="briefing-panel">
          <div className="briefing-panel-heading"><div><span className="eyebrow">03 / EDITORIAL CONTENT</span><h2>المتن التحريري</h2></div></div>
          <div className="briefing-form-stack">
            <label className="field"><span>القراءة التحليلية الرئيسية <small>400–650 كلمة عند النشر</small></span><textarea name="analysis_ar" required rows={12} placeholder="اكتب القراءة التحليلية الرئيسية..." /></label>
            <label className="field"><span>المنهجية</span><textarea name="methodology_ar" required rows={4} placeholder="اشرح منهجية الاختيار والتحقق..." /></label>
            <label className="field"><span>حدود التغطية</span><textarea name="coverage_note_ar" required rows={3} placeholder="وضح ما شملته التغطية وما لم تشمله..." /></label>
          </div>
        </section>

        <div className="briefing-form-actions">
          <Link href="/briefing-room" className="button button-secondary">إلغاء</Link>
          <button className="button button-primary" type="submit">إنشاء المسودة والمتابعة ←</button>
        </div>
      </form>
    </>
  );
}

import Link from "next/link";
import {
  addEditionItemAction,
  approveRevisionAction,
  createCorrectionAction,
  createDevelopmentAction,
  linkDevelopmentSourceAction,
  markDevelopmentReadyAction,
  publishRevisionAction,
  returnRevisionAction,
  saveRevisionAction,
  submitRevisionAction,
} from "../actions";
import { requireBriefingStaff } from "@/lib/briefing-auth";

const statusLabels: Record<string, string> = {
  draft: "مسودة",
  in_review: "قيد المراجعة",
  approved: "معتمد للنشر",
  published: "منشور",
  ready: "جاهز",
  archived: "مؤرشف",
};

const categoryLabels: Record<string, string> = {
  politics: "سياسة", security: "أمن", economy: "اقتصاد", humanitarian: "إنساني",
  diplomacy: "دبلوماسية", regional: "إقليمي", international: "دولي", other: "أخرى",
};

const classLabels: Record<string, string> = {
  fact: "حقيقة موثقة", position: "موقف", claim: "ادعاء", analysis: "تحليل",
};

const verificationLabels: Record<string, string> = {
  verified: "متحقق", attributed: "منسوب لمصدر", disputed: "متنازع عليه",
  unverified: "غير متحقق", not_applicable: "لا ينطبق",
};

function toYemenInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() + 3 * 60 * 60 * 1000).toISOString().slice(0, 16);
}

const messages: Record<string, string> = {
  created: "تم إنشاء العدد كمسودة.",
  saved: "تم حفظ التعديلات.",
  submitted: "أُرسلت النسخة إلى المراجعة.",
  approved: "تم اعتماد النسخة. ما زالت غير منشورة.",
  returned: "أُعيدت النسخة إلى المحرر.",
  published: "تم نشر النسخة وتثبيت لقطة المحتوى والمصادر.",
  "development-created": "تم تسجيل التطور كمسودة.",
  "source-linked": "تم ربط المصدر بالتطور.",
  "development-ready": "أصبح التطور جاهزًا للإدراج.",
  "item-added": "أضيف التطور إلى النسخة.",
  "correction-created": "أُنشئت نسخة تصحيح جديدة.",
};

const errors: Record<string, string> = {
  "revision-validation": "تحقق من نافذة التغطية.",
  "revision-save": "تعذر حفظ النسخة. قد لا تكون في حالة مسودة.",
  "development-validation": "أدخل عنوان التطور وملخصه.",
  "development-save": "تعذر تسجيل التطور. تحقق من التصنيف والحقول.",
  "source-validation": "اختر مصدرًا صالحًا.",
  "source-link": "تعذر ربط المصدر. ربما سبق ربطه بهذا التطور.",
  "source-required": "اربط مصدرًا واحدًا على الأقل بالتطور.",
  "public-source-required": "اختر مصدرًا نشطًا للعرض العام، ويجب أن يتضمن رابطًا أو مرجعًا.",
  "development-ready": "تعذر تحديث حالة التطور.",
  "item-validation": "تحقق من التطور والترتيب.",
  "item-save": "تعذر إضافة التطور. تحقق من الترتيب وعدم تكرار العنصر.",
  submit: "تعذر إرسال النسخة. تحقق من صلاحياتك وحالة المسودة.",
  approve: "تعذر اعتماد النسخة.",
  "return-note": "اكتب ملاحظة توضح سبب إعادة النسخة.",
  return: "تعذر إعادة النسخة.",
  publish: "تعذر النشر. قد لا تستوفي النسخة شروط النشر أو لا تملك مصدرًا عامًا صالحًا لكل تطور.",
  "correction-reason": "اكتب سبب التصحيح.",
  correction: "تعذر إنشاء نسخة التصحيح.",
};

export default async function BriefingEditionPage({
  params,
  searchParams,
}: {
  params: Promise<{ editionId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ editionId }, query, staff] = await Promise.all([params, searchParams, requireBriefingStaff()]);
  const { supabase, role } = staff;

  const { data: edition, error: editionError } = await supabase
    .from("briefing_editions")
    .select("*")
    .eq("id", editionId)
    .maybeSingle();

  if (editionError || !edition) {
    return <section className="briefing-panel briefing-empty"><h2>العدد غير موجود</h2><Link href="/briefing-room">العودة إلى الأعداد</Link></section>;
  }

  const [{ data: revisions }, { data: developments }, { data: sources }] = await Promise.all([
    supabase.from("briefing_revisions").select("*").eq("edition_id", editionId).order("revision_no", { ascending: false }),
    supabase.from("briefing_developments").select("*").order("updated_at", { ascending: false }).limit(60),
    supabase.from("content_sources").select("id,source_name,source_title,source_type,organization_name,source_url,source_reference,is_active").eq("is_active", true).order("source_name").limit(150),
  ]);

  const revision = revisions?.[0] ?? null;
  const { data: items } = revision
    ? await supabase.from("briefing_edition_items").select("*").eq("revision_id", revision.id).order("display_section").order("display_order")
    : { data: [] };
  const developmentIds = [...new Set([...(developments ?? []).map((d) => d.id), ...(items ?? []).map((i) => i.development_id)])];
  const { data: links } = developmentIds.length
    ? await supabase.from("briefing_development_sources").select("*").in("development_id", developmentIds)
    : { data: [] };
  const sourceById = new Map((sources ?? []).map((source) => [source.id, source]));
  const linksByDevelopment = new Map<string, typeof links>();
  for (const link of links ?? []) {
    const list = linksByDevelopment.get(link.development_id) ?? [];
    list.push(link);
    linksByDevelopment.set(link.development_id, list);
  }
  const developmentById = new Map((developments ?? []).map((development) => [development.id, development]));
  const isDraft = revision?.status === "draft";

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">DAILY BRIEFING / EDITION #{edition.edition_no}</span>
          <h1>{revision?.title_ar ?? edition.slug}</h1>
          <p>تاريخ العدد: <span dir="ltr">{edition.edition_date}</span> · {edition.edition_type === "daily" ? "عدد يومي" : "عدد خاص"}</p>
        </div>
        <div className="briefing-heading-actions">
          <Link href="/briefing-room" className="button button-secondary">كل الأعداد</Link>
          <span className={`briefing-status status-${revision?.status ?? edition.status}`}>{statusLabels[revision?.status ?? edition.status] ?? edition.status}</span>
        </div>
      </div>

      {query.created || query.saved || query.submitted || query.approved || query.returned || query.published || query["development-created"] || query["source-linked"] || query["development-ready"] || query["item-added"] || query["correction-created"] ? (
        <div className="notice notice-success">{Object.entries(messages).find(([key]) => query[key])?.[1] ?? "تم تنفيذ العملية."}</div>
      ) : null}
      {query.error && errors[query.error] ? <div className="notice notice-error">{errors[query.error]}</div> : null}

      {revision ? (
        <>
          <section className="briefing-panel">
            <div className="briefing-panel-heading">
              <div><span className="eyebrow">REVISION R{revision.revision_no}</span><h2>المحتوى التحريري</h2></div>
              <span className={`briefing-status status-${revision.status}`}>{statusLabels[revision.status] ?? revision.status}</span>
            </div>
            <form action={saveRevisionAction} className="briefing-form-stack">
              <input type="hidden" name="edition_id" value={editionId} />
              <input type="hidden" name="revision_id" value={revision.id} />
              <div className="briefing-form-grid">
                <label className="field"><span>بداية نافذة التغطية</span><input name="window_start" type="datetime-local" defaultValue={toYemenInput(revision.window_start)} required dir="ltr" disabled={!isDraft} /></label>
                <label className="field"><span>نهاية نافذة التغطية</span><input name="window_end" type="datetime-local" defaultValue={toYemenInput(revision.window_end)} required dir="ltr" disabled={!isDraft} /></label>
              </div>
              <label className="field"><span>عنوان الإحاطة</span><input name="title_ar" defaultValue={revision.title_ar} required disabled={!isDraft} /></label>
              <label className="field"><span>القراءة التحليلية الرئيسية <small>400–650 كلمة عند النشر</small></span><textarea name="analysis_ar" rows={14} defaultValue={revision.analysis_ar} required disabled={!isDraft} /></label>
              <label className="field"><span>المنهجية</span><textarea name="methodology_ar" rows={4} defaultValue={revision.methodology_ar} required disabled={!isDraft} /></label>
              <label className="field"><span>حدود التغطية</span><textarea name="coverage_note_ar" rows={3} defaultValue={revision.coverage_note_ar} required disabled={!isDraft} /></label>
              {isDraft ? <div className="briefing-form-actions"><button className="button button-secondary" type="submit">حفظ التعديلات</button></div> : null}
            </form>
            <div className="briefing-workflow">
              {isDraft ? <form action={submitRevisionAction}><input type="hidden" name="edition_id" value={editionId}/><input type="hidden" name="revision_id" value={revision.id}/><button className="button button-primary" type="submit">إرسال للمراجعة</button></form> : null}
              {revision.status === "in_review" && role === "admin" ? (
                <>
                  <form action={approveRevisionAction}><input type="hidden" name="edition_id" value={editionId}/><input type="hidden" name="revision_id" value={revision.id}/><button className="button button-primary" type="submit">اعتماد النسخة</button></form>
                  <form action={returnRevisionAction} className="briefing-return-form"><input type="hidden" name="edition_id" value={editionId}/><input type="hidden" name="revision_id" value={revision.id}/><input name="note_ar" required placeholder="سبب الإعادة للمحرر"/><button className="button button-secondary" type="submit">إعادة للتحرير</button></form>
                </>
              ) : null}
              {revision.status === "approved" && role === "admin" ? <form action={publishRevisionAction}><input type="hidden" name="edition_id" value={editionId}/><input type="hidden" name="revision_id" value={revision.id}/><button className="button button-primary" type="submit">نشر الإحاطة</button></form> : null}
              {revision.status === "published" ? <form action={createCorrectionAction} className="briefing-return-form"><input type="hidden" name="edition_id" value={editionId}/><input name="change_reason_ar" required placeholder="سبب إنشاء نسخة تصحيح"/><button className="button button-secondary" type="submit">إنشاء نسخة تصحيح</button></form> : null}
            </div>
            {revision.status === "published" ? <p className="briefing-inline-note">هذه النسخة ثابتة بعد النشر. أي تعديل يجب أن يتم في نسخة تصحيح جديدة.</p> : null}
          </section>

          <section className="briefing-panel">
            <div className="briefing-panel-heading"><div><span className="eyebrow">DEVELOPMENT LEDGER</span><h2>سجل التطورات</h2></div><span className="briefing-count">{items?.filter((item) => item.display_section === "developments").length ?? 0} تطورًا في العدد</span></div>
            {items?.length ? <div className="briefing-item-list">{items.map((item) => {
              const development = developmentById.get(item.development_id);
              return <article className="briefing-item-row" key={item.id}>
                <div><span className="briefing-item-kind">{item.display_section === "executive_summary" ? "الموجز التنفيذي" : "سجل التطورات"} · {item.display_order + 1}</span><strong>{item.headline_override_ar || development?.headline_ar || "تطور غير متاح"}</strong><p>{item.summary_text_ar || development?.summary_ar}</p></div>
                <span className={`briefing-status status-${development?.status ?? "draft"}`}>{statusLabels[development?.status ?? "draft"]}</span>
              </article>;
            })}</div> : <div className="briefing-empty compact"><p>لم تُضف تطورات إلى هذا العدد بعد.</p></div>}
            {isDraft ? (
              <form action={addEditionItemAction} className="briefing-subform">
                <input type="hidden" name="edition_id" value={editionId}/><input type="hidden" name="revision_id" value={revision.id}/>
                <h3>إدراج تطور في العدد</h3>
                <div className="briefing-form-grid">
                  <label className="field"><span>التطور</span><select name="development_id" required defaultValue=""><option value="" disabled>اختر تطورًا</option>{(developments ?? []).map((d) => <option key={d.id} value={d.id}>{d.headline_ar} — {statusLabels[d.status]}</option>)}</select></label>
                  <label className="field"><span>القسم</span><select name="display_section" defaultValue="developments"><option value="developments">سجل التطورات</option><option value="executive_summary">الموجز التنفيذي</option></select></label>
                  <label className="field"><span>الترتيب (يبدأ من 0)</span><input name="display_order" type="number" min="0" defaultValue="0" required dir="ltr"/></label>
                  <label className="field"><span>عنوان بديل (اختياري)</span><input name="headline_override_ar"/></label>
                </div>
                <label className="field"><span>صياغة موجزة للموجز التنفيذي (مطلوبة عند اختيار الموجز)</span><textarea name="summary_text_ar" rows={2}/></label>
                <div className="briefing-form-grid">
                  <label className="field"><span>ما الذي تغير؟</span><textarea name="what_changed_ar" rows={2}/></label>
                  <label className="field"><span>لماذا يهم؟</span><textarea name="why_it_matters_ar" rows={2}/></label>
                </div>
                <label className="field"><span>السياق</span><textarea name="context_ar" rows={2}/></label>
                <button className="button button-secondary" type="submit">إضافة إلى العدد</button>
              </form>
            ) : null}
          </section>
        </>
      ) : null}

      <section className="briefing-panel">
        <div className="briefing-panel-heading"><div><span className="eyebrow">REUSABLE DEVELOPMENTS</span><h2>مكتبة التطورات</h2></div><span className="briefing-count">{developments?.length ?? 0} تطورًا</span></div>
        <div className="briefing-development-grid">
          {(developments ?? []).map((development) => {
            const developmentLinks = linksByDevelopment.get(development.id) ?? [];
            return <article className="briefing-development-card" key={development.id}>
              <div className="briefing-development-head"><span>{categoryLabels[development.category] ?? development.category} · {classLabels[development.information_class] ?? development.information_class}</span><span className={`briefing-status status-${development.status}`}>{statusLabels[development.status] ?? development.status}</span></div>
              <h3>{development.headline_ar}</h3><p>{development.summary_ar}</p>
              <div className="briefing-development-meta"><span>{verificationLabels[development.verification_status] ?? development.verification_status}</span><span>{development.occurred_on ?? "توقيت غير محدد"}</span></div>
              <div className="briefing-source-list">
                {developmentLinks.map((link) => {
                  const source = sourceById.get(link.source_id);
                  return <div key={link.source_id}><span>{source?.source_name ?? "مصدر"}</span><small>{link.display_publicly ? "ظاهر للعامة عند النشر" : "داخلي"}</small></div>;
                })}
                {!developmentLinks.length ? <small>لا توجد مصادر مرتبطة.</small> : null}
              </div>
              {isDraft ? (
                <>
                  <form action={linkDevelopmentSourceAction} className="briefing-source-form">
                    <input type="hidden" name="edition_id" value={editionId}/><input type="hidden" name="development_id" value={development.id}/>
                    <label className="field"><span>إضافة مصدر من المكتبة</span><select name="source_id" required defaultValue=""><option value="" disabled>اختر مصدرًا</option>{(sources ?? []).map((source) => <option key={source.id} value={source.id}>{source.source_name}{source.source_title ? ` — ${source.source_title}` : ""}</option>)}</select></label>
                    <div className="briefing-form-grid">
                      <label className="field"><span>دور المصدر</span><select name="source_role" defaultValue="supporting"><option value="primary">أساسي</option><option value="supporting">مساند</option><option value="context">سياقي</option></select></label>
                      <label className="field"><span>مقتطف / إحالة</span><input name="source_excerpt" placeholder="صفحة أو فقرة أو اقتباس قصير"/></label>
                    </div>
                    <label className="briefing-checkbox"><input type="checkbox" name="display_publicly"/> <span>إظهار هذا المصدر للقارئ عند نشر الإحاطة</span></label>
                    <button className="button button-secondary button-small" type="submit">ربط المصدر</button>
                  </form>
                  {development.status === "draft" ? <form action={markDevelopmentReadyAction} className="briefing-ready-form"><input type="hidden" name="edition_id" value={editionId}/><input type="hidden" name="development_id" value={development.id}/><button className="button button-quiet button-small" type="submit">تحقق واجعل التطور جاهزًا</button></form> : null}
                </>
              ) : null}
            </article>;
          })}
        </div>
        {isDraft ? (
          <form action={createDevelopmentAction} className="briefing-subform">
            <input type="hidden" name="edition_id" value={editionId}/>
            <h3>تسجيل تطور جديد</h3>
            <div className="briefing-form-grid">
              <label className="field"><span>عنوان التطور</span><input name="headline_ar" required/></label>
              <label className="field"><span>التصنيف</span><select name="category" defaultValue="politics"><option value="politics">سياسة</option><option value="security">أمن</option><option value="economy">اقتصاد</option><option value="humanitarian">إنساني</option><option value="diplomacy">دبلوماسية</option><option value="regional">إقليمي</option><option value="international">دولي</option><option value="other">أخرى</option></select></label>
              <label className="field"><span>تصنيف المعلومة</span><select name="information_class" defaultValue="fact"><option value="fact">حقيقة</option><option value="position">موقف</option><option value="claim">ادعاء</option><option value="analysis">تحليل</option></select></label>
              <label className="field"><span>حالة التحقق</span><select name="verification_status" defaultValue="unverified"><option value="verified">متحقق</option><option value="attributed">منسوب</option><option value="disputed">متنازع عليه</option><option value="unverified">غير متحقق</option><option value="not_applicable">لا ينطبق</option></select></label>
              <label className="field"><span>تاريخ وقوع التطور (اختياري)</span><input name="occurred_on" type="date" dir="ltr"/></label>
              <label className="field"><span>النطاق الجغرافي</span><select name="geographic_scope" defaultValue="national"><option value="local">محلي</option><option value="national">وطني</option><option value="regional">إقليمي</option><option value="international">دولي</option></select></label>
              <label className="field"><span>الموقع / الدولة</span><input name="location_text"/></label>
              <label className="field"><span>ملاحظة التحقق</span><input name="verification_note_ar"/></label>
            </div>
            <label className="field"><span>ملخص التطور</span><textarea name="summary_ar" rows={3} required/></label>
            <button className="button button-primary" type="submit">تسجيل التطور</button>
          </form>
        ) : null}
      </section>
    </>
  );
}

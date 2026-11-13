import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicFooter, PublicHeader } from "@/components/public-site";
import {
  BriefingTypeTag,
  BriefingVerification,
  briefingCategoryLabel,
  briefingScopeLabel,
  formatBriefingDate,
  formatBriefingDateOnly,
  BriefingEmphasis,
} from "@/components/briefing-public";
import { getPublicBriefing, type BriefingDevelopment } from "@/lib/public-briefing";
import { BriefingSourcesPopover } from "@/components/briefing-sources-popover";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الإحاطة اليومية",
  description: "سجل موثق للتطورات والبيانات والمواقف المرتبطة باليمن ومحيطه.",
};

function uniqueSources(developments: BriefingDevelopment[]) {
  const seen = new Set<string>();
  return developments.flatMap((development) => development.sources).filter((source) => {
    const key = source.source_url || source.source_reference || source.source_name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default async function PublicBriefingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let briefing: Awaited<ReturnType<typeof getPublicBriefing>> = null;
  let loadError = false;
  try {
    briefing = await getPublicBriefing(slug);
  } catch {
    loadError = true;
  }

  if (!briefing && !loadError) notFound();

  if (loadError || !briefing) {
    return (
      <main className="briefing-public-site">
        <PublicHeader />
        <div className="briefing-public-container">
          <section className="briefing-empty-public">
            <span className="briefing-empty-icon" aria-hidden="true">!</span>
            <h1>تعذر تحميل الإحاطة</h1>
            <p>حدث خطأ مؤقت أثناء جلب بيانات العدد. حاول مرة أخرى لاحقًا.</p>
          </section>
        </div>
        <PublicFooter />
      </main>
    );
  }

  const { edition, revision, executiveSummary, developments } = briefing;
  const sources = uniqueSources(developments);
  const correction = revision.revision_kind === "correction";

  return (
    <main className="briefing-public-site">
      <PublicHeader />
      <div className="briefing-public-container briefing-edition-container">
        <nav className="briefing-breadcrumb" aria-label="مسار الصفحة">
          <a href="/briefings">الإحاطة اليومية</a><span>/</span><span>العدد {edition.edition_no}</span>
        </nav>

        <header className="briefing-edition-header">
          <div className="briefing-edition-overline">
            <span className="briefing-eyebrow">SAS DAILY BRIEFING</span>
            <span className="briefing-edition-number">العدد {edition.edition_no}</span>
            {correction ? <span className="briefing-correction-tag">نسخة مصححة</span> : null}
          </div>
          <h1>{revision.title_ar}</h1>
          <div className="briefing-edition-date">
            <time dateTime={edition.edition_date}>{formatBriefingDateOnly(edition.edition_date)}</time>
            <span>·</span>
            <span>{edition.edition_type === "special" ? "إحاطة خاصة" : "إحاطة يومية"}</span>
            <span>·</span>
            <span>مراجعة رقم {revision.revision_no}</span>
          </div>
          {correction && revision.change_reason_ar ? (
            <p className="briefing-correction-note">سبب التصحيح: {revision.change_reason_ar}</p>
          ) : null}
          <div className="briefing-window-grid">
            <div><span>بداية نافذة الرصد</span><strong>{formatBriefingDate(revision.window_start, true)} <small>بتوقيت اليمن</small></strong></div>
            <div><span>نهاية نافذة الرصد</span><strong>{formatBriefingDate(revision.window_end, true)} <small>بتوقيت اليمن</small></strong></div>
            <div><span>آخر تحقق تحريري</span><strong>{formatBriefingDate(revision.checked_at, true)}</strong></div>
            <div><span>تاريخ النشر</span><strong>{formatBriefingDate(revision.published_at, true)}</strong></div>
          </div>
        </header>

        <div className="briefing-editorial-note">
          <span aria-hidden="true">ⓘ</span>
          <p>هذا السجل يوثق التطورات والبيانات والمواقف كما وردت في مصادرها. تصنيف المعلومة لا يعني تبني منصة ساس لمضمونها.</p>
        </div>

        {executiveSummary.length ? (
          <section className="briefing-summary-section" aria-labelledby="briefing-summary-title">
            <div className="briefing-section-heading">
              <div><span className="briefing-eyebrow">EXECUTIVE SUMMARY</span><h2 id="briefing-summary-title">الملخص التنفيذي</h2></div>
              <span>أبرز ما ورد في السجل</span>
            </div>
            <div className="briefing-executive-prose">
              <p>
                {executiveSummary.map((item, index) => {
                  const transitions = ["", "وفي تطور آخر، ", "أما ميدانيًا، ", "وعلى المستوى الإنساني، ", "وفي السياق الدولي، "];
                  const lead = transitions[index] ?? "كذلك، ";
                  return (
                    <span key={index} className="briefing-executive-clause">
                      {index > 0 ? " " : ""}{lead}<BriefingEmphasis text={item.text_ar.trim()} />
                    </span>
                  );
                })}
              </p>
              <div className="briefing-executive-foot">
                <span>ملخص مستند إلى التطورات الواردة أدناه، وليس تحليلًا مستقلًا.</span>
                <div className="briefing-executive-references">
                  {executiveSummary.map((item, index) => (
                    <BriefingSourcesPopover key={index} sources={item.sources} label={`مرجع ${index + 1}`} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="briefing-developments-section" aria-labelledby="briefing-developments-title">
          <div className="briefing-section-heading briefing-developments-heading">
            <div><span className="briefing-eyebrow">DEVELOPMENT REGISTER</span><h2 id="briefing-developments-title">سجل التطورات</h2><p>تطورات مرتبة وفق تسلسل العدد، مع تصنيف المعلومة ومصادرها.</p></div>
            <span className="briefing-development-count">{developments.length} تطورًا</span>
          </div>

          {developments.length ? (
            <div className="briefing-timeline">
              {developments.map((development, index) => {
                const happened = development.occurred_at
                  ? formatBriefingDate(development.occurred_at, development.time_precision !== "date_only")
                  : development.occurred_on
                    ? formatBriefingDateOnly(development.occurred_on)
                    : "وقت الوقوع غير محدد";
                return (
                  <article className="briefing-event" key={development.order + "-" + index}>
                    <div className="briefing-event-index"><span>{String(index + 1).padStart(2, "0")}</span></div>
                    <div className="briefing-event-content">
                      <div className="briefing-event-meta">
                        <span className="briefing-event-category">{briefingCategoryLabel(development.category)}</span>
                        <span>{briefingScopeLabel(development.geographic_scope)}</span>
                        <span>{happened}</span>
                        {development.location_text ? <span>{development.location_text}</span> : null}
                      </div>
                      <div className="briefing-event-tags"><BriefingTypeTag value={development.information_class}/><BriefingVerification value={development.verification_status}/></div>
                      <h3>{development.headline_ar}</h3>
                      {development.summary_ar ? <p className="briefing-event-summary"><BriefingEmphasis text={development.summary_ar} /></p> : null}
                      {development.what_changed_ar ? <div className="briefing-event-fact"><strong>تفصيل التطور</strong><p>{development.what_changed_ar}</p></div> : null}
                      {development.context_ar ? <div className="briefing-event-context"><strong>السياق المرتبط</strong><p>{development.context_ar}</p></div> : null}
                      {development.sources.length ? (
                        <div className="briefing-event-source-action">
                          <BriefingSourcesPopover sources={development.sources} label="المصادر" />
                        </div>
                      ) : (
                        <div className="briefing-no-source">لا تتوفر إحالة عامة لمصدر هذا التطور.</div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="briefing-empty-inline">لا توجد تطورات مدرجة في هذا العدد.</div>
          )}
        </section>

        {sources.length ? (
          <div className="briefing-source-index-minimal">
            <span>الإحالات المنشورة</span>
            <strong>{sources.length} مصدرًا فريدًا</strong>
            <small>تُفتح بيانات كل مصدر من زر المراجع المرفق بتطوره.</small>
          </div>
        ) : null}

        <section className="briefing-methodology-section">
          <details>
            <summary><span>منهجية الرصد وحدود التغطية</span><span>عرض التفاصيل +</span></summary>
            <div className="briefing-methodology-content">
              <div><h3>منهجية الرصد</h3><p>{revision.methodology_ar}</p></div>
              <div><h3>حدود التغطية</h3><p>{revision.coverage_note_ar}</p></div>
            </div>
          </details>
        </section>

        {revision.analysis_ar?.trim() ? (
          <section className="briefing-analysis-section">
            <details>
              <summary><span>قراءة ساس</span><span>مساحة تفسيرية منفصلة · عرض +</span></summary>
              <div className="briefing-analysis-content"><p>{revision.analysis_ar}</p></div>
            </details>
          </section>
        ) : null}

        <footer className="briefing-edition-end">
          <a href="/briefings">العودة إلى أرشيف الإحاطات ←</a>
          <span>منصة ساس للإعلام والدراسات</span>
        </footer>
      </div>
      <PublicFooter />
    </main>
  );
}

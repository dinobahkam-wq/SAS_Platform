import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BriefingPrintAction } from "@/components/briefing-print-action";
import {
  briefingCategoryLabel,
  briefingClassLabel,
  briefingVerificationLabel,
  formatBriefingDateOnly,
} from "@/components/briefing-public";
import { getPublicBriefing } from "@/lib/public-briefing";
import { getDatedBriefingContext } from "@/lib/briefing-dated-context";
import "./print.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "نسخة الطباعة | الإحاطة اليومية",
  robots: { index: false, follow: false },
};

function formatNumber(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export default async function BriefingPrintPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const briefing = await getPublicBriefing(slug);
  if (!briefing) notFound();

  const { edition, revision, developments, executiveSummary } = briefing;
  const context = await getDatedBriefingContext(edition.edition_date);
  const [headline, ...subtitleParts] = revision.title_ar.split(" | ");
  const subtitle = subtitleParts.join(" | ").replace(/\s+—\s+\d{1,2}\s+[^—]+\d{4}\s*$/, "").trim();

  return (
    <main className="briefing-print-page" dir="rtl" lang="ar">
      <div className="briefing-print-tools" role="toolbar" aria-label="خيارات نسخة PDF">
        <Link href={`/briefings/${edition.slug}`}>العودة إلى الإحاطة</Link>
        <p>اختر «حفظ بتنسيق PDF» من وجهة الطباعة. احفظ جميع الصفحات بمقاس A4.</p>
        <BriefingPrintAction/>
      </div>

      <div className="briefing-print-document">
        <header className="briefing-print-masthead">
          <div className="briefing-print-brand">
            <strong>ساس</strong>
            <span>منصة ساس للإعلام والدراسات</span>
          </div>
          <div className="briefing-print-issue">
            <span>الإحاطة اليومية</span>
            <strong>العدد {edition.edition_no}</strong>
          </div>
        </header>

        <section className="briefing-print-cover">
          <p className="briefing-print-kicker">إحاطة معلوماتية موثقة</p>
          <h1>{headline}</h1>
          {subtitle ? <p className="briefing-print-subtitle">{subtitle}</p> : null}
          <div className="briefing-print-meta">
            <span>تاريخ العدد: <strong>{formatBriefingDateOnly(edition.edition_date)}</strong></span>
            <span>الإصدار: <strong>{revision.revision_no}</strong></span>
            <span>التطورات: <strong>{developments.length}</strong></span>
            {revision.revision_kind === "correction" ? <strong>إصدار مصحح</strong> : null}
          </div>
          {revision.revision_kind === "correction" && revision.change_reason_ar ?
            <p className="briefing-print-correction">سبب التصحيح: {revision.change_reason_ar}</p> : null}
        </section>

        {context ? (
          <section className="briefing-print-indicators" aria-labelledby="briefing-print-indicators-title">
            <h2 id="briefing-print-indicators-title">مؤشرات العدد</h2>
            <div className="briefing-print-indicator-grid">
              <div>
                <h3>الأسواق العالمية <span>إغلاق {formatBriefingDateOnly(context.edition_date)}</span></h3>
                <table>
                  <thead><tr><th>المؤشر</th><th>الإغلاق</th><th>المصدر</th></tr></thead>
                  <tbody>
                    {context.market.map((item) => (
                      <tr key={item.id}>
                        <th>{item.label}</th>
                        <td><bdi dir="ltr">${formatNumber(item.value)}</bdi> <small>{item.unit}</small></td>
                        <td><a href={item.source_url}>{item.source_name}</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <h3>أسعار الصرف <span>ريال يمني للوحدة · شراء/بيع</span></h3>
                <table>
                  <thead><tr><th>السوق</th><th>العملة</th><th>شراء</th><th>بيع</th></tr></thead>
                  <tbody>
                    {context.exchange_rates.rates.map((rate) => (
                      <tr key={rate.city + rate.code}>
                        <th>{rate.city}</th><td><bdi dir="ltr">{rate.code}</bdi></td>
                        <td><bdi dir="ltr">{formatNumber(rate.buy)}</bdi></td>
                        <td><bdi dir="ltr">{formatNumber(rate.sell)}</bdi></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="briefing-print-table-source">
                  المصدر: <a href={context.exchange_rates.source_url}>{context.exchange_rates.source_name}</a> · أسعار استرشادية بتاريخ العدد
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {executiveSummary.length ? (
          <section className="briefing-print-summary">
            <h2>الملخص التنفيذي</h2>
            <p>
              {executiveSummary.map((item, index) => (
                <span key={index}>
                  {index > 0 ? " " : ""}{["", "وفي تطور آخر، ", "أما ميدانيًا، ", "وعلى المستوى الإنساني، ", "وفي السياق الدولي، "][index] ?? "كذلك، "}
                  {item.text_ar.trim()}
                </span>
              ))}
            </p>
          </section>
        ) : null}

        <section className="briefing-print-developments">
          <div className="briefing-print-section-heading">
            <h2>سجل التطورات</h2>
            <span>{developments.length} تطورًا</span>
          </div>
          {developments.map((development, index) => (
            <article className="briefing-print-event" key={development.order + "-" + index}>
              <div className="briefing-print-event-head">
                <span className="briefing-print-event-no">{String(development.order + 1).padStart(2, "0")}</span>
                <div className="briefing-print-event-meta">
                  <span>{briefingCategoryLabel(development.category)}</span>
                  <span>{briefingClassLabel(development.information_class)}</span>
                  <span>{briefingVerificationLabel(development.verification_status)}</span>
                  {development.location_text ? <span>{development.location_text}</span> : null}
                </div>
              </div>
              <h3>{development.headline_ar}</h3>
              <p>{development.summary_ar}</p>
              {development.what_changed_ar ? <p className="briefing-print-detail">{development.what_changed_ar}</p> : null}
              {development.context_ar ? <p className="briefing-print-context">السياق: {development.context_ar}</p> : null}
              <div className="briefing-print-citations">
                <strong>المراجع:</strong>
                {development.sources.length ? (
                  <ol>
                    {development.sources.map((source, sourceIndex) => (
                      <li key={source.source_url || source.source_reference || sourceIndex}>
                        {source.source_url ? <a href={source.source_url}>{source.source_title || source.source_name}</a>
                        : <span>{source.source_title || source.source_name}</span>}
                        {source.source_title && source.source_name ? <span> — {source.source_name}</span> : null}
                        {source.published_at || source.publication_date ?
                          <time dateTime={source.published_at || source.publication_date || undefined}>
                            {" · "}{formatBriefingDateOnly((source.published_at || source.publication_date || "").slice(0, 10))}
                          </time> : null}
                      </li>
                    ))}
                  </ol>
                ) : <span>لم تُدرج إحالة عامة.</span>}
              </div>
            </article>
          ))}
        </section>

        <section className="briefing-print-methodology">
          <h2>المنهجية وحدود التغطية</h2>
          <h3>منهجية الرصد</h3>
          <p>{revision.methodology_ar}</p>
          <h3>حدود التغطية</h3>
          <p>{revision.coverage_note_ar}</p>
        </section>

        {revision.analysis_ar?.trim() ? (
          <section className="briefing-print-analysis">
            <h2>قراءة ساس</h2>
            <p>{revision.analysis_ar}</p>
          </section>
        ) : null}

        <footer className="briefing-print-document-end">
          <span>منصة ساس للإعلام والدراسات</span>
          <span>نسخة وثائقية من العدد المنشور · مراجعة رقم {revision.revision_no}</span>
          <span className="briefing-print-public-url"><a href={`/briefings/${edition.slug}`}>رابط الإحاطة الأصلية</a></span>
        </footer>
      </div>
    </main>
  );
}

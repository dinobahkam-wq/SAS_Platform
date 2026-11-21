import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BriefingPrintAction } from "@/components/briefing-print-action";
import { BrandLogo } from "@/components/brand-logo";
import {
  briefingCategoryLabel,
  briefingClassLabel,
  briefingVerificationLabel,
  formatBriefingDateOnly,
} from "@/components/briefing-public";
import { getPublicBriefing } from "@/lib/public-briefing";
import { prioritizeBriefingDevelopments, briefingEditionOverview } from "@/lib/briefing-view";
import { identityById } from "@/lib/visual-identities";
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

  const { edition, revision, developments } = briefing;
  const overview = briefingEditionOverview(developments);
  const ordered = prioritizeBriefingDevelopments(developments);
  const highlighted = ordered.filter(item => item.priority_level === "critical" || item.priority_level === "high");
  const context = await getDatedBriefingContext(edition.edition_date);
  const fx = context?.exchange_rates;
  const indicativeFx = context?.indicative_exchange_rates;
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
            <BrandLogo
              variant="full"
              className="briefing-print-logo"
              priority
            />
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

        <section className="sas-print-reference">
          <h2>مؤشرات العدد والبيانات المرجعية</h2>
          <table><thead><tr><th>التطورات</th><th>اليمن</th><th>الإقليم</th><th>العالم</th><th>المواقف</th></tr></thead>
            <tbody><tr><td>{overview.total}</td><td>{overview.yemen}</td><td>{overview.regional}</td><td>{overview.international}</td><td>{overview.positions}</td></tr></tbody>
          </table>
        </section>
        {context ? (
          <section className="briefing-print-indicators" aria-labelledby="briefing-print-indicators-title">
            <h2 id="briefing-print-indicators-title">المؤشرات الاقتصادية والمرجعية</h2>
            <div className="briefing-print-indicator-grid">
              {context.market.length > 0 ? <div>
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
              </div> : null}
              {fx ? <div>
                <h3>أسعار الصرف <span>ريال يمني للوحدة · شراء/بيع</span></h3>
                <table>
                  <thead><tr><th>السوق</th><th>العملة</th><th>شراء</th><th>بيع</th></tr></thead>
                  <tbody>
                    {fx.rates.map((rate) => (
                      <tr key={rate.city + rate.code}>
                        <th>{rate.city}</th><td className="briefing-print-currency-name">{rate.code === "USD" ? "الدولار الأمريكي" : "الريال السعودي"}</td>
                        <td><bdi dir="ltr">{formatNumber(rate.buy)}</bdi></td>
                        <td><bdi dir="ltr">{formatNumber(rate.sell)}</bdi></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="briefing-print-table-source">
                  المصدر: <a href={fx.source_url}>{fx.source_name}</a> · أسعار استرشادية بتاريخ العدد
                </p>
              </div> : indicativeFx ? <div>
                <h3>أسعار الصرف <span>تقديرات استرشادية — {formatBriefingDateOnly(indicativeFx.as_of_date)}</span></h3>
                <table>
                  <thead><tr><th>السوق</th><th>العملة</th><th>التقدير (ريال يمني)</th></tr></thead>
                  <tbody>
                    {indicativeFx.rates.map((rate) => (
                      <tr key={rate.city + rate.code}>
                        <th>{rate.city}</th>
                        <td className="briefing-print-currency-name">{rate.code === "USD" ? "الدولار الأمريكي" : "الريال السعودي"}</td>
                        <td>{rate.qualifier} <bdi dir="ltr">{rate.low === rate.high ? formatNumber(rate.low) : `${formatNumber(rate.low)}–${formatNumber(rate.high)}`}</bdi></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="briefing-print-table-source">
                  المصدر: <a href={indicativeFx.source_url}>{indicativeFx.source_name}</a> · ليست أسعار شراء وبيع منفصلة.
                </p>
              </div> : null}
            </div>
          </section>
        ) : null}


        <section className="sas-print-priorities">
          <h2>أهم التطورات</h2>
          {highlighted.length ? <ol>{highlighted.map(item => (
            <li key={item.order}>
              <span>{item.priority_level === "critical" ? "أولوية قصوى" : "أولوية عالية"}</span>
              <strong>{item.headline_ar}</strong>
            </li>))}</ol> : <p>لم تُسجّل درجات أولوية في البيانات الأصلية لهذا العدد؛ لا يُفترض تصنيف بأثر رجعي.</p>}
        </section>

        <section className="briefing-print-developments">
          <div className="briefing-print-section-heading">
            <h2>سجل التطورات</h2>
            <span>{developments.length} تطورًا</span>
          </div>
          {ordered.map((development, index) => (
            <article className={`briefing-print-event sas-print-tone-${development.priority_level === "critical" ? "critical" : development.sources.some(source => source.source_type === "official_statement") ? "official" : development.geographic_scope === "regional" ? "regional" : identityById(development.issuer_identity_id)?.kind === "international" ? "international" : "neutral"}`} key={development.order + "-" + index}>
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

        <footer className="briefing-print-document-end">
          <span>منصة ساس للإعلام والدراسات</span>
          <span>نسخة وثائقية من العدد المنشور · مراجعة رقم {revision.revision_no}</span>
          <span className="briefing-print-public-url"><a href={`/briefings/${edition.slug}`}>رابط الإحاطة الأصلية</a></span>
        </footer>
      </div>
    </main>
  );
}

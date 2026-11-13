import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PublicFooter, PublicHeader } from "@/components/public-site";
import { formatBriefingDateOnly } from "@/components/briefing-public";
import { BriefingEditionBody } from "@/components/briefing-edition-body";
import { getPublicBriefing } from "@/lib/public-briefing";
import { getBriefingWeatherIndicators } from "@/lib/briefing-indicators";
import { getDatedBriefingContext } from "@/lib/briefing-dated-context";
import { BriefingIntelligencePanel } from "@/components/briefing-intelligence-panel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الإحاطة اليومية",
  description: "سجل موثق للتطورات والبيانات والمواقف المرتبطة باليمن ومحيطه.",
};

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
  const correction = revision.revision_kind === "correction";
  const [weather, context] = await Promise.all([
    getBriefingWeatherIndicators(),
    getDatedBriefingContext(edition.edition_date),
  ]);
  const [headline, ...subtitleParts] = revision.title_ar.split(" | ");
  const subtitle = subtitleParts.join(" | ").replace(/\s+—\s+\d{1,2}\s+[^—]+\d{4}\s*$/, "").trim();

  return (
    <main className="briefing-public-site">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL@20..48,400,0&display=swap" />
      <PublicHeader />
      <div className="briefing-public-container briefing-edition-container">
        <nav className="briefing-breadcrumb" aria-label="مسار الصفحة">
          <a href="/briefings">الإحاطة اليومية</a><span>/</span><span>العدد {edition.edition_no}</span>
        </nav>

        <header className="briefing-edition-header">
          {correction ? <span className="briefing-correction-tag">نسخة مصححة</span> : null}
          <h1 className="briefing-title-hierarchy">
            <span className="briefing-title-primary">{headline}</span>
            {subtitle ? <span className="briefing-title-secondary">{subtitle}</span> : null}
          </h1>
          <div className="briefing-edition-toolbar">
            <div className="briefing-edition-date">
              <time dateTime={edition.edition_date}>{formatBriefingDateOnly(edition.edition_date)}</time>
              <span>·</span>
              <span>{edition.edition_type === "special" ? "إحاطة خاصة" : "إحاطة يومية"}</span>
              <span>·</span>
              <span>مراجعة رقم {revision.revision_no}</span>
            </div>
            <Link className="briefing-pdf-export-link" href={`/briefings/${edition.slug}/print`} target="_blank" rel="noopener noreferrer" aria-label="فتح النسخة المهيأة للطباعة والحفظ بصيغة PDF">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              تصدير PDF
            </Link>
          </div>
          {correction && revision.change_reason_ar ? (
            <p className="briefing-correction-note">سبب التصحيح: {revision.change_reason_ar}</p>
          ) : null}
        </header>

        <BriefingIntelligencePanel context={context} weather={weather} />

        <BriefingEditionBody executiveSummary={executiveSummary} developments={developments} />

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

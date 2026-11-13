import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicFooter, PublicHeader } from "@/components/public-site";
import { formatBriefingDate, formatBriefingDateOnly } from "@/components/briefing-public";
import { BriefingEditionBody } from "@/components/briefing-edition-body";
import { getPublicBriefing } from "@/lib/public-briefing";

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

  return (
    <main className="briefing-public-site">
      <PublicHeader />
      <div className="briefing-public-container briefing-edition-container">
        <nav className="briefing-breadcrumb" aria-label="مسار الصفحة">
          <a href="/briefings">الإحاطة اليومية</a><span>/</span><span>العدد {edition.edition_no}</span>
        </nav>

        <header className="briefing-edition-header">
          <div className="briefing-edition-overline">
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

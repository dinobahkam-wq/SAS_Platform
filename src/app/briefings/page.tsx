import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter, PublicHeader } from "@/components/public-site";
import { BriefingArchiveLink } from "@/components/briefing-public";
import { getPublicBriefingArchive } from "@/lib/public-briefing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الإحاطة اليومية",
  description: "سجل يومي موثق للتطورات المتعلقة باليمن ومحيطه الإقليمي والدولي، مع الإحالات إلى مصادرها الأصلية.",
};

export default async function BriefingsArchivePage() {
  let editions: Awaited<ReturnType<typeof getPublicBriefingArchive>> = [];
  let loadError = false;
  try {
    editions = await getPublicBriefingArchive(30);
  } catch {
    loadError = true;
  }

  const [latest, ...older] = editions;

  return (
    <main className="briefing-public-site">
      <PublicHeader />
      <div className="briefing-public-container">
        <header className="briefing-archive-intro">
          <div>
            <span className="briefing-eyebrow">SAS · DAILY BRIEFING</span>
            <h1>الإحاطة اليومية</h1>
            <p>سجل موثق للتطورات والبيانات والمواقف المرتبطة باليمن ومحيطه، مع إحالات مباشرة إلى المصادر الأصلية.</p>
          </div>
          <div className="briefing-archive-principle">
            <span>منهج العرض</span>
            <strong>المعلومة أولًا، والمصدر بجوارها.</strong>
          </div>
        </header>

        <div className="briefing-archive-toolbar">
          <span>الأعداد المنشورة</span>
          <span>{editions.length} عددًا في الأرشيف المعروض</span>
        </div>

        {loadError ? (
          <section className="briefing-empty-public">
            <span className="briefing-empty-icon" aria-hidden="true">!</span>
            <h2>تعذر تحميل الأرشيف</h2>
            <p>لم نتمكن من الاتصال بخدمة الإحاطات الآن. أعد المحاولة بعد قليل.</p>
          </section>
        ) : latest ? (
          <>
            <section className="briefing-latest-edition">
              <div className="briefing-latest-label"><span className="briefing-live-dot" /> أحدث إحاطة منشورة</div>
              <BriefingArchiveLink
                slug={latest.slug}
                title={latest.title_ar}
                date={latest.edition_date}
                editionNo={latest.edition_no}
                featured
              />
              {older.length ? (
                <div className="briefing-archive-list">
                  <div className="briefing-section-heading">
                    <div><span className="briefing-eyebrow">PREVIOUS EDITIONS</span><h2>الأعداد السابقة</h2></div>
                    <span>{older.length} عددًا</span>
                  </div>
                  <div className="briefing-archive-grid">
                    {older.map((edition) => (
                      <BriefingArchiveLink
                        key={edition.slug}
                        slug={edition.slug}
                        title={edition.title_ar}
                        date={edition.edition_date}
                        editionNo={edition.edition_no}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          </>
        ) : (
          <section className="briefing-empty-public">
            <span className="briefing-empty-icon" aria-hidden="true">◷</span>
            <span className="briefing-eyebrow">ARCHIVE NOT YET AVAILABLE</span>
            <h2>لا توجد إحاطات منشورة حتى الآن</h2>
            <p>سيظهر هنا كل عدد بعد اعتماده ونشره. لا تُعرض المسودات أو المواد قيد المراجعة في الأرشيف العام.</p>
            <Link href="/" className="briefing-back-link">العودة إلى منصة ساس ←</Link>
          </section>
        )}
      </div>
      <PublicFooter />
    </main>
  );
}

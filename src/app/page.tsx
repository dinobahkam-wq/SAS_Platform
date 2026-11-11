import {
  EmptyContent,
  PublicFooter,
  PublicHeader,
  SectionHeading,
} from "@/components/public-site";
import { EditorialRail } from "@/components/editorial-rail";
import { getPublishedContent, getPublishedRailSources } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const published = await getPublishedContent({ limit: 36 });
  const sourcesById = await getPublishedRailSources(published.map((item) => item.id));
  const news = published.filter((item) => item.section === "news");
  const analysis = published.filter((item) => item.section === "analysis");
  const research = published.filter((item) => item.section === "research");
  const media = published.filter((item) => item.section === "media");

  return (
    <main className="public-site">
      <PublicHeader />
      <section className="home-compact-intro site-container">
        <div>
          <span className="eyebrow">منصة للإعلام والمعرفة السياسية</span>
          <h1>نفهم الأحداث، <em>ونقرأ ما وراءها.</em></h1>
          <p>أخبار موثقة، وقراءات سياسية، ودراسات تستكشف اليمن ومحيطه الإقليمي والدولي.</p>
        </div>
        <div className="home-compact-actions">
          <a href="/news" className="button button-primary">الأخبار والشؤون الجارية</a>
          <a href="/research" className="button button-secondary">الدراسات والأبحاث</a>
        </div>
      </section>

      {news[0] ? (
        <section className="home-news-flash site-container" aria-label="أحدث مادة منشورة">
          <span className="home-news-flash-label"><i /> أحدث المواد</span>
          <a href={"/content/" + news[0].slug}>{news[0].title}</a>
        </section>
      ) : null}

      <section className="home-section site-container">
        <SectionHeading eyebrow="متابعة يومية" title="الأخبار والشؤون الجارية" href="/news" />
        {news.length ? (
          <>
            <EditorialRail title="التقارير الإخبارية" items={news.filter((item) => item.format === "news_report")} sourcesById={sourcesById} />
            <EditorialRail title="الأخبار الموجزة" items={news.filter((item) => item.format === "news_brief")} sourcesById={sourcesById} />
            <EditorialRail title="البيانات والقرارات الرسمية" items={news.filter((item) => item.format === "official_statement")} sourcesById={sourcesById} />
          </>
        ) : <EmptyContent />}
      </section>

      <section className="home-section home-analysis-section">
        <div className="site-container">
          <SectionHeading eyebrow="قراءة في السياق" title="التحليل والرأي" href="/analysis" />
          {analysis.length ? <EditorialRail title="تحليلات ومقالات" items={analysis} sourcesById={sourcesById} /> : <EmptyContent />}
        </div>
      </section>

      <section className="home-section site-container">
        <SectionHeading eyebrow="معرفة معمقة" title="الدراسات والأبحاث" href="/research" />
        {research.length ? <EditorialRail title="أوراق ودراسات" items={research} sourcesById={sourcesById} /> : <EmptyContent />}
      </section>

      <section className="home-section home-media-section">
        <div className="site-container">
          <SectionHeading eyebrow="المعرفة متعددة الوسائط" title="البرامج والوسائط" href="/media" />
          {media.length ? <EditorialRail title="الإنتاج المرئي والمسموع" items={media} sourcesById={sourcesById} /> : <EmptyContent />}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

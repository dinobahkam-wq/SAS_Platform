import {
  ContentCard,
  EmptyContent,
  PublicFooter,
  PublicHeader,
  SectionHeading,
} from "@/components/public-site";
import { getPublishedContent } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const published = await getPublishedContent({ limit: 36 });
  const news = published.filter((item) => item.section === "news").slice(0, 6);
  const analysis = published.filter((item) => item.section === "analysis").slice(0, 6);
  const research = published.filter((item) => item.section === "research").slice(0, 4);
  const media = published.filter((item) => item.section === "media").slice(0, 4);
  const lead = analysis.find((item) => item.is_featured) || analysis[0] || news[0] || research[0] || media[0] || null;

  return (
    <main className="public-site">
      <PublicHeader />

      <section className="home-hero site-container">
        <div className="home-hero-copy">
          <span className="eyebrow">منصة للإعلام والمعرفة السياسية</span>
          <h1>نفهم الأحداث،<br /><em>ونقرأ ما وراءها.</em></h1>
          <p>
            مساحة معرفية تربط الخبر بسياقه، والتحليل بمصادره، والبحث بأسئلة الواقع.
            نتابع اليمن ومحيطه الإقليمي والدولي، وننظم المعلومات لتصبح أكثر وضوحًا وقابلية للفهم.
          </p>
          <div className="home-hero-actions">
            <a href="/news" className="button button-primary">تابع آخر الأخبار</a>
            <a href="/research" className="button button-secondary">استكشف الدراسات</a>
          </div>
        </div>
        <div className="home-hero-feature">
          {lead ? <ContentCard item={lead} variant="feature" /> : <EmptyContent message="تُعرض هنا أبرز المواد المنشورة فور اعتمادها في غرفة التحرير." />}
        </div>
      </section>

      {news[0] ? (
        <section className="home-news-flash site-container" aria-label="أحدث خبر">
          <span className="home-news-flash-label"><i /> آخر الأخبار</span>
          <a href={"/content/" + news[0].slug}>{news[0].title}</a>
          <span className="home-news-flash-date">{news[0].published_at ? new Date(news[0].published_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Aden" }) : ""}</span>
        </section>
      ) : null}

      <section className="home-section site-container">
        <SectionHeading eyebrow="متابعة يومية" title="الأخبار والشؤون الجارية" href="/news" />
        {news.length ? (
          <div className="home-news-grid">
            {news.slice(0, 4).map((item, index) => <ContentCard item={item} variant={index === 0 ? "feature" : "standard"} key={item.id} />)}
          </div>
        ) : <EmptyContent />}
      </section>

      <section className="home-section home-analysis-section">
        <div className="site-container">
          <SectionHeading eyebrow="قراءة في السياق" title="التحليل والرأي" href="/analysis" />
          {analysis.length ? (
            <div className="home-analysis-grid">
              {analysis.slice(0, 3).map((item, index) => <ContentCard item={item} variant={index === 0 ? "feature" : "standard"} key={item.id} />)}
            </div>
          ) : <EmptyContent />}
        </div>
      </section>

      <section className="home-section site-container">
        <SectionHeading eyebrow="معرفة معمقة" title="الدراسات والأبحاث" href="/research" />
        {research.length ? (
          <div className="home-research-grid">
            {research.slice(0, 3).map((item) => <ContentCard item={item} key={item.id} />)}
          </div>
        ) : <EmptyContent />}
      </section>

      <section className="home-section home-media-section">
        <div className="site-container">
          <SectionHeading eyebrow="المعرفة متعددة الوسائط" title="البرامج والوسائط" href="/media" />
          {media.length ? (
            <div className="home-media-grid">
              {media.slice(0, 3).map((item) => <ContentCard item={item} key={item.id} />)}
            </div>
          ) : <EmptyContent />}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

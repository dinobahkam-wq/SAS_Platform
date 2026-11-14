import {
  EmptyContent,
  PublicFooter,
  PublicHeader,
  SectionHeading,
} from "@/components/public-site";
import { EditorialRail } from "@/components/editorial-rail";
import { KnowledgeRail } from "@/components/knowledge-rail";
import { HomepageLead } from "@/components/homepage-lead";

import { getPublishedContent, getPublishedRailSources } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const published = await getPublishedContent({ limit: 36 });
  const sourcesById = await getPublishedRailSources(published.map((item) => item.id));
  const news = published.filter((item) => item.section === "news");
  const analysis = published.filter((item) => item.section === "analysis");
  const research = published.filter((item) => item.section === "research");
  const media = published.filter((item) => item.section === "media");

  // The lead is chosen from published news only. Prefer an explicitly featured
  // item; otherwise use the newest published news item.
  const lead = news.find((item) => item.is_featured) ?? news[0] ?? null;
  const supporting = lead ? news.filter((item) => item.id !== lead.id).slice(0, 2) : [];
  const leadIds = new Set([lead?.id, ...supporting.map((item) => item.id)].filter(Boolean));
  const remainingNews = news.filter((item) => !leadIds.has(item.id));

  return (
    <main className="public-site">
      <PublicHeader />

      <section className="home-compact-intro home-brand-hero site-container">
        <div className="sas-mukalla-backdrop" aria-hidden="true" />
        <div className="home-intro-copy">
          <h1>مِن الخَبر، <em>إِلى المعرِفَة</em></h1>
          <p>أخبار موثقة، وتحليل سياسي، ودراسات تستكشف اليمن ومحيطه الإقليمي والدولي.</p>
          <div className="home-compact-actions">
            <a href="/news" className="button button-primary">الأخبار والشؤون الجارية</a>
            <a href="/research" className="button button-secondary">الدراسات والأبحاث</a>
          </div>
        </div>
      </section>

      {lead ? (
        <HomepageLead featured={lead} supporting={supporting} sourcesById={sourcesById} />
      ) : null}

      <section className="home-section site-container home-news-section">
        <SectionHeading eyebrow="متابعة يومية" title="الأخبار والشؤون الجارية" href="/news" />
        {remainingNews.length ? (
          <>
            <EditorialRail title="التقارير الإخبارية" items={remainingNews.filter((item) => item.format === "news_report")} sourcesById={sourcesById} />
            <EditorialRail title="الأخبار الموجزة" items={remainingNews.filter((item) => item.format === "news_brief")} sourcesById={sourcesById} />
            <EditorialRail title="البيانات والقرارات الرسمية" items={remainingNews.filter((item) => item.format === "official_statement")} sourcesById={sourcesById} />
          </>
        ) : news.length ? (
          <p className="home-section-note">تظهر أحدث المواد في واجهة المشهد أعلاه. <a href="/news">استعرض أرشيف الأخبار كاملًا</a>.</p>
        ) : <EmptyContent />}
      </section>

      <section className="home-section home-analysis-section">
        <div className="site-container">
          <SectionHeading eyebrow="قراءة في السياق" title="التحليل والرأي" href="/analysis" />
          {analysis.length ? <KnowledgeRail title="تحليلات ومقالات" items={analysis} /> : <EmptyContent />}
        </div>
      </section>

      <section className="home-section site-container home-research-section">
        <SectionHeading eyebrow="معرفة معمقة" title="الدراسات والأبحاث" href="/research" />
        {research.length ? <KnowledgeRail title="أوراق ودراسات" items={research} /> : <EmptyContent />}
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

import Link from "next/link";
import {
  EmptyContent,
  PublicFooter,
  PublicHeader,
  SectionHeading,
} from "@/components/public-site";
import { EditorialRail } from "@/components/editorial-rail";
import { KnowledgeRail } from "@/components/knowledge-rail";
import { getPublishedContent } from "@/lib/public-content";
import { getPublicBriefing, getPublicBriefingArchive } from "@/lib/public-briefing";
import { HomeBriefingShowcase } from "@/components/home-briefing-showcase";
import { VisualKnowledgeFeature, CivicKnowledgeFeature } from "@/components/visual-knowledge-feature";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [analysis, research, media] = await Promise.all([
    getPublishedContent({ section: "analysis", limit: 12 }),
    getPublishedContent({ section: "research", limit: 12 }),
    getPublishedContent({ section: "media", limit: 24 }),
  ]);

  // Daily briefing is the editorial flagship. A temporary archive outage must
  // not prevent the other independent knowledge products from loading.
  let briefings: Awaited<ReturnType<typeof getPublicBriefingArchive>> = [];
  let latestEdition: Awaited<ReturnType<typeof getPublicBriefing>> = null;
  let briefingUnavailable = false;
  try {
    briefings = await getPublicBriefingArchive(3);
    if (briefings[0]) {
      try {
        latestEdition = await getPublicBriefing(briefings[0].slug);
      } catch {
        // Archive remains usable if the edition detail is temporarily unavailable.
      }
    }
  } catch {
    briefingUnavailable = true;
  }

  const insights = [...analysis, ...research]
    .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""))
    .slice(0, 9);
  const visual = media.filter((item) => ["infographic", "photo_gallery"].includes(item.format));
  const programs = media.filter((item) => ["video", "podcast", "interview"].includes(item.format));

  return (
    <main className="public-site">
      <PublicHeader />

      <section className="home-compact-intro home-brand-hero site-container">
        <div className="home-intro-copy">
          <h1>مِن الخَبر، <em>إِلى المعرِفَة</em></h1>
          <p>إحاطة سياسية موثقة، وتحليلات ودراسات، ومعرفة بصرية وفيديوهات تفسر الأحداث وسياقاتها.</p>
          <div className="home-compact-actions">
            <Link href="/briefings" className="button button-primary">استعرض الإحاطة اليومية</Link>
            <Link href="/insights" className="button button-secondary">التحليل والدراسات</Link>
          </div>
        </div>
      </section>

      <section className="home-section site-container sas-product-section sas-product-section--flagship">
        <SectionHeading eyebrow="المنتج الرئيسي · رصد وتفسير" title="الإحاطة اليومية" href="/briefings" linkLabel="جميع الإحاطات" />
        <HomeBriefingShowcase
          latest={briefings[0] ?? null}
          briefing={latestEdition}
          previous={briefings.slice(1, 3)}
          unavailable={briefingUnavailable}
        />
      </section>

      <section className="home-section home-analysis-section sas-product-section">
        <div className="site-container">
          <SectionHeading eyebrow="قراءة معمّقة" title="التحليل والدراسات" href="/insights" />
          {insights.length
            ? <KnowledgeRail title="أحدث التحليلات والدراسات" items={insights} />
            : <EmptyContent message="لا توجد تحليلات أو دراسات منشورة حتى الآن." />}
        </div>
      </section>

      <section className="home-section site-container sas-product-section">
        <SectionHeading eyebrow="السياسة بلغة الصورة" title="المعرفة البصرية" href="/visual-knowledge" />
        <div style={{ display: "grid", gap: 18 }}><CivicKnowledgeFeature compact /><VisualKnowledgeFeature compact /></div>
        {visual.length ? (
          <div style={{ marginTop: 24 }}><EditorialRail title="مواد بصرية أخرى" items={visual} /></div>
        ) : null}
      </section>

      <section className="home-section home-media-section sas-product-section">
        <div className="site-container">
          <SectionHeading eyebrow="ساس مرئيًا" title="الفيديو والبرامج" href="/programs" />
          {programs.length
            ? <EditorialRail title="مقاطع وبرامج سياسية" items={programs} />
            : <EmptyContent message="ستظهر هنا المقاطع السياسية والحوارات والبرامج فور نشرها." />}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

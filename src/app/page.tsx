import Link from "next/link";
import { SasHeroRotator } from "@/components/sas-hero-rotator";
import {
  EmptyContent,
  PublicFooter,
  PublicHeader,
  SectionHeading,
} from "@/components/public-site";
import { ProgramsCatalog } from "@/components/programs-catalog";
import { getProgramsCatalogItems } from "@/lib/programs-catalog-data";
import { HomeInsightsShowcase } from "@/components/home-insights-showcase";
import { getPublishedContent } from "@/lib/public-content";
import { getPublicBriefing, getPublicBriefingArchive } from "@/lib/public-briefing";
import { HomeBriefingShowcase } from "@/components/home-briefing-showcase";
import { getPublishedBriefingAudio } from "@/lib/briefing-audio";
import { VisualKnowledgePortal } from "@/components/visual-knowledge-portal";

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

  const briefingAudio = briefings[0]
    ? await getPublishedBriefingAudio(briefings[0].slug).catch(() => null)
    : null;

  const insights = [...analysis, ...research]
    .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""))
    .slice(0, 9);
  const programs = getProgramsCatalogItems(media);

  return (
    <main className="public-site">
      <PublicHeader />

      <section className="home-compact-intro home-brand-hero sas-mukalla-hero sas-split-hero site-container">
        <SasHeroRotator />
        <div className="home-intro-copy">
          <h1 className="sas-slogan-stroke" aria-label="مِن الخَبر، إِلى المعرِفَة"><span className="sas-slogan-segment sas-slogan-segment--first" data-text="مِن الخَبر،" aria-hidden="true">مِن الخَبر،</span>{" "}<em className="sas-slogan-segment sas-slogan-segment--second" data-text="إِلى المعرِفَة" aria-hidden="true">إِلى المعرِفَة</em></h1>
          <p>إحاطة سياسية موثقة، وتحليلات ودراسات، ومعرفة بصرية وفيديوهات تفسر الأحداث وسياقاتها.</p>
          <div className="home-compact-actions">
            <Link href="/briefings" className="button button-primary sas-cta sas-cta--primary">استعرض الإحاطة اليومية</Link>
            <Link href="/insights" className="button button-secondary sas-cta sas-cta--secondary">التحليل والدراسات</Link>
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
          audio={briefingAudio}
        />
      </section>

      <section className="home-section home-analysis-section sas-product-section">
        <div className="site-container">
          {insights.length
            ? <HomeInsightsShowcase items={insights} />
            : <>
                <SectionHeading eyebrow="قراءة معمّقة" title="التحليل والدراسات" href="/insights" />
                <EmptyContent message="لا توجد تحليلات أو دراسات منشورة حتى الآن." />
              </>}
        </div>
      </section>

      <section className="home-section site-container sas-product-section" aria-label="بوابة المعرفة البصرية">
        <VisualKnowledgePortal />
      </section>

      <section className="home-section home-media-section sas-product-section">
        <div className="site-container">
          <SectionHeading eyebrow="ساس مرئيًا" title="الفيديو والبرامج" href="/programs" />
          {programs.length
            ? <ProgramsCatalog items={programs.slice(0, 4)} />
            : <EmptyContent message="ستظهر هنا المقاطع السياسية والحوارات والبرامج فور نشرها." />}
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

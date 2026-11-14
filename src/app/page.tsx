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
import { getPublicBriefingArchive } from "@/lib/public-briefing";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [analysis, research, media] = await Promise.all([
    getPublishedContent({ section: "analysis", limit: 12 }),
    getPublishedContent({ section: "research", limit: 12 }),
    getPublishedContent({ section: "media", limit: 24 }),
  ]);

  // Daily briefing is the editorial flagship. A temporary archive outage must
  // not prevent the other independent knowledge products from loading.
  let latestBriefing: Awaited<ReturnType<typeof getPublicBriefingArchive>>[number] | null = null;
  let briefingUnavailable = false;
  try {
    const [latest] = await getPublicBriefingArchive(1);
    latestBriefing = latest ?? null;
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
        <div className="sas-flagship-briefing">
          <div className="sas-flagship-description">
            <span className="sas-product-kicker">تطورات اليوم، في سياقها</span>
            <h3>ماذا حدث؟ ما الذي تغيّر؟ وما الذي يستحق المتابعة؟</h3>
            <p>إحاطة تحريرية منتقاة لأهم التطورات السياسية، مدعومة بالمصادر الأصلية والبيانات ذات الصلة.</p>
            <Link href="/briefings" className="sas-product-link">الدخول إلى الإحاطة اليومية <span aria-hidden="true">←</span></Link>
          </div>
          <div className="sas-flagship-edition">
            <span className="sas-product-kicker">أحدث إصدار</span>
            {latestBriefing ? (
              <>
                <h3>{latestBriefing.title_ar}</h3>
                <time dateTime={latestBriefing.edition_date}>{latestBriefing.edition_date}</time>
                <Link href={"/briefings/" + encodeURIComponent(latestBriefing.slug)}>قراءة العدد <span aria-hidden="true">←</span></Link>
              </>
            ) : (
              <p>{briefingUnavailable
                ? "تعذر جلب الأعداد المنشورة حاليًا. يمكنك فتح أرشيف الإحاطات والمحاولة مجددًا."
                : "لا توجد إحاطة منشورة حتى الآن. سيظهر هنا أحدث عدد فور نشره."}</p>
            )}
          </div>
        </div>
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
        {visual.length
          ? <EditorialRail title="إنفوجرافيك ومواد بصرية" items={visual} />
          : <EmptyContent message="سيظهر هنا الإنفوجرافيك والمواد المعرفية البصرية بعد نشرها." />}
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

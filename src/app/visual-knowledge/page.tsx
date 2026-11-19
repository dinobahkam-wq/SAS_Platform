import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader, PublicFooter } from "@/components/public-site";
import { VisualKnowledgeShowcase } from "@/components/visual-knowledge-feature";
import { EditorialRail } from "@/components/editorial-rail";
import { getPublishedContent, getPublishedRailSources } from "@/lib/public-content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "المعرفة البصرية",
  description: "تصورات معرفية تفاعلية وإنفوجرافيك ومواد مرئية موثقة تساعد على فهم التحولات السياسية في اليمن.",
};

export default async function VisualKnowledgePage() {
  const all = await getPublishedContent({ section: "media", limit: 48 });
  const items = all.filter((item) => item.format === "infographic" || item.format === "photo_gallery");
  const sourceMap = items.length ? await getPublishedRailSources(items.map((item) => item.id)) : {};
  return (
    <main className="public-site">
      <PublicHeader />
      <section className="section-landing-intro site-container">
        <div>
          <span className="eyebrow">من الخبر إلى المعرفة</span>
          <h1>المعرفة البصرية</h1>
          <p>تصورات تفاعلية وإنفوجرافيك موثق تشرح الأحداث وتحولاتها، وتربط الوقائع بالمصادر وسياقها.</p>
        </div>
        <Link href="/" className="section-back-link">العودة إلى الرئيسية</Link>
      </section>
      <div className="section-landing-content site-container" style={{ paddingBottom: 70 }}>
        <div className="site-section-heading">
          <div><span className="eyebrow">منصة معرفية تفاعلية</span><h2>الإصدارات المعرفية</h2></div>
        </div>
        <p className="sas-visual-showcase-intro">معرفة سياسية بصرية تجمع بين شرح المفاهيم واستكشاف الوقائع، وتتيح الانتقال إلى كل مادة تفاعلية كاملة.</p>
        <VisualKnowledgeShowcase />
        {items.length ? (
          <div style={{ marginTop: 44 }}>
            <EditorialRail title="إنفوجرافيك ومواد بصرية أخرى" items={items} sourcesById={sourceMap} />
          </div>
        ) : null}
      </div>
      <PublicFooter />
    </main>
  );
}

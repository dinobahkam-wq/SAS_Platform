import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader, PublicFooter } from "@/components/public-site";
import { VisualKnowledgeGallery } from "@/components/visual-knowledge-gallery";
import { getPublishedContent } from "@/lib/public-content";
import "./visual-atlas.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "المعرفة البصرية",
  description: "تصورات معرفية تفاعلية وإنفوجرافيك ومواد مرئية موثقة تساعد على فهم التحولات السياسية في اليمن.",
};

export default async function VisualKnowledgePage() {
  const all = await getPublishedContent({ section: "media", limit: 48 });
  const items = all.filter((item) => item.format === "infographic" || item.format === "photo_gallery");
  return (
    <main className="public-site">
      <PublicHeader />
      <section className="sas-visual-atlas-intro site-container">
        <div>
          <span className="eyebrow">الأطلس البصري · منصة ساس</span>
          <h1>المعرفة البصرية</h1>
          <p>معرض للخرائط والمخططات والإنفوغراف والبطاقات المعرفية المنشورة؛ لفهم الوقائع والعلاقات والتحولات بلغة الصورة.</p>
        </div>
        <Link href="/" className="section-back-link">العودة إلى الرئيسية</Link>
      </section>
      <div className="section-landing-content site-container sas-visual-atlas-content" style={{ paddingBottom: 70 }}>
        <VisualKnowledgeGallery items={items} />
      </div>
      <PublicFooter />
    </main>
  );
}

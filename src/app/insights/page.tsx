import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter, PublicHeader, SectionHeading, EmptyContent } from "@/components/public-site";
import { KnowledgeRail } from "@/components/knowledge-rail";
import { getPublishedContent } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "التحليل والدراسات",
  description: "تحليلات سياسية ومقالات رأي ودراسات وأوراق سياسات تستكشف دلالات الأحداث وسياقاتها.",
};

export default async function InsightsPage() {
  const [analysis, research] = await Promise.all([
    getPublishedContent({ section: "analysis", limit: 30 }),
    getPublishedContent({ section: "research", limit: 30 }),
  ]);
  return (
    <main className="public-site">
      <PublicHeader />
      <section className="section-landing-intro site-container">
        <div>
          <span className="eyebrow">المعرفة المتعمقة</span>
          <h1>التحليل والدراسات</h1>
          <p>قراءات تفسر ما وراء التطورات السياسية، إلى جانب أوراق سياسات ودراسات تعتمد على المصادر والأدلة.</p>
        </div>
        <Link href="/" className="section-back-link">العودة إلى الرئيسية</Link>
      </section>
      <div className="section-landing-content site-container sas-product-archive">
        <SectionHeading eyebrow="تفسير الأحداث" title="التحليل والرأي" href="/analysis" />
        {analysis.length ? <KnowledgeRail title="أحدث التحليلات والمقالات" items={analysis} /> : <EmptyContent message="لا توجد تحليلات أو مقالات رأي منشورة حتى الآن." />}
        <SectionHeading eyebrow="بحث معمق" title="الدراسات والأبحاث" href="/research" />
        {research.length ? <KnowledgeRail title="الأوراق والدراسات المنشورة" items={research} /> : <EmptyContent message="لا توجد دراسات منشورة حتى الآن." />}
      </div>
      <PublicFooter />
    </main>
  );
}

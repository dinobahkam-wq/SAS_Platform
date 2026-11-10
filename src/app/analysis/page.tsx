import type { Metadata } from "next";
import { SectionLanding } from "@/components/section-landing";
import { getPublishedContent } from "@/lib/public-content";

export const metadata: Metadata = {
  title: "التحليل والرأي",
  description: "قراءات سياسية واستراتيجية تضع الوقائع في سياقاتها الأوسع.",
};

export default async function AnalysisPage() {
  const items = await getPublishedContent({ section: "analysis", limit: 30 });
  return (
    <SectionLanding
      eyebrow="التحليل والرأي"
      title="التحليل والرأي"
      description="قراءات سياسية واستراتيجية ومقالات رأي تربط الوقائع ببناها وسياقاتها، وتفحص اتجاهات الأحداث ومساراتها."
      items={items}
    />
  );
}

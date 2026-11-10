import type { Metadata } from "next";
import { SectionLanding } from "@/components/section-landing";
import { getPublishedContent } from "@/lib/public-content";

export const metadata: Metadata = {
  title: "الدراسات والأبحاث",
  description: "دراسات وأوراق بحثية تدعم الفهم وصناعة القرار.",
};

export default async function ResearchPage() {
  const items = await getPublishedContent({ section: "research", limit: 30 });
  return (
    <SectionLanding
      eyebrow="الدراسات والأبحاث"
      title="الدراسات والأبحاث"
      description="أوراق بحثية ودراسات استراتيجية وأوراق سياسات، تُبنى على مصادر موثقة وأسئلة مرتبطة بالواقع."
      items={items}
    />
  );
}

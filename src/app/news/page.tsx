import type { Metadata } from "next";
import { SectionLanding } from "@/components/section-landing";
import { getPublishedContent } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الأخبار والشؤون الجارية",
  description: "متابعة منظمة للأخبار والتطورات المرتبطة باليمن ومحيطه الإقليمي والدولي.",
};

export default async function NewsPage() {
  const items = await getPublishedContent({ section: "news", limit: 30 });
  return (
    <SectionLanding
      eyebrow="الأخبار والشؤون الجارية"
      title="الأخبار"
      description="متابعة منظمة للأحداث والتطورات، مع إسناد واضح للمصادر والتوقيت وربط كل خبر بسياقه."
      items={items}
    />
  );
}

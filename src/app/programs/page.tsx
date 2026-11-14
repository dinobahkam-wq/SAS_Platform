import type { Metadata } from "next";
import { SectionLanding } from "@/components/section-landing";
import { getPublishedContent } from "@/lib/public-content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "الفيديو والبرامج",
  description: "مقاطع تفسيرية وحوارات سياسية مع الباحثين والمتخصصين وبرامج مرئية ومسموعة.",
};

export default async function ProgramsPage() {
  const all = await getPublishedContent({ section: "media", limit: 48 });
  const items = all.filter((item) => ["video", "podcast", "interview"].includes(item.format));
  return (
    <SectionLanding
      eyebrow="ساس مرئيًا"
      title="الفيديو والبرامج"
      description="أسئلة سياسية يجيب عنها مختصون، وحوارات قصيرة تضع الأحداث في سياقها وتقدم وجهات نظر واضحة الإسناد."
      items={items}
    />
  );
}

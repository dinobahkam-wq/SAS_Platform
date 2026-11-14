import type { Metadata } from "next";
import { SectionLanding } from "@/components/section-landing";
import { getPublishedContent } from "@/lib/public-content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "المعرفة البصرية",
  description: "إنفوجرافيك ومفاهيم سياسية وشروحات مرئية تربط المعرفة بالأحداث الجارية.",
};

export default async function VisualKnowledgePage() {
  const all = await getPublishedContent({ section: "media", limit: 48 });
  const items = all.filter((item) => item.format === "infographic" || item.format === "photo_gallery");
  return (
    <SectionLanding
      eyebrow="السياسة بلغة الصورة"
      title="المعرفة البصرية"
      description="مفاهيم العلوم السياسية والأنظمة والمؤسسات والعلاقات الدولية، تقدم في إنفوجرافيك ومواد بصرية مرتبطة بالأحداث."
      items={items}
    />
  );
}

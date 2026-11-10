import type { Metadata } from "next";
import { SectionLanding } from "@/components/section-landing";
import { getPublishedContent } from "@/lib/public-content";

export const metadata: Metadata = {
  title: "البرامج والوسائط",
  description: "حوارات وبرامج ومواد مرئية وصوتية ومحتوى معرفي متعدد الوسائط.",
};

export default async function MediaPage() {
  const items = await getPublishedContent({ section: "media", limit: 30 });
  return (
    <SectionLanding
      eyebrow="البرامج والوسائط"
      title="البرامج والوسائط"
      description="حوارات وبرامج ومواد مرئية وصوتية وإنفوغراف، توسّع الوصول إلى المعرفة السياسية."
      items={items}
    />
  );
}

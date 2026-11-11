import Link from "next/link";
import type { PublicContentItem } from "@/lib/public-content";
import { getPublishedRailSources } from "@/lib/public-content";
import { formatLabel } from "@/lib/content";
import { EditorialRail } from "@/components/editorial-rail";
import { EmptyContent, PublicFooter, PublicHeader } from "@/components/public-site";

const newsFormats = [
  { key: "news_report", label: "التقارير الإخبارية" },
  { key: "news_brief", label: "الأخبار الموجزة" },
  { key: "official_statement", label: "البيانات والقرارات الرسمية" },
];

export async function SectionLanding({
  title, eyebrow, description, items,
}: {
  title: string;
  eyebrow: string;
  description: string;
  items: PublicContentItem[];
}) {
  const sourceMap = await getPublishedRailSources(items.map((item) => item.id));
  const grouped = items.reduce<Record<string, PublicContentItem[]>>((groups, item) => {
    (groups[item.format] ??= []).push(item);
    return groups;
  }, {});
  const configured = items[0]?.section === "news"
    ? newsFormats
    : Object.keys(grouped).map((key) => ({ key, label: formatLabel(key) }));
  return (
    <main className="public-site">
      <PublicHeader />
      <section className="section-landing-intro site-container">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <Link href="/" className="section-back-link">العودة إلى الرئيسية</Link>
      </section>
      <div className="section-landing-content site-container">
        {items.length
          ? configured.filter((group) => grouped[group.key]?.length).map((group) => (
            <EditorialRail key={group.key} title={group.label}
              items={grouped[group.key]} sourcesById={sourceMap} />
          ))
          : <EmptyContent />}
      </div>
      <PublicFooter />
    </main>
  );
}

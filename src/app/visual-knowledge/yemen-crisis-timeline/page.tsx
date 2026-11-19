import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter, PublicHeader } from "@/components/public-site";
import { YemenCrisisTimeline } from "@/components/yemen-crisis-timeline";
import { yemenTimeline } from "@/data/visual-knowledge/yemen-crisis-timeline";

export const metadata: Metadata = {
  title: "اليمن: محطات أعادت تشكيل الأزمة (2014–2022)",
  description: "معرفة بصرية تفاعلية توثق ثماني محطات سياسية وعسكرية ومؤسسية ودبلوماسية في الأزمة اليمنية، بمراجع أصلية لكل محطة.",
  openGraph: {
    title: "اليمن: محطات أعادت تشكيل الأزمة | المعرفة البصرية — ساس",
    description: "خط زمني تفاعلي موثق للأزمة اليمنية بين 2014 و2022.",
    type: "article",
  },
};

export default function YemenTimelinePage() {
  return (
    <main className="public-site">
      <PublicHeader />
      <nav className="site-container" aria-label="مسار التنقل" style={{ paddingTop: 24, paddingBottom: 20, fontSize: 12 }}>
        <Link href="/" style={{ color: "var(--muted)" }}>الرئيسية</Link>
        <span aria-hidden="true" style={{ padding: "0 9px", color: "var(--muted)" }}>/</span>
        <Link href="/visual-knowledge" style={{ color: "var(--muted)" }}>المعرفة البصرية</Link>
        <span aria-hidden="true" style={{ padding: "0 9px", color: "var(--muted)" }}>/</span>
        <span aria-current="page">محطات الأزمة اليمنية</span>
      </nav>
      <div className="site-container" style={{ paddingBottom: 70 }}>
        <YemenCrisisTimeline />
      </div>
      <PublicFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LearningResource",
          headline: "اليمن: محطات أعادت تشكيل الأزمة (2014–2022)",
          inLanguage: "ar",
          educationalUse: "historical timeline",
          publisher: { "@type": "Organization", name: "منصة ساس للإعلام والدراسات" },
          temporalCoverage: "2014/2022",
          citation: yemenTimeline.flatMap((entry) => entry.sources.map((source) => source.url)),
        }).replace(/</g, "\\u003c"),
      }}/>
    </main>
  );
}

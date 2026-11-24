import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader, PublicFooter } from "@/components/public-site";
import { ProgramsCatalog } from "@/components/programs-catalog";
import { getPublishedContent } from "@/lib/public-content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "الفيديو والبرامج",
  description: "مكتبة مرئية لبرامج ساس وحواراتها ومقاطعها السياسية.",
};

export default async function ProgramsPage() {
  const all = await getPublishedContent({ section: "media", limit: 48 });
  const items = all.filter(item => ["video","interview","podcast"].includes(item.format));
  return (
    <main className="public-site">
      <PublicHeader />
      <section className="section-landing-intro site-container">
        <div>
          <span className="eyebrow">ساس مرئيًا</span>
          <h1>الفيديو والبرامج</h1>
          <p>حوارات ومقاطع سياسية تضع الأحداث في سياقها.</p>
        </div>
        <Link href="/" className="section-back-link">العودة إلى الرئيسية</Link>
      </section>
      <div className="section-landing-content site-container">
        <ProgramsCatalog items={items} />
      </div>
      <PublicFooter />
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader, PublicFooter } from "@/components/public-site";
import { ProgramsCatalog } from "@/components/programs-catalog";
import { getPublishedContent, type PublicContentItem } from "@/lib/public-content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "الفيديو والبرامج",
  description: "مكتبة مرئية لبرامج ساس وحواراتها ومقاطعها السياسية.",
};

export default async function ProgramsPage() {
  const all = await getPublishedContent({ section: "media", limit: 48 });
  const items = all.filter(item => ["video","interview","podcast"].includes(item.format));

  // Release-stage featured item: visible only in this branch until the first
  // editorial record is published. The canonical DB record takes precedence.
  const firstVideo: PublicContentItem = {
    id: "5b7cdb68-c998-4919-b0f0-0dcad0d5e817",
    slug: "political-minutes-mohammed-salem-bafaqir",
    title: "دقائق سياسية | محمد سالم بافقير",
    section: "media", format: "video",
    excerpt: "محمد سالم بافقير، محلل سياسي ورئيس قسم الأبحاث في منظمة سائس.",
    body: { version: 1, blocks: [], external_video_url: "https://www.facebook.com/share/v/1V4X7o4nGs/" },
    cover_url: "https://budsfbyrdpjkobqstpyr.supabase.co/storage/v1/object/public/sas-public-media/programs/political-minutes/mohammed-salem-bafaqir-cover.png.png",
    cover_alt: "غلاف دقائق سياسية مع محمد سالم بافقير",
    cover_caption: null,
    published_at: null,
    is_featured: true,
    cover_asset_id: null,
    category_id: null,
    seo_title: null,
    seo_description: null,
  };
  const catalog = items.some(item => item.slug === firstVideo.slug)
    ? items : [firstVideo, ...items];
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
        <ProgramsCatalog items={catalog} />
      </div>
      <PublicFooter />
    </main>
  );
}

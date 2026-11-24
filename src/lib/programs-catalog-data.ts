import type { PublicContentItem } from "@/lib/public-content";

/** Preview-only catalog entry. Remove when the first video is published via CMS.
 * Shared by the home section and /programs to prevent divergent empty states.
 */
export const stagedPoliticalMinutes: PublicContentItem = {
  id: "5b7cdb68-c998-4919-b0f0-0dcad0d5e817",
  slug: "political-minutes-mohammed-salem-bafaqir",
  title: "دقائق سياسية | محمد سالم بافقير",
  section: "media",
  format: "video",
  excerpt: "محمد سالم بافقير، محلل سياسي ورئيس قسم الأبحاث في منظمة سائس.",
  body: {
    version: 1,
    blocks: [],
    external_video_url: "https://www.facebook.com/share/v/1V4X7o4nGs/",
  },
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

/** Return published video content and a shared preview fallback without duplicates. */
export function getProgramsCatalogItems(items: PublicContentItem[]): PublicContentItem[] {
  const published = items.filter(item =>
    item.section === "media" && ["video", "interview", "podcast"].includes(item.format)
  );
  return published.some(item => item.slug === stagedPoliticalMinutes.slug)
    ? published
    : [stagedPoliticalMinutes, ...published];
}

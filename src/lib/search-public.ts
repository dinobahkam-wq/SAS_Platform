import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getPublicBriefing, getPublicBriefingArchive } from "@/lib/public-briefing";

export type PublicSearchResult = {
  kind: "analysis" | "research" | "media" | "news" | "briefing" | "visual";
  title: string;
  description: string;
  href: string;
  date?: string;
};

export const searchKinds = [
  { id: "all", label: "جميع النتائج" },
  { id: "briefing", label: "الإحاطات" },
  { id: "analysis", label: "التحليل" },
  { id: "research", label: "الدراسات" },
  { id: "visual", label: "المعرفة البصرية" },
  { id: "media", label: "الفيديو والبرامج" },
] as const;

export function normalizeSearchTerm(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[\u0640]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90);
}
export function matchesSearch(text: string, query: string) {
  const normalized = normalizeSearchTerm(text).toLocaleLowerCase("ar");
  return query.split(" ").filter(Boolean).every((token) => normalized.includes(token.toLocaleLowerCase("ar")));
}

const visualItems: PublicSearchResult[] = [
  {
    kind: "visual",
    title: "ما الدولة؟ وكيف تعمل أنظمة الحكم؟",
    description: "الدولة والحكومة والنظام السياسي وأركان الدولة والفيدرالية والأنظمة الرئاسية والبرلمانية وشبه الرئاسية.",
    href: "/visual-knowledge/state-and-government",
  },
  {
    kind: "visual",
    title: "اليمن: محطات أعادت تشكيل الأزمة",
    description: "خط زمني تفاعلي لأحداث الأزمة اليمنية من 2014 إلى 2022 مع مصادرها.",
    href: "/visual-knowledge/yemen-crisis-timeline",
  },
];

export async function searchPublicContent(query: string): Promise<{ results: PublicSearchResult[]; partialError: boolean }> {
  const q = normalizeSearchTerm(query);
  if (q.length < 2) return { results: [], partialError: false };
  const results: PublicSearchResult[] = [];
  let partialError = false;

  // Separate, parameterized Supabase queries avoid composing untrusted user
  // strings into a PostgREST OR filter. Search *published* records only.
  try {
    const supabase = await createClient();
    const pattern = "%" + q.replace(/[%_\\]/g, "\\$&") + "%";
    const select = "title,slug,excerpt,section,published_at";
    const [titles, excerpts] = await Promise.all([
      supabase.from("content_items").select(select).eq("status", "published").ilike("title", pattern).limit(48),
      supabase.from("content_items").select(select).eq("status", "published").ilike("excerpt", pattern).limit(48),
    ]);
    if (titles.error || excerpts.error) throw titles.error ?? excerpts.error;
    const bySlug = new Map((([...(titles.data ?? []), ...(excerpts.data ?? [])])) .map(item => [item.slug, item]));
    for (const item of bySlug.values()) {
      results.push({
        kind: item.section,
        title: item.title,
        description: item.excerpt ?? "مادة منشورة ضمن أرشيف ساس.",
        href: "/content/" + encodeURIComponent(item.slug),
        date: item.published_at ?? undefined,
      });
    }
  } catch (error) {
    console.error("[SAS search] content search unavailable", error);
    partialError = true;
  }

  // Search public archived edition titles and verified published snapshots,
  // never draft editions or unpublished developments.
  try {
    const editions = await getPublicBriefingArchive(30);
    const matching = await Promise.all(editions.map(async (edition) => {
      if (matchesSearch(edition.title_ar + " " + edition.edition_date, q)) return edition;
      try {
        const briefing = await getPublicBriefing(edition.slug);
        if (!briefing) return null;
        const haystack = briefing.developments
          .map(item => item.headline_ar + " " + item.summary_ar + " " + (item.location_text ?? ""))
          .join(" ");
        return matchesSearch(haystack, q) ? edition : null;
      } catch { return null; }
    }));
    for (const edition of matching) {
      if (!edition) continue;
      results.push({
        kind: "briefing",
        title: edition.title_ar,
        description: "العدد " + edition.edition_no + " — " + edition.edition_date + " | الإحاطة اليومية الموثقة.",
        href: "/briefings/" + encodeURIComponent(edition.slug),
        date: edition.edition_date,
      });
    }
  } catch (error) {
    console.error("[SAS search] briefing archive unavailable", error);
    partialError = true;
  }

  results.push(...visualItems.filter(item => matchesSearch(item.title + " " + item.description, q)));
  results.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  return { results: results.slice(0, 100), partialError };
}

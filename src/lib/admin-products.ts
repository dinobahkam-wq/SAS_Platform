/** Maps legacy DB sections/formats to the four current public products.
 * This view mapping is non-destructive: old rows keep their original values.
 * Daily briefings belong to dedicated versioned briefing tables, NOT content_items.
 */
export type AdminEditorialProduct = "analysis" | "visual" | "programs" | "legacy";

export const adminEditorialProducts = [
  { id: "analysis", label: "التحليل والدراسات", description: "الأوراق والتقديرات والتحليلات والدراسات" },
  { id: "visual", label: "المعرفة البصرية", description: "الإنفوغراف والمواد المعرفية المصورة" },
  { id: "programs", label: "الفيديو والبرامج", description: "اللقاءات والحلقات والبودكاست" },
  { id: "legacy", label: "الأرشيف السابق", description: "الأخبار ومقالات الرأي والمواد التجريبية القديمة" },
] as const;

export function productForContent(section: string, format: string): AdminEditorialProduct {
  if (section === "news" || format === "opinion" || format === "news_brief" || format === "news_report" || format === "official_statement") return "legacy";
  if (format === "infographic" || format === "photo_gallery") return "visual";
  if (section === "media") return "programs";
  if (section === "analysis" || section === "research") return "analysis";
  return "legacy";
}

export const newEditorialFormats = [
  { section: "analysis", format: "analysis", label: "تحليل سياسي" },
  { section: "research", format: "research_paper", label: "ورقة بحثية" },
  { section: "research", format: "policy_brief", label: "ورقة سياسات" },
  { section: "research", format: "study_report", label: "تقرير دراسة" },
  { section: "media", format: "infographic", label: "إنفوغراف" },
  { section: "media", format: "photo_gallery", label: "معرض بصري" },
  { section: "media", format: "video", label: "فيديو" },
  { section: "media", format: "podcast", label: "بودكاست" },
  { section: "media", format: "interview", label: "لقاء مرئي أو مسموع" },
] as const;

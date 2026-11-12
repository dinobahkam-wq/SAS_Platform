import type { Json } from "@/types/database.types";

export const sections = [
  { value: "news", label: "الأخبار والشؤون الجارية" },
  { value: "analysis", label: "التحليل والرأي" },
  { value: "research", label: "الدراسات والأبحاث" },
  { value: "media", label: "البرامج والوسائط" },
] as const;

export const formats = [
  { value: "news_brief", label: "خبر موجز", section: "news" },
  { value: "news_report", label: "تقرير إخباري", section: "news" },
  { value: "official_statement", label: "بيان رسمي", section: "news" },
  { value: "analysis", label: "تحليل", section: "analysis" },
  { value: "opinion", label: "رأي", section: "analysis" },
  { value: "interview", label: "مقابلة", section: "analysis" },
  { value: "research_paper", label: "ورقة بحثية", section: "research" },
  { value: "policy_brief", label: "ورقة سياسات", section: "research" },
  { value: "study_report", label: "تقرير دراسة", section: "research" },
  { value: "video", label: "فيديو", section: "media" },
  { value: "podcast", label: "بودكاست", section: "media" },
  { value: "interview", label: "مقابلة مرئية / صوتية", section: "media" },
  { value: "infographic", label: "إنفوغراف", section: "media" },
  { value: "photo_gallery", label: "معرض صور", section: "media" },
] as const;

export function slugify(value: string) {
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function textToBody(value: string): Json {
  const blocks = value
    .split(/\n\s*\n/g)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => ({ type: "paragraph", text }));

  return { version: 1, blocks };
}

export function bodyToText(value: Json | null) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const blocks = value.blocks;
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((block) => {
      if (block && typeof block === "object" && "text" in block && typeof block.text === "string") {
        return block.text;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
}

export function sectionLabel(value: string) {
  return sections.find((item) => item.value === value)?.label ?? value;
}

export function formatLabel(value: string) {
  return formats.find((item) => item.value === value)?.label ?? value;
}

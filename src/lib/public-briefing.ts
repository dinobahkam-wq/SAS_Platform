import "server-only";

import { createClient } from "@/lib/supabase/server";

export type BriefingSource = {
  source_name: string;
  source_title: string | null;
  organization_name: string | null;
  source_type: string;
  source_url: string | null;
  source_reference: string | null;
  publication_date: string | null;
  published_at: string | null;
  language_code: string | null;
  source_role: string;
  source_excerpt: string | null;
  attribution_note: string | null;
  accessed_at: string | null;
};

export type BriefingDevelopment = {
  order: number;
  headline_ar: string;
  summary_ar: string;
  what_changed_ar: string | null;
  why_it_matters_ar: string | null;
  context_ar: string | null;
  category: string;
  information_class: string;
  verification_status: string;
  verification_note_ar: string | null;
  occurred_at: string | null;
  occurred_on: string | null;
  time_precision: string;
  location_text: string | null;
  geographic_scope: string;
  sources: BriefingSource[];
};

export type BriefingSummaryItem = {
  order: number;
  text_ar: string;
  headline_ar: string;
  information_class: string;
  verification_status: string;
  sources: BriefingSource[];
};

export type PublicBriefing = {
  edition: {
    edition_no: number;
    slug: string;
    edition_date: string;
    edition_type: string;
    status: string;
  };
  revision: {
    revision_no: number;
    revision_kind: string;
    title_ar: string;
    analysis_ar: string;
    methodology_ar: string;
    coverage_note_ar: string;
    window_start: string;
    window_end: string;
    checked_at: string;
    published_at: string;
    change_reason_ar: string | null;
  };
  executiveSummary: BriefingSummaryItem[];
  developments: BriefingDevelopment[];
};

export type BriefingArchiveItem = {
  edition_no: number;
  slug: string;
  edition_date: string;
  edition_type: string;
  published_at: string;
  title_ar: string;
};

type JsonObject = Record<string, unknown>;

function object(value: unknown): JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function nullableText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function numeric(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function safeHttpUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function parseSource(value: unknown): BriefingSource {
  const row = object(value);
  return {
    source_name: text(row.source_name, "مصدر غير محدد"),
    source_title: nullableText(row.source_title),
    organization_name: nullableText(row.organization_name),
    source_type: text(row.source_type, "other"),
    source_url: safeHttpUrl(row.source_url),
    source_reference: nullableText(row.source_reference),
    publication_date: nullableText(row.publication_date),
    published_at: nullableText(row.published_at),
    language_code: nullableText(row.language_code),
    source_role: text(row.source_role, "supporting"),
    source_excerpt: nullableText(row.source_excerpt),
    attribution_note: nullableText(row.attribution_note),
    accessed_at: nullableText(row.accessed_at),
  };
}

function parseSources(value: unknown): BriefingSource[] {
  return Array.isArray(value) ? value.map(parseSource) : [];
}

function parseSummary(value: unknown): BriefingSummaryItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => {
    const row = object(entry);
    return {
      order: numeric(row.order),
      text_ar: text(row.text_ar),
      headline_ar: text(row.headline_ar),
      information_class: text(row.information_class, "fact"),
      verification_status: text(row.verification_status, "unverified"),
      sources: parseSources(row.sources),
    };
  }).filter((entry) => entry.text_ar.trim() || entry.headline_ar.trim());
}

function parseDevelopments(value: unknown): BriefingDevelopment[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => {
    const row = object(entry);
    return {
      order: numeric(row.order),
      headline_ar: text(row.headline_ar, "تطور دون عنوان"),
      summary_ar: text(row.summary_ar),
      what_changed_ar: nullableText(row.what_changed_ar),
      why_it_matters_ar: nullableText(row.why_it_matters_ar),
      context_ar: nullableText(row.context_ar),
      category: text(row.category, "other"),
      information_class: text(row.information_class, "fact"),
      verification_status: text(row.verification_status, "unverified"),
      verification_note_ar: nullableText(row.verification_note_ar),
      occurred_at: nullableText(row.occurred_at),
      occurred_on: nullableText(row.occurred_on),
      time_precision: text(row.time_precision, "unknown"),
      location_text: nullableText(row.location_text),
      geographic_scope: text(row.geographic_scope, "national"),
      sources: parseSources(row.sources),
    };
  }).sort((a, b) => a.order - b.order);
}

function parseBriefing(value: unknown): PublicBriefing | null {
  const root = object(value);
  const edition = object(root.edition);
  const snapshot = object(root.snapshot);
  const revision = object(snapshot.revision);

  if (!text(edition.slug) || !text(revision.title_ar) || !text(revision.published_at)) {
    return null;
  }

  return {
    edition: {
      edition_no: numeric(edition.edition_no),
      slug: text(edition.slug),
      edition_date: text(edition.edition_date),
      edition_type: text(edition.edition_type, "daily"),
      status: text(edition.status, "active"),
    },
    revision: {
      revision_no: numeric(revision.revision_no, 1),
      revision_kind: text(revision.revision_kind, "initial"),
      title_ar: text(revision.title_ar),
      analysis_ar: text(revision.analysis_ar),
      methodology_ar: text(revision.methodology_ar),
      coverage_note_ar: text(revision.coverage_note_ar),
      window_start: text(revision.window_start),
      window_end: text(revision.window_end),
      checked_at: text(revision.checked_at),
      published_at: text(revision.published_at),
      change_reason_ar: nullableText(revision.change_reason_ar),
    },
    executiveSummary: parseSummary(snapshot.executive_summary),
    developments: parseDevelopments(snapshot.developments),
  };
}

export async function getPublicBriefing(slug: string): Promise<PublicBriefing | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_briefing", { p_slug: slug });
  if (error) {
    console.error("[SAS daily briefing] public edition", error);
    throw new Error("تعذر تحميل الإحاطة اليومية.");
  }
  return data ? parseBriefing(data) : null;
}

export async function getPublicBriefingArchive(limit = 24): Promise<BriefingArchiveItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_briefing_archive", {
    p_limit: Math.min(Math.max(limit, 1), 50),
  });
  if (error) {
    console.error("[SAS daily briefing] public archive", error);
    throw new Error("تعذر تحميل أرشيف الإحاطات.");
  }
  if (!Array.isArray(data)) return [];
  return data.map((entry) => {
    const row = object(entry);
    return {
      edition_no: numeric(row.edition_no),
      slug: text(row.slug),
      edition_date: text(row.edition_date),
      edition_type: text(row.edition_type, "daily"),
      published_at: text(row.published_at),
      title_ar: text(row.title_ar, "الإحاطة اليومية"),
    };
  }).filter((entry) => entry.slug);
}

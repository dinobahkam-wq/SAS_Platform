import type { PublicBriefing, BriefingSource } from "@/lib/public-briefing";

/**
 * Package 2: read-only editorial hand-off from a PUBLISHED briefing snapshot.
 * Never accept the headline, sources, or verification status from URL parameters.
 */
export type BriefingStudioPrefill = {
  headline: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  date: string;
  location: string;
  category: string;
  design: {
    format: "square";
    skin: "forest";
    photoPosition: "top";
    photoFit: "cover";
    headlineFont: "tajarib";
    summaryFont: "sans";
    metaFont: "sans";
    logoVariant: "color";
    showWeekday: false;
    showLocation: boolean;
    showSource: boolean;
  };
};

export type BriefingStudioOrigin = {
  slug: string;
  editionNo: number;
  revisionNo: number;
  editionDate: string;
  developmentOrder: number;
  informationClass: string;
  verificationStatus: string;
  verificationNote: string | null;
  eventDate: string | null;
  dateBasis: "event" | "edition";
  sources: {
    name: string;
    title: string | null;
    url: string | null;
    role: string;
    attribution: string | null;
  }[];
};

export type BriefingStudioTransfer = {
  prefill: BriefingStudioPrefill;
  origin: BriefingStudioOrigin;
};

function selectedSource(sources: BriefingSource[]): BriefingSource | null {
  return sources.find((source) => source.source_role === "primary") ?? sources[0] ?? null;
}

function validDate(value: string | null | undefined): string | null {
  const raw = value?.slice(0, 10) ?? "";
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}

/** The editorial timestamp represents the event time in Yemen, not its UTC calendar day. */
function localEventDate(timestamp: string | null | undefined): string | null {
  if (!timestamp) return null;
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-GB-u-ca-gregory-nu-latn", {
    timeZone: "Asia/Aden", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(parsed);
  const part = (name: string) => parts.find((entry) => entry.type === name)?.value ?? "";
  return validDate(part("year") + "-" + part("month") + "-" + part("day"));
}

export function createBriefingStudioTransfer(
  briefing: PublicBriefing,
  developmentOrder: number,
  expectedRevisionNo: number,
): BriefingStudioTransfer | null {
  if (!Number.isSafeInteger(developmentOrder) || developmentOrder < 0
      || !Number.isSafeInteger(expectedRevisionNo) || expectedRevisionNo < 1
      || briefing.revision.revision_no !== expectedRevisionNo
      || !briefing.revision.published_at || briefing.edition.status !== "active") {
    return null;
  }

  const development = briefing.developments.find((item) => item.order === developmentOrder);
  if (!development || !development.headline_ar.trim()) return null;

  const source = selectedSource(development.sources);
  const eventDate = validDate(development.occurred_on) ?? localEventDate(development.occurred_at);
  const publishedDate = validDate(briefing.edition.edition_date);
  if (!eventDate && !publishedDate) return null;

  const day = eventDate ?? publishedDate!;
  return {
    prefill: {
      headline: development.headline_ar,
      summary: development.summary_ar,
      sourceName: source?.source_name ?? "",
      sourceUrl: source?.source_url ?? "",
      date: day.replaceAll("-", "/"),
      location: development.location_text ?? "",
      category: development.category,
      design: {
        format: "square",
        skin: "forest",
        photoPosition: "top",
        photoFit: "cover",
        headlineFont: "tajarib",
        summaryFont: "sans",
        metaFont: "sans",
        logoVariant: "color",
        showWeekday: false,
        showLocation: Boolean(development.location_text),
        showSource: Boolean(source?.source_name || source?.source_url),
      },
    },
    origin: {
      slug: briefing.edition.slug,
      editionNo: briefing.edition.edition_no,
      revisionNo: briefing.revision.revision_no,
      editionDate: briefing.edition.edition_date,
      developmentOrder: development.order,
      informationClass: development.information_class,
      verificationStatus: development.verification_status,
      verificationNote: development.verification_note_ar,
      eventDate,
      dateBasis: eventDate ? "event" : "edition",
      sources: development.sources.map((item) => ({
        name: item.source_name,
        title: item.source_title,
        url: item.source_url,
        role: item.source_role,
        attribution: item.attribution_note,
      })),
    },
  };
}

import type { BriefingDevelopment } from "@/lib/public-briefing";

export type BriefingViewGroup = "yemen" | "regional" | "international";

export function briefingViewGroup(development: BriefingDevelopment): BriefingViewGroup {
  if (development.geographic_scope === "local" || development.geographic_scope === "national") return "yemen";
  if (development.geographic_scope === "regional") return "regional";
  return "international";
}

/** Yemen first, then regional and international. Reviewed importance orders items inside each region.
 * Historic records without a priority retain their original relative editorial order. */
export function prioritizeBriefingDevelopments(developments: BriefingDevelopment[]) {
  const scope: Record<BriefingViewGroup, number> = { yemen: 0, regional: 1, international: 2 };
  const importance: Record<string, number> = { critical: 0, high: 1, standard: 2 };
  return [...developments].sort((a, b) => {
    const scopeDifference = scope[briefingViewGroup(a)] - scope[briefingViewGroup(b)];
    if (scopeDifference) return scopeDifference;
    const aImportance = a.priority_level ? (importance[a.priority_level] ?? 3) : 3;
    const bImportance = b.priority_level ? (importance[b.priority_level] ?? 3) : 3;
    return aImportance - bImportance || a.order - b.order;
  });
}

export function briefingEditionOverview(developments: BriefingDevelopment[]) {
  return {
    total: developments.length,
    yemen: developments.filter((item) => briefingViewGroup(item) === "yemen").length,
    regional: developments.filter((item) => briefingViewGroup(item) === "regional").length,
    international: developments.filter((item) => briefingViewGroup(item) === "international").length,
    positions: developments.filter((item) => item.information_class === "position").length,
    changes: developments.filter((item) => Boolean(item.what_changed_ar?.trim())).length,
  };
}

/** Show selected recorded positions and editorially documented changes, never inferred trends. */
export function briefingEditorialSignals(developments: BriefingDevelopment[], limit = 3) {
  const ordered = prioritizeBriefingDevelopments(developments);
  const boundedLimit = Math.max(0, Math.min(6, Math.trunc(limit)));
  return {
    positions: ordered
      .filter((item) => item.information_class === "position" && item.headline_ar.trim())
      .slice(0, boundedLimit)
      .map((item) => ({
        headline: item.headline_ar,
        scope: briefingViewGroup(item),
        source: item.sources.find((source) => source.source_role === "primary")?.source_name
          ?? item.sources[0]?.source_name ?? null,
      })),
    changes: ordered
      .filter((item) => Boolean(item.what_changed_ar?.trim()))
      .slice(0, boundedLimit)
      .map((item) => ({
        headline: item.headline_ar,
        change: item.what_changed_ar!.trim(),
      })),
  };
}

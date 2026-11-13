import "server-only";
import nov12 from "@/data/briefings/2026-11-12.context.json";

export type HistoricMarketPoint = {
  id: string;
  label: string;
  value: number;
  unit: string;
  instrument: string;
  price_type: string;
  source_name: string;
  source_url: string;
  as_of_date: string;
  note: string;
};

export type BriefingFront = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  change: "advance" | "retreat" | "stable_verified" | "unverified";
  activity: string;
  source_name: string;
  source_url: string;
  note: string;
  reported_at?: string;
  evidence_status?: "reported_activity";
  actor?: "government" | "houthi" | "undetermined";
};

export type HistoricFrontMovement = {
  id: string;
  front_id: string;
  name: string;
  actor: "government" | "houthi";
  change: "reported_advance" | "reported_retreat";
  status: "reported";
  as_of_date: string;
  location_label: string;
  summary: string;
  source_name: string;
  source_url: string;
  precision: "area" | "governorate";
};

export type HistoricBriefingContext = {
  edition_date: string;
  market: HistoricMarketPoint[];
  fronts: BriefingFront[];
  frontHistory?: HistoricFrontMovement[];
  methodology: string;
};

export async function getDatedBriefingContext(editionDate: string): Promise<HistoricBriefingContext | null> {
  // Only recorded, reviewed dates are eligible. Do not substitute today's values.
  if (editionDate !== "2026-11-12") return null;
  const fronts: BriefingFront[] = nov12.fronts.map((front) => ({
    ...front,
    change: front.change === "advance" || front.change === "retreat" || front.change === "stable_verified"
      ? front.change
      : "unverified",
  }));
  const frontHistory: HistoricFrontMovement[] = nov12.frontHistory.map((entry) => ({
    ...entry,
    actor: entry.actor === "government" ? "government" : "houthi",
    change: entry.change === "reported_retreat" ? "reported_retreat" : "reported_advance",
    status: "reported",
    precision: entry.precision === "area" ? "area" : "governorate",
  }));
  return { edition_date: nov12.edition_date, market: nov12.market, fronts, frontHistory, methodology: nov12.methodology };
}

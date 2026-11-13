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
};

export type HistoricBriefingContext = {
  edition_date: string;
  market: HistoricMarketPoint[];
  fronts: BriefingFront[];
  methodology: string;
};

export async function getDatedBriefingContext(editionDate: string): Promise<HistoricBriefingContext | null> {
  // Only recorded, reviewed dates are eligible. Do not substitute today's values.
  if (editionDate !== "2026-11-12") return null;
  return nov12 as HistoricBriefingContext;
}

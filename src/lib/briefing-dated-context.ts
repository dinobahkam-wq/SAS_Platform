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

export type HistoricExchangeRate = {
  city: "صنعاء" | "عدن";
  code: "USD" | "SAR";
  label: string;
  buy: number;
  sell: number;
};

export type HistoricExchangeRates = {
  as_of_date: string;
  quote_currency: "YER";
  quote_basis: string;
  rates: HistoricExchangeRate[];
  source_name: string;
  source_url: string;
  corroboration_url: string;
  note: string;
};

export type HistoricBriefingContext = {
  edition_date: string;
  market: HistoricMarketPoint[];
  exchange_rates: HistoricExchangeRates;
  methodology: string;
};

export async function getDatedBriefingContext(editionDate: string): Promise<HistoricBriefingContext | null> {
  // Only date-keyed, editorially sourced snapshots; never substitute today's prices.
  if (editionDate !== "2026-11-12") return null;
  return nov12 as HistoricBriefingContext;
}

import "server-only";

export type BriefingIndicator = {
  id: string;
  label: string;
  value: string | null;
  unit: string;
  observedAt: string | null;
  sourceName: string;
  sourceUrl: string;
  detail: string;
};

function record(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function number(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function isoDate(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function quote(value: number, digits = 2) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function unavailable(id: string, label: string, unit: string, sourceName: string, sourceUrl: string, detail: string): BriefingIndicator {
  return { id, label, value: null, unit, observedAt: null, sourceName, sourceUrl, detail };
}

async function weather(city: { id: string; label: string; lat: number; lon: number }): Promise<BriefingIndicator> {
  const sourceName = "Open-Meteo";
  const sourceUrl = "https://open-meteo.com/en/docs";
  const detail = "درجة الحرارة التقريبية عند ارتفاع مترين؛ بيانات نمذجة جوية لا تمثل رصد محطة محلية.";
  const empty = unavailable(city.id, city.label, "°م", sourceName, sourceUrl, detail);
  try {
    const endpoint = new URL("https://api.open-meteo.com/v1/forecast");
    endpoint.searchParams.set("latitude", String(city.lat));
    endpoint.searchParams.set("longitude", String(city.lon));
    endpoint.searchParams.set("current", "temperature_2m");
    endpoint.searchParams.set("timezone", "Asia/Aden");
    const response = await fetch(endpoint.toString(), { next: { revalidate: 1800 }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) return empty;
    const payload = record(await response.json());
    const current = record(payload.current);
    const temperature = number(current.temperature_2m);
    const observedAt = typeof current.time === "string"
      ? isoDate(current.time.includes("+") ? current.time : current.time + "+03:00")
      : null;
    if (temperature === null || !observedAt) return empty;
    return { ...empty, value: quote(temperature, 0), observedAt };
  } catch {
    return empty;
  }
}

async function gold(): Promise<BriefingIndicator> {
  const empty = unavailable(
    "gold", "الذهب العالمي", "دولار / أونصة", "Gold API", "https://gold-api.com/docs",
    "سعر الذهب الفوري عالميًا، وليس سعر الذهب لدى محال الصاغة في اليمن."
  );
  try {
    const response = await fetch("https://api.gold-api.com/price/XAU", {
      next: { revalidate: 1800 }, signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return empty;
    const payload = record(await response.json());
    const price = number(payload.price);
    const observedAt = isoDate(payload.updatedAt ?? payload.updated_at ?? payload.timestamp ?? payload.date);
    if (price === null || price <= 0 || !observedAt) return empty;
    return { ...empty, value: quote(price), observedAt };
  } catch {
    return empty;
  }
}

async function brent(): Promise<BriefingIndicator> {
  const empty = unavailable(
    "brent", "خام برنت", "دولار / برميل", "OilPriceAPI", "https://docs.oilpriceapi.com/api-reference/prices/latest",
    "السعر المرجعي لخام برنت، وليس سعر الوقود في السوق اليمنية."
  );
  const token = process.env.OILPRICEAPI_KEY;
  if (!token) return { ...empty, detail: "لم تُفعّل بعد بيانات النفط بمفتاح مرخّص للاستخدام العام." };
  try {
    const response = await fetch("https://api.oilpriceapi.com/v1/prices/latest?by_code=BRENT_CRUDE_USD", {
      headers: { Authorization: `Token ${token}` },
      next: { revalidate: 1800 }, signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return empty;
    const root = record(await response.json());
    const data = record(root.data);
    const price = number(data.price);
    const observedAt = isoDate(data.observed_at ?? data.updated_at ?? data.created_at);
    if (price === null || price <= 0 || !observedAt || data.data_status === "stale" || data.stale === true) return empty;
    return { ...empty, value: quote(price), observedAt };
  } catch {
    return empty;
  }
}

export async function getBriefingIndicators(): Promise<BriefingIndicator[]> {
  return Promise.all([
    brent(),
    gold(),
    weather({ id: "mukalla", label: "المكلا", lat: 14.5425, lon: 49.1242 }),
    weather({ id: "sanaa", label: "صنعاء", lat: 15.3694, lon: 44.1910 }),
    weather({ id: "aden", label: "عدن", lat: 12.7855, lon: 45.0187 }),
  ]);
}

/** Live weather only; historic market quotes are stored in dated edition snapshots. */
export async function getBriefingWeatherIndicators(): Promise<BriefingIndicator[]> {
  return Promise.all([
    weather({ id: "mukalla", label: "المكلا", lat: 14.5425, lon: 49.1242 }),
    weather({ id: "sanaa", label: "صنعاء", lat: 15.3694, lon: 44.1910 }),
    weather({ id: "aden", label: "عدن", lat: 12.7855, lon: 45.0187 }),
  ]);
}

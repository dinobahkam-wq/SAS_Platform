import type { BriefingIndicator } from "@/lib/briefing-indicators";
import type { HistoricBriefingContext, BriefingFront } from "@/lib/briefing-dated-context";

function Symbol({ name }: { name: string }) {
  return <span className="material-symbols-rounded" aria-hidden="true">{name}</span>;
}

function ShortTime({ date }: { date: string | null }) {
  if (!date) return null;
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return null;
  return <time dateTime={date}>{new Intl.DateTimeFormat("ar-YE-u-nu-latn", {
    timeZone: "Asia/Aden", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  }).format(value)}</time>;
}

function FrontMap({ fronts }: { fronts: BriefingFront[] }) {
  const x = (lon: number) => 18 + ((lon - 42) / 12) * 314;
  const y = (lat: number) => 170 - ((lat - 12) / 7) * 153;
  return (
    <div className="briefing-mini-map">
      <svg viewBox="0 0 350 190" role="img" aria-label="مخطط تقريبي لمواقع الجبهات في اليمن؛ لا يوضح خطوط السيطرة">
        <rect x="1" y="1" width="348" height="188" rx="9" fill="#fafafa" stroke="#ddd"/>
        <path d="M55 31 90 18 133 34 176 35 231 28 293 61 333 92 313 125 250 124 217 145 158 158 112 166 75 142 39 133 35 98 48 72Z" fill="#eee" stroke="#999" strokeWidth="1.5" strokeLinejoin="round"/>
        <text x="285" y="28" fontSize="11" fill="#888">اليمن</text>
        {fronts.map((front) => (
          <g key={front.id}>
            <circle cx={x(front.lon)} cy={y(front.lat)} r="6" fill="#252525" stroke="white" strokeWidth="2"/>
            <text x={x(front.lon) + 8} y={y(front.lat) - 8} fontSize="11" fill="#333" fontWeight="600">{front.name}</text>
          </g>
        ))}
        <text x="24" y="182" fontSize="8" fill="#999">مواقع تقريبية — ليست خريطة سيطرة</text>
      </svg>
    </div>
  );
}

export function BriefingIntelligencePanel({
  context,
  weather,
}: {
  context: HistoricBriefingContext | null;
  weather: BriefingIndicator[];
}) {
  return (
    <section className="briefing-intelligence" aria-label="مؤشرات الإحاطة">
      <div className="briefing-intelligence-head">
        <h2><Symbol name="monitoring" /> لوحة المؤشرات</h2>
        <span>سجل تاريخي موجز</span>
      </div>
      <div className="briefing-intelligence-market">
        <div className="briefing-intelligence-label"><Symbol name="query_stats"/> الأسواق العالمية <small>إغلاق يوم العدد</small></div>
        <div className="briefing-intelligence-market-items">
          {context?.market.length ? context.market.map((item) => (
            <div className="briefing-market-item" key={item.id}>
              <span className="briefing-market-name"><Symbol name={item.id === "brent" ? "oil_barrel" : "diamond"}/>{item.label}</span>
              <strong dir="ltr">{item.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              <small>{item.unit}</small>
              <a title={item.note + " — " + item.instrument + " (" + item.price_type + ")"} href={item.source_url} target="_blank" rel="noopener noreferrer">
                {item.source_name} <Symbol name="open_in_new"/>
              </a>
            </div>
          )) : <p className="briefing-empty-metric">لا توجد أسعار تاريخية موثقة لهذا العدد.</p>}
        </div>
      </div>
      <div className="briefing-intelligence-weather">
        <span className="briefing-weather-title"><Symbol name="thermostat"/> الطقس <small>قراءات راهنة، ليست من تاريخ العدد</small></span>
        <div className="briefing-weather-chips">
          {weather.map((point) => (
            <div className="briefing-weather-chip" key={point.id}>
              <span>{point.label}</span>
              <strong dir="ltr">{point.value === null ? "—" : point.value + "°"}</strong>
            </div>
          ))}
        </div>
        <span className="briefing-weather-credit"><a href="https://open-meteo.com/en/docs" rel="noopener noreferrer" target="_blank">Open-Meteo</a> <ShortTime date={weather.find((item) => item.observedAt)?.observedAt ?? null}/></span>
      </div>
      <div className="briefing-fronts">
        <div className="briefing-fronts-title"><Symbol name="map"/> الجبهات <small>النشاط لا يعني تقدمًا أو تراجعًا</small></div>
        {context?.fronts.length ? (
          <>
            <div className="briefing-front-strip">
              {context.fronts.map((front) => (
                <div className="briefing-front-chip" key={front.id} title={front.note}>
                  <span>{front.name}</span>
                  <strong>{front.change === "advance" ? "تقدم" : front.change === "retreat" ? "تراجع" : front.change === "stable_verified" ? "ثبات متحقق" : "غير محسوم"}</strong>
                </div>
              ))}
            </div>
            <details className="briefing-front-map-disclosure">
              <summary><Symbol name="map"/> عرض مخطط مواقع الجبهات <Symbol name="expand_more"/></summary>
              <FrontMap fronts={context.fronts}/>
              <div className="briefing-front-sources">
                {context.fronts.map((front) => <p key={front.id}><strong>{front.name}:</strong> {front.activity} — {front.note} <a href={front.source_url} rel="noopener noreferrer" target="_blank">المصدر <Symbol name="open_in_new"/></a></p>)}
              </div>
            </details>
          </>
        ) : <p className="briefing-empty-metric">لم يُعتمد سجل جبهات لهذا العدد.</p>}
      </div>
      <p className="briefing-intelligence-foot">الأسعار محفوظة بتاريخ العدد ومسنَدة إلى مصدرها؛ الطقس رصد لحظي منفصل. مواقع الجبهات تقريبية ولا تمثل خطوط سيطرة.</p>
    </section>
  );
}

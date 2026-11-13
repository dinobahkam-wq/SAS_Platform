import type { BriefingIndicator } from "@/lib/briefing-indicators";
import type { HistoricBriefingContext, BriefingFront, HistoricFrontMovement } from "@/lib/briefing-dated-context";

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

function FrontMap({ fronts, history }: { fronts: BriefingFront[]; history: HistoricFrontMovement[] }) {
  // Positions are approximate administrative-region markers, not georeferenced control polygons.
  const x = (lon: number) => 18 + ((lon - 42) / 12) * 314;
  const y = (lat: number) => 170 - ((lat - 12) / 7) * 153;
  const movementByFront = new Map(history.map((item) => [item.front_id, item]));
  const latestDate = history.length ? history.map((item) => item.as_of_date).sort().reverse()[0] : null;

  return (
    <div className="briefing-front-map-layout">
      <div className="briefing-mini-map">
        <svg viewBox="0 0 350 190" role="img" aria-label="مخطط تقريبي لمناطق النشاط اليمنية، مع تمييز أخبار التقدم المعلنة بحسب الطرف وتاريخ الخبر. لا يوضح خطوط السيطرة">
          <rect x="1" y="1" width="348" height="188" rx="9" fill="#fafafa" stroke="#d2d2d2"/>
          <path d="M55 31 90 18 133 34 176 35 231 28 293 61 333 92 313 125 250 124 217 145 158 158 112 166 75 142 39 133 35 98 48 72Z" fill="#f1f1f1" stroke="#b1b1b1" strokeWidth="1.6" strokeLinejoin="round"/>
          <text x="277" y="28" fontSize="11" fill="#888">اليمن</text>
          {fronts.map((front) => {
            const prior = movementByFront.get(front.id);
            const movementClass = prior?.actor === "government" ? "government" : prior?.actor === "houthi" ? "houthi" : "unknown";
            const color = movementClass === "government" ? "#237d50" : movementClass === "houthi" ? "#c33e41" : "#777";
            const cx = x(front.lon), cy = y(front.lat);
            return (
              <g key={front.id}>
                {prior ? <circle cx={cx} cy={cy} r="12" fill="none" stroke={color} strokeWidth="1.8" strokeDasharray="3 3"/> : null}
                <circle cx={cx} cy={cy} r="5" fill={color} stroke="white" strokeWidth="1.5"/>
                <text x={cx + 9} y={cy - 9} fontSize="11" fill="#303030" fontWeight="600">{front.name}</text>
              </g>
            );
          })}
          <text x="20" y="182" fontSize="8" fill="#888">نقاط تقريبية — ليست خطوط سيطرة</text>
        </svg>
      </div>
      <div className="briefing-front-map-details">
        <div className="briefing-front-legend" aria-label="مفتاح ألوان الجبهات">
          <span><i className="briefing-legend-dot briefing-legend-government"/> تقدم حكومي منشور سابقًا</span>
          <span><i className="briefing-legend-dot briefing-legend-houthi"/> تقدم حوثي منشور سابقًا</span>
          <span><i className="briefing-legend-dot briefing-legend-unknown"/> نشاط دون تغير محسوم</span>
        </div>
        <p className="briefing-map-scope">
          الألوان تشير إلى أخبار تحولات مؤرخة، وليست إثباتًا مستقلًا لحدود السيطرة أو لاتجاه حركة القوات.
          {latestDate ? " أحدث خبر تحوّل مدرج: " + latestDate + "." : ""}
        </p>
        {history.length ? (
          <div className="briefing-movement-history">
            {history.map((movement) => (
              <article key={movement.id} className={`briefing-movement-entry briefing-movement-${movement.actor}`}>
                <div className="briefing-movement-entry-head">
                  <strong>{movement.name}</strong>
                  <span>{movement.actor === "government" ? "تقدم حكومي معلن" : "تقدم حوثي منشور"}</span>
                  <time dateTime={movement.as_of_date} dir="ltr">{movement.as_of_date}</time>
                </div>
                <p>{movement.summary}</p>
                <a href={movement.source_url} target="_blank" rel="noopener noreferrer" aria-label={`عرض المصدر الأصلي لتحول ${movement.name}`}>المصدر <Symbol name="open_in_new"/></a>
              </article>
            ))}
          </div>
        ) : null}
      </div>
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
              <strong dir="ltr" className="briefing-market-amount"><span className="briefing-market-dollar">$</span>{item.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
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
        <div className="briefing-fronts-title"><Symbol name="map"/> الجبهات <small>أخبار النشاط وتحولات سابقة مؤرخة</small></div>
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
              <summary><Symbol name="map"/> خريطة الجبهات والتطورات <Symbol name="expand_more"/></summary>
              <FrontMap fronts={context.fronts} history={context.frontHistory ?? []}/>
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

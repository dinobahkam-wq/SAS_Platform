import type { BriefingIndicator } from "@/lib/briefing-indicators";
import type { HistoricBriefingContext, HistoricExchangeRate } from "@/lib/briefing-dated-context";

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

function number(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function CityRates({ city, rates }: { city: "عدن" | "صنعاء"; rates: HistoricExchangeRate[] }) {
  const local = rates.filter((rate) => rate.city === city);
  return (
    <div className="briefing-fx-city">
      <div className="briefing-fx-city-heading">
        <Symbol name="location_on" />
        <strong>{city}</strong>
        <span>ريال يمني</span>
      </div>
      <table className="briefing-fx-table" aria-label={`أسعار الصرف في ${city}`}>
        <thead><tr><th scope="col">العملة</th><th scope="col">شراء</th><th scope="col">بيع</th></tr></thead>
        <tbody>
          {local.map((rate) => (
            <tr key={rate.code}>
              <th scope="row" className="briefing-fx-currency">{rate.code === "USD" ? "الدولار الأمريكي" : "الريال السعودي"}</th>
              <td><bdi dir="ltr">{number(rate.buy)}</bdi></td>
              <td><bdi dir="ltr">{number(rate.sell)}</bdi></td>
            </tr>
          ))}
          {!local.length ? <tr><td colSpan={3}>لا توجد أسعار مؤرخة لهذا السوق.</td></tr> : null}
        </tbody>
      </table>
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
  const fx = context?.exchange_rates;
  return (
    <section className="briefing-intelligence" aria-label="مؤشرات الإحاطة">
      <div className="briefing-intelligence-head">
        <h2><Symbol name="monitoring" /> لوحة المؤشرات</h2>
        <span>مؤشرات مؤرخة للعدد</span>
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
      <section className="briefing-fx-section" aria-labelledby="briefing-fx-heading">
        <div className="briefing-fx-heading">
          <div><Symbol name="currency_exchange"/><h3 id="briefing-fx-heading">أسعار الصرف</h3></div>
          <span>12 نوفمبر 2026 · ريال يمني لكل وحدة</span>
        </div>
        {fx ? (
          <>
            <div className="briefing-fx-grid">
              <CityRates city="صنعاء" rates={fx.rates}/>
              <CityRates city="عدن" rates={fx.rates}/>
            </div>
            <div className="briefing-fx-credit">
              <span>أسعار شراء وبيع استرشادية، تختلف بين محال الصرافة.</span>
              <a href={fx.source_url} target="_blank" rel="noopener noreferrer" title={fx.note}>{fx.source_name} <Symbol name="open_in_new"/></a>
            </div>
          </>
        ) : <p className="briefing-empty-metric">لم تُسجّل أسعار صرف موثقة لهذا العدد.</p>}
      </section>
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
      <p className="briefing-intelligence-foot">أسعار النفط والذهب والصرف مؤرخة بيوم العدد ومسنَدة إلى مصادرها؛ درجات الحرارة راهنة ومنفصلة عنها.</p>
    </section>
  );
}

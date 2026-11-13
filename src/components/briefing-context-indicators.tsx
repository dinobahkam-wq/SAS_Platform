import type { BriefingIndicator } from "@/lib/briefing-indicators";

function IndicatorIcon({ id }: { id: string }) {
  if (id === "gold") return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 9 3-4h6l3 4-6 10L6 9Z M6 9h12M9 5l3 14L15 5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>;
  if (id === "brent") return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3c2 4-1 6 3 9 1-2 2-2 2-2 3 5 1 11-5 11s-8-5-6-9c1-2 4-5 6-9Z M12 13c-2 2-3 4-2 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>;
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}

function observed(value: string | null) {
  if (!value) return "لا توجد قراءة";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "وقت غير متاح";
  return new Intl.DateTimeFormat("ar-YE-u-nu-latn", {
    timeZone: "Asia/Aden", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(date);
}

export function BriefingContextIndicators({ indicators }: { indicators: BriefingIndicator[] }) {
  return (
    <section className="briefing-context" aria-labelledby="briefing-context-title">
      <div className="briefing-context-header">
        <div className="briefing-context-heading">
          <span className="briefing-context-symbol" aria-hidden="true">◫</span>
          <h2 id="briefing-context-title">مؤشرات سياقية</h2>
          <span className="briefing-context-live">متغيرة</span>
        </div>
        <span className="briefing-context-caption">قراءات راهنة مستقلة عن تاريخ هذا العدد</span>
      </div>
      <div className="briefing-indicator-table-wrap">
        <table className="briefing-indicator-table">
          <thead>
            <tr><th scope="col">المؤشر</th><th scope="col">القراءة</th><th scope="col">المصدر والتوقيت</th></tr>
          </thead>
          <tbody>
            {indicators.map((indicator) => (
              <tr key={indicator.id}>
                <th scope="row">
                  <span className="briefing-indicator-name">
                    <span className="briefing-indicator-icon"><IndicatorIcon id={indicator.id}/></span>
                    <span>{indicator.label}</span>
                  </span>
                </th>
                <td>
                  <strong className={indicator.value === null ? "briefing-indicator-unavailable" : "briefing-indicator-value"}>
                    <bdi dir="ltr">{indicator.value ?? "غير متاح"}</bdi>
                  </strong>
                  {indicator.value !== null ? <small className="briefing-indicator-unit">{indicator.unit}</small> : null}
                </td>
                <td>
                  <a href={indicator.sourceUrl} rel="noopener noreferrer" target="_blank" title={indicator.detail}>{indicator.sourceName} ↗</a>
                  <time dateTime={indicator.observedAt ?? undefined}>{observed(indicator.observedAt)}</time>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="briefing-context-disclaimer">أسعار عالمية مرجعية ودرجات حرارة تقديرية؛ لا تُستعمل كبيانات تاريخية للعدد. عند غياب المصدر أو تعذر تحديثه تظهر «غير متاح» بدل أي رقم تقديري.</p>
    </section>
  );
}

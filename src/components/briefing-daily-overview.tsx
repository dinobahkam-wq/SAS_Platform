import type { BriefingDevelopment } from "@/lib/public-briefing";
import { briefingEditionOverview, briefingEditorialSignals } from "@/lib/briefing-view";
import "./briefing-daily-overview.css";

export function BriefingDailyOverview({ developments }: { developments: BriefingDevelopment[] }) {
  const overview = briefingEditionOverview(developments);
  const signals = briefingEditorialSignals(developments);
  const prioritized = developments.filter(item => item.priority_level === "critical" || item.priority_level === "high");
  const strategic = developments.filter(item => item.yemen_relevance === "strategic");
  const metrics = [
    { key: "yemen", title: "اليمن", value: overview.yemen, hint: "تطورًا محليًا ووطنيًا" },
    { key: "regional", title: "الإقليم", value: overview.regional, hint: "تطورًا مرتبطًا باليمن" },
    { key: "international", title: "الدولي", value: overview.international, hint: "تطورًا مرتبطًا باليمن" },
    { key: "positions", title: "مواقف مسجلة", value: overview.positions, hint: "تصريحات ومواقف منسوبة" },
  ] as const;

  return (
    <section className="briefing-daily-overview" aria-labelledby="briefing-overview-title">
      <div className="briefing-daily-overview-heading">
        <div>
          <h2 id="briefing-overview-title">المشهد في العدد</h2>
          <p>توزيع التطورات المسجلة في هذه الإحاطة، وليس تقييمًا لاتجاه الأحداث.</p>
        </div>
        <span className="briefing-overview-total">{overview.total} تطورًا</span>
      </div>
      <div className="briefing-overview-metrics">
        {metrics.map((metric) => (
          <div className="briefing-overview-metric" key={metric.key}>
            <span>{metric.title}</span>
            <strong>{metric.value.toLocaleString("en-US")}</strong>
            <small>{metric.hint}</small>
          </div>
        ))}
      </div>
      {(prioritized.length > 0 || strategic.length > 0) ? <div className="sas-overview-editorial">
        {prioritized.length > 0 ? <span><strong>{prioritized.length.toLocaleString("en-US")}</strong> تطوراً ذا أولوية قصوى أو عالية</span> : null}
        {strategic.length > 0 ? <span><strong>{strategic.length.toLocaleString("en-US")}</strong> تطوراً ذا صلة استراتيجية غير مباشرة باليمن</span> : null}
      </div> : null}
      {(signals.positions.length > 0 || signals.changes.length > 0) ? (
        <div className="briefing-overview-signals">
          {signals.positions.length > 0 ? (
            <section className="briefing-overview-signal-group" aria-labelledby="briefing-overview-positions-title">
              <h3 id="briefing-overview-positions-title">مواقف مسجلة في العدد</h3>
              <ol>
                {signals.positions.map((position, index) => (
                  <li key={position.headline + index}>
                    <span className="briefing-overview-signal-title">{position.headline}</span>
                    {position.source ? <small>{position.source}</small> : null}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
          {signals.changes.length > 0 ? (
            <section className="briefing-overview-signal-group" aria-labelledby="briefing-overview-changes-title">
              <h3 id="briefing-overview-changes-title">تغيرات موثقة في العدد</h3>
              <ol>
                {signals.changes.map((change, index) => (
                  <li key={change.headline + index}>
                    <span className="briefing-overview-signal-title">{change.headline}</span>
                    <small>{change.change}</small>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </div>
      ) : null}
      {overview.changes > 0 ? (
        <p className="briefing-overview-changes">تتضمن الإحاطة {overview.changes} {overview.changes === 1 ? "تطورًا مع توضيح لما تغيّر" : "تطورات مع توضيح لما تغيّر"} مقارنة بالسياق السابق.</p>
      ) : (
        <p className="briefing-overview-changes briefing-overview-changes--empty">لا تتضمن بيانات هذا العدد مقارنات موثقة للتغيرات. لا يُستنتج من ذلك غياب التغيرات على أرض الواقع.</p>
      )}
    </section>
  );
}

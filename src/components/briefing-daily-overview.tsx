import type { BriefingDevelopment } from "@/lib/public-briefing";
import { briefingEditionOverview } from "@/lib/briefing-view";
import "./briefing-daily-overview.css";

export function BriefingDailyOverview({ developments }: { developments: BriefingDevelopment[] }) {
  const overview = briefingEditionOverview(developments);
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
          <h2 id="briefing-overview-title">البيانات المرجعية للعدد</h2>
          <p>توزيع ما نُشر في هذا العدد؛ الأرقام وصفية وليست تقديراً لاتجاه الأحداث.</p>
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

    </section>
  );
}

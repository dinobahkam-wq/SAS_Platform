import type { BriefingDevelopment } from "@/lib/public-briefing";
import { briefingEditionOverview } from "@/lib/briefing-view";
import "./briefing-daily-overview.css";

export function BriefingDailyOverview({ developments }: { developments: BriefingDevelopment[] }) {
  const overview = briefingEditionOverview(developments);
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
      {overview.changes > 0 ? (
        <p className="briefing-overview-changes">تتضمن الإحاطة {overview.changes} {overview.changes === 1 ? "تطورًا مع توضيح لما تغيّر" : "تطورات مع توضيح لما تغيّر"} مقارنة بالسياق السابق.</p>
      ) : (
        <p className="briefing-overview-changes briefing-overview-changes--empty">لا تتضمن بيانات هذا العدد مقارنات موثقة للتغيرات. لا يُستنتج من ذلك غياب التغيرات على أرض الواقع.</p>
      )}
    </section>
  );
}

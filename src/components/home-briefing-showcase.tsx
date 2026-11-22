import Link from "next/link";
import { formatBriefingDateOnly } from "@/components/briefing-public";
import type { BriefingArchiveItem, PublicBriefing } from "@/lib/public-briefing";
import { prioritizeBriefingDevelopments } from "@/lib/briefing-view";
import "./home-briefing-showcase.css";

type IconName = "document" | "calendar" | "globe" | "layers" | "arrow" | "shield" | "pulse";

function BriefingIcon({ name, className = "" }: { name: IconName; className?: string }) {
  const common = {
    className,
    width: 17,
    height: 17,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.65,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  if (name === "document") return <svg {...common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></svg>;
  if (name === "calendar") return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></svg>;
  if (name === "globe") return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-3 3-3 15 0 18M12 3c3 3 3 15 0 18"/></svg>;
  if (name === "layers") return <svg {...common}><path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/></svg>;
  if (name === "shield") return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>;
  if (name === "pulse") return <svg {...common}><path d="M3 12h4l3-6 4 12 3-6h4"/></svg>;
  return <svg {...common}><path d="M19 12H5m7 7-7-7 7-7"/></svg>;
}

export function HomeBriefingShowcase({
  latest,
  briefing,
  previous,
  unavailable = false,
}: {
  latest: BriefingArchiveItem | null;
  briefing: PublicBriefing | null;
  previous: BriefingArchiveItem[];
  unavailable?: boolean;
}) {
  if (!latest) {
    return (
      <div className="sas-home-briefing-empty">
        <BriefingIcon name="document"/>
        <p>{unavailable ? "تعذر تحميل أعداد الإحاطة حاليًا، ويمكنك المحاولة من الأرشيف." : "ستظهر هنا الإحاطة فور نشر أول عدد."}</p>
        <Link href="/briefings">عرض أرشيف الإحاطات <BriefingIcon name="arrow"/></Link>
      </div>
    );
  }

  const href = "/briefings/" + encodeURIComponent(latest.slug);
  const subject = (latest.title_ar || "")
    .replace(/^الإحاطة اليومية\s*[|｜:–—-]\s*/u, "")
    .trim() || "قراءة يومية في تطورات اليمن ومحيطه";
  // Match the public briefing's displayed ordering, keeping each development's own image.
  const highlights = prioritizeBriefingDevelopments(briefing?.developments ?? []).slice(0, 3);
  const developmentsCount = briefing?.developments.length;
  const summaryCount = briefing?.executiveSummary.length;

  return (
    <div className="sas-home-briefing-wrap">
      <article className="sas-home-briefing-feature" aria-label="أحدث عدد من الإحاطة اليومية">
        <div className="sas-home-briefing-main">
          <div className="sas-home-briefing-topline">
            <span className="sas-home-briefing-kicker"><BriefingIcon name="document"/> أحدث عدد منشور</span>
            <span className="sas-home-briefing-no">العدد {String(latest.edition_no).padStart(2, "0")}</span>
          </div>

          <h3 className="sas-home-briefing-title">الإحاطة اليومية</h3>
          <div className="sas-home-briefing-date">
            <BriefingIcon name="calendar"/>
            <time dateTime={latest.edition_date}>{formatBriefingDateOnly(latest.edition_date)}</time>
            <span aria-hidden="true" className="sas-home-briefing-separator">•</span>
            <BriefingIcon name="globe"/>
            <span>اليمن والإقليم والعالم</span>
          </div>
          {subject && subject !== "الإحاطة اليومية" && !/^\d{1,2}\s+/.test(subject) ? (
            <p className="sas-home-briefing-subject">{subject}</p>
          ) : null}
          <p className="sas-home-briefing-lede">
            أبرز الوقائع والمواقف والتغيرات، ضمن سجل تحريري موثق يضع التطورات في سياقها.
          </p>

          <div className="sas-home-briefing-metrics" aria-label="بيانات العدد">
            {typeof developmentsCount === "number" ? (
              <div className="sas-home-briefing-metric"><BriefingIcon name="pulse"/><strong>{developmentsCount.toLocaleString("en-US")}</strong><span>تطورًا</span></div>
            ) : null}
            {typeof summaryCount === "number" ? (
              <div className="sas-home-briefing-metric"><BriefingIcon name="layers"/><strong>{summaryCount.toLocaleString("en-US")}</strong><span>خلاصات</span></div>
            ) : null}
            <div className="sas-home-briefing-metric"><BriefingIcon name="shield"/><span>توثيق المصادر</span></div>
          </div>

          <div className="sas-home-briefing-actions">
            <Link className="sas-home-briefing-primary-link sas-cta sas-cta--primary" href={href}>قراءة الإحاطة <BriefingIcon name="arrow"/></Link>
            
          </div>
        </div>

        <div className="sas-home-briefing-art" aria-hidden="true">
          <div className="sas-home-briefing-art-photo"/>
          <div className="sas-home-briefing-art-grid"/>
        </div>

        <aside className="sas-home-briefing-highlights" aria-label="أول ثلاثة تطورات من العدد">
          <div className="sas-home-briefing-aside-heading">
            <span><BriefingIcon name="layers"/> من تطورات العدد</span>
            <span>{highlights.length ? "من السجل الموثق" : "الإحاطة الموثقة"}</span>
          </div>
          {highlights.length ? (
            <ol className="sas-home-briefing-list">
              {highlights.map((item, index) => (
                <li key={item.order}>
                  <Link className="sas-home-briefing-story" href={href + "#sas-development-" + item.order}>
                    {item.image ? (
                      <span className="sas-home-briefing-story-photo">
                        <img
                          src={item.image.url}
                          alt={item.image.alt_text || ("صورة مرافقة للتطور: " + item.headline_ar)}
                          loading="lazy"
                          decoding="async"
                        />
                      </span>
                    ) : (
                      <span className="sas-home-briefing-story-no-photo" aria-hidden="true">
                        <BriefingIcon name="document"/>
                      </span>
                    )}
                    <div className="sas-home-briefing-highlight-copy">
                      <span className="sas-home-briefing-highlight-meta">
                        <span className="sas-home-briefing-index">{String(index + 1).padStart(2, "0")}</span>
                        <span>التطور {String(item.order + 1).padStart(2, "0")}</span>
                      </span>
                      <h4>{item.headline_ar}</h4>
                      {item.summary_ar ? <p>{item.summary_ar}</p> : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <p className="sas-home-briefing-no-highlights">تظهر التطورات المنشورة هنا فور توفر بيانات العدد.</p>
          )}
          <Link href={href} className="sas-home-briefing-aside-link">الاطلاع على السجل الكامل <BriefingIcon name="arrow"/></Link>
        </aside>
      </article>

      {previous.length ? (
        <div className="sas-home-briefing-archive">
          <div className="sas-home-briefing-archive-heading">
            <span><BriefingIcon name="calendar"/> إصدارات سابقة</span>
            <Link href="/briefings">أرشيف الإحاطات <BriefingIcon name="arrow"/></Link>
          </div>
          <div className="sas-home-briefing-archive-grid">
            {previous.map((edition) => (
              <Link className="sas-home-briefing-archive-item" key={edition.slug} href={"/briefings/" + encodeURIComponent(edition.slug)}>
                <span>العدد {String(edition.edition_no).padStart(2, "0")}</span>
                <strong>{formatBriefingDateOnly(edition.edition_date)}</strong>
                <BriefingIcon name="arrow"/>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

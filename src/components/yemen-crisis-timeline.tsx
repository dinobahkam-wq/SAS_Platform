"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { timelineCategories, yemenTimeline, type TimelineCategory } from "@/data/visual-knowledge/yemen-crisis-timeline";
import "./yemen-timeline.css";

type CategoryFilter = "all" | TimelineCategory;

function MiniIcon({ name, size = 19 }: { name: "history" | "landmark" | "shield" | "globe" | "institution" | "link" | "arrow" | "calendar" | "layers" | "check"; size?: number }) {
  const base = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  switch (name) {
    case "history": return <svg {...base}><path d="M3 12a9 9 0 1 0 2-5.7M3 4v5h5"/><path d="M12 7v5l3.5 2"/></svg>;
    case "landmark": return <svg {...base}><path d="m3 9 9-6 9 6M5 10h14M6 10v9M10 10v9M14 10v9M18 10v9M3 21h18"/></svg>;
    case "institution": return <svg {...base}><rect x="4" y="4" width="16" height="17" rx="1"/><path d="M8 8h2M14 8h2M8 12h2M14 12h2M9 21v-5h6v5"/></svg>;
    case "shield": return <svg {...base}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>;
    case "globe": return <svg {...base}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-3 3-3 15 0 18M12 3c3 3 3 15 0 18"/></svg>;
    case "link": return <svg {...base}><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1"/></svg>;
    case "calendar": return <svg {...base}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></svg>;
    case "layers": return <svg {...base}><path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/></svg>;
    case "check": return <svg {...base}><path d="m4 12 5 5 11-11"/></svg>;
    default: return <svg {...base}><path d="m16 17-9-9M7 8v7M7 8h7"/></svg>;
  }
}
const categoryIcons: Record<TimelineCategory, "landmark" | "shield" | "institution" | "globe"> = {
  political: "landmark",
  military: "shield",
  institutional: "institution",
  diplomatic: "globe",
};
const filters: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "كل المحطات" },
  { value: "political", label: "السياسية" },
  { value: "military", label: "العسكرية" },
  { value: "institutional", label: "المؤسسية" },
  { value: "diplomatic", label: "الدبلوماسية" },
];

export function YemenCrisisTimeline() {
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [selected, setSelected] = useState(yemenTimeline[0].id);
  const list = useMemo(() => filter === "all" ? yemenTimeline : yemenTimeline.filter((item) => item.category === filter), [filter]);
  const index = Math.max(0, list.findIndex((item) => item.id === selected));
  const event = list[index];

  function chooseFilter(next: CategoryFilter) {
    const filtered = next === "all" ? yemenTimeline : yemenTimeline.filter((item) => item.category === next);
    setFilter(next);
    if (!filtered.some((item) => item.id === selected)) setSelected(filtered[0].id);
  }
  function selectOffset(delta: number) {
    const next = Math.max(0, Math.min(list.length - 1, index + delta));
    setSelected(list[next].id);
  }

  return (
    <div className="sastl">
      <header className="sastl-hero">
        <div className="sastl-topline">
          <span className="sastl-brandline"><MiniIcon name="history" size={18}/> ساس / المعرفة البصرية</span>
          <span className="sastl-edition">الملف 01 · قراءة تاريخية</span>
        </div>
        <div className="sastl-hero-grid">
          <div>
            <p className="sastl-eyebrow">من الوقائع إلى التحولات</p>
            <h1>اليمن: محطات أعادت تشكيل الأزمة</h1>
            <p className="sastl-intro">ثماني محطات مفصلية بين 2014 و2022. تتبّع ما وقع، وما تغيّر في بنية الصراع، واطّلع على المصادر الأصلية لكل محطة.</p>
          </div>
          <div className="sastl-period" aria-label="النطاق الزمني">
            <span>الإطار الزمني</span>
            <strong dir="ltr">2014 — 2022</strong>
            <small>8 محطات مختارة، لا سجل شامل لكل أحداث الفترة</small>
          </div>
        </div>
        <div className="sastl-keyfacts">
          <span><MiniIcon name="calendar" size={17}/> 8 سنوات من التحولات</span>
          <span><MiniIcon name="layers" size={17}/> 4 مجالات تحليل</span>
          <span><MiniIcon name="link" size={17}/> مصادر أصلية لكل محطة</span>
        </div>
      </header>

      <div className="sastl-dashboard">
        <section className="sastl-controls" aria-label="استعراض المحطات التاريخية">
          <div className="sastl-section-head">
            <div>
              <span className="sastl-eyebrow">استكشف التسلسل</span>
              <h2>الخط الزمني</h2>
            </div>
            <span className="sastl-count">{list.length} محطات</span>
          </div>
          <div className="sastl-filters" aria-label="تصفية المحطات حسب المجال">
            {filters.map((item) => (
              <button key={item.value} type="button" className={filter === item.value ? "is-active" : ""} aria-pressed={filter === item.value} onClick={() => chooseFilter(item.value)}>
                {item.label}
              </button>
            ))}
          </div>
          <div className="sastl-stops" role="group" aria-label="اختر محطة لقراءة تفاصيلها">
            {list.map((item, position) => (
              <button
                type="button" key={item.id} className={"sastl-stop" + (event.id === item.id ? " is-active" : "")}
                aria-pressed={event.id === item.id} onClick={() => setSelected(item.id)}
              >
                <span className="sastl-stop-line" aria-hidden="true"><span/></span>
                <span className="sastl-stop-content">
                  <span className="sastl-stop-yr" dir="ltr">{item.year}</span>
                  <strong>{item.title}</strong>
                  <small>{timelineCategories[item.category]}</small>
                </span>
                <span className="sastl-stop-index" aria-hidden="true">{String(position + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="sastl-detail" aria-live="polite" aria-atomic="true" aria-label="تفاصيل المحطة المختارة">
          <div className="sastl-detail-top">
            <span className={"sastl-type sastl-type--" + event.category}>
              <MiniIcon name={categoryIcons[event.category]} size={17}/>{timelineCategories[event.category]}
            </span>
            <span className="sastl-fraction" dir="ltr">{String(index + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}</span>
          </div>
          <div className="sastl-event-date"><MiniIcon name="calendar" size={17}/><time dateTime={event.date}>{event.dateLabel}</time><span className="sastl-bullet" aria-hidden="true">·</span>{event.place}</div>
          <h2>{event.title}</h2>
          <p className="sastl-lead">{event.description}</p>
          <div className="sastl-explain">
            <div>
              <div className="sastl-explain-head"><span className="sastl-ordinal">01</span><h3>ما الذي تغيّر؟</h3></div>
              <p>{event.change}</p>
            </div>
            <div>
              <div className="sastl-explain-head"><span className="sastl-ordinal">02</span><h3>الدلالة السياسية</h3></div>
              <p>{event.significance}</p>
              <small>قراءة تحريرية لساس، وليست اقتباسًا من المصدر</small>
            </div>
          </div>
          <div className="sastl-sources">
            <div className="sastl-source-heading"><MiniIcon name="link" size={17}/><h3>المصادر والتوثيق</h3></div>
            {event.sources.map((source) => (
              <a key={source.url} href={source.url} rel="noopener noreferrer" target="_blank">
                <span><strong>{source.title}</strong><small>{source.organization}</small></span><MiniIcon name="arrow" size={17}/>
              </a>
            ))}
          </div>
          <div className="sastl-nav">
            <button type="button" disabled={index === 0} onClick={() => selectOffset(-1)}><MiniIcon name="arrow" size={16}/> السابقة</button>
            <span>المحطة {index + 1} من {list.length}</span>
            <button type="button" disabled={index === list.length - 1} onClick={() => selectOffset(1)}>التالية <MiniIcon name="arrow" size={16}/></button>
          </div>
        </section>
      </div>

      <section className="sastl-note" aria-label="منهجية المادة">
        <div className="sastl-note-icon"><MiniIcon name="check" size={20}/></div>
        <div>
          <h2>حول منهجية هذا المنتج</h2>
          <p>يعرض الخط الزمني محطات منتقاة لتفسير التحولات الرئيسية، ولا يقدم حصرًا شاملًا للأحداث أو حكمًا نهائيًا على أسبابها. تؤخذ الوقائع من مراجع موثقة، بينما تُميز الدلالات السياسية بصفتها قراءة تحريرية قابلة للمراجعة. لا يعني ترتيب المحطات ترتيبها من حيث الأهمية.</p>
          <Link href="/visual-knowledge">العودة إلى المعرفة البصرية <MiniIcon name="arrow" size={16}/></Link>
        </div>
      </section>
    </div>
  );
}

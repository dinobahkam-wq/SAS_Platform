"use client";

import { useState } from "react";
import {
  BriefingEmphasis,
  BriefingTypeTag,
  BriefingVerification,
  briefingCategoryLabel,
  briefingScopeLabel,
  formatBriefingDate,
  formatBriefingDateOnly,
} from "@/components/briefing-public";
import { BriefingSourcesPopover } from "@/components/briefing-sources-popover";
import type { BriefingDevelopment, BriefingSummaryItem } from "@/lib/public-briefing";

type Tab = "all" | "yemen" | "international" | "statements" | "economy" | "sports" | "trending";

const tabs: { key: Tab; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "yemen", label: "اليمن" },
  { key: "international", label: "دولي" },
  { key: "statements", label: "بيانات رسمية" },
  { key: "economy", label: "اقتصاد" },
  { key: "sports", label: "رياضة" },
  { key: "trending", label: "تغريدات رائجة" },
];

function isOfficialStatement(development: BriefingDevelopment) {
  return development.sources.some((source) =>
    source.source_type === "official_statement" ||
    (development.information_class === "position" &&
      /(وزارة|الحكومة|التحالف|وكالة الأنباء اليمنية|وكالة الأنباء السعودية|الحكومة البريطانية)/.test(source.source_name))
  );
}

function matchesTab(development: BriefingDevelopment, tab: Tab) {
  switch (tab) {
    case "all": return true;
    case "yemen": return development.geographic_scope === "local" || development.geographic_scope === "national";
    case "international": return development.geographic_scope === "regional" || development.geographic_scope === "international";
    case "statements": return isOfficialStatement(development);
    case "economy": return development.category === "economy";
    case "sports": return development.category === "sports";
    case "trending": return development.sources.some((source) =>
      /^https?:\/\/(?:www\.)?(?:x\.com|twitter\.com)\//i.test(source.source_url ?? "")
    );
  }
}

export function BriefingEditionBody({
  executiveSummary,
  developments,
}: {
  executiveSummary: BriefingSummaryItem[];
  developments: BriefingDevelopment[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const filtered = developments.filter((development) => matchesTab(development, activeTab));
  const selectedLabel = tabs.find((tab) => tab.key === activeTab)?.label ?? "الكل";

  return (
    <>
      <nav className="briefing-topic-tabs" aria-label="تصفية التطورات حسب القسم">
        {tabs.map((tab) => {
          const count = developments.filter((development) => matchesTab(development, tab.key)).length;
          return (
            <button
              key={tab.key}
              className={`briefing-topic-tab${activeTab === tab.key ? " is-active" : ""}`}
              type="button"
              aria-pressed={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            >
              <span>{tab.label}</span>
              <span className="briefing-topic-tab-count" aria-hidden="true">{count}</span>
            </button>
          );
        })}
      </nav>

      {activeTab === "all" && executiveSummary.length > 0 ? (
        <section className="briefing-summary-section" aria-labelledby="briefing-summary-title">
          <div className="briefing-section-heading">
            <div><h2 id="briefing-summary-title">الملخص التنفيذي</h2></div>
          </div>
          <div className="briefing-executive-prose">
            <p>
              {executiveSummary.map((item, index) => {
                const transitions = ["", "وفي تطور آخر، ", "أما ميدانيًا، ", "وعلى المستوى الإنساني، ", "وفي السياق الدولي، "];
                return (
                  <span key={index} className="briefing-executive-clause">
                    {index > 0 ? " " : ""}{transitions[index] ?? "كذلك، "}
                    <BriefingEmphasis text={item.text_ar.trim()} />
                  </span>
                );
              })}
            </p>
            <div className="briefing-executive-foot">
              <div className="briefing-executive-references">
                {executiveSummary.map((item, index) => (
                  <BriefingSourcesPopover key={index} sources={item.sources} label={`مرجع ${index + 1}`} />
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="briefing-developments-section" aria-labelledby="briefing-developments-title">
        <div className="briefing-section-heading briefing-developments-heading">
          <div>
            <h2 id="briefing-developments-title">سجل التطورات</h2>
            <p>{activeTab === "all" ? "تطورات مرتبة وفق تسلسل العدد، مع تصنيف المعلومة ومصادرها." : `التطورات المصنفة ضمن «${selectedLabel}» في هذا العدد.`}</p>
          </div>
          <span className="briefing-development-count">{filtered.length} تطورًا</span>
        </div>
        {filtered.length ? (
          <div className="briefing-timeline">
            {filtered.map((development) => {
              const happened = development.occurred_at
                ? formatBriefingDate(development.occurred_at, development.time_precision !== "date_only")
                : development.occurred_on
                  ? formatBriefingDateOnly(development.occurred_on)
                  : "وقت الوقوع غير محدد";
              return (
                <article className="briefing-event" key={development.order}>
                  <div className="briefing-event-index">
                    <span>{String(development.order + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="briefing-event-content">
                    <div className="briefing-event-meta">
                      <span className="briefing-event-category">{briefingCategoryLabel(development.category)}</span>
                      <span>{briefingScopeLabel(development.geographic_scope)}</span>
                      <span>{happened}</span>
                      {development.location_text ? <span>{development.location_text}</span> : null}
                    </div>
                    <div className="briefing-event-tags">
                      <BriefingTypeTag value={development.information_class}/>
                      <BriefingVerification value={development.verification_status}/>
                    </div>
                    <h3>{development.headline_ar}</h3>
                    {development.summary_ar ? <p className="briefing-event-summary"><BriefingEmphasis text={development.summary_ar}/></p> : null}
                    {development.what_changed_ar ? <div className="briefing-event-fact"><strong>تفصيل التطور</strong><p>{development.what_changed_ar}</p></div> : null}
                    {development.context_ar ? <div className="briefing-event-context"><strong>السياق المرتبط</strong><p>{development.context_ar}</p></div> : null}
                    {development.sources.length ? (
                      <div className="briefing-event-source-action">
                        <BriefingSourcesPopover sources={development.sources} label="المصادر"/>
                      </div>
                    ) : (
                      <div className="briefing-no-source">لا تتوفر إحالة عامة لمصدر هذا التطور.</div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="briefing-empty-inline" role="status">
            لا توجد تطورات موثقة ضمن قسم «{selectedLabel}» في هذا العدد. اختر قسمًا آخر لعرض المعلومات المتاحة.
          </div>
        )}
      </section>
    </>
  );
}

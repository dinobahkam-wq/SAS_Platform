"use client";

import { useState } from "react";
import Link from "next/link";
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
import "./briefing-dense-layout.css";
import "./briefing-studio-transfer.css";
import { prioritizeBriefingDevelopments } from "@/lib/briefing-view";
import type { BriefingDevelopment, BriefingSummaryItem } from "@/lib/public-briefing";
import { findSourceIdentity, identityById } from "@/lib/visual-identities";
import "./sas-identity.css";

type Tab = "all" | "priority" | "yemen" | "international" | "statements" | "economy";
const priorityLabels: Record<string,string>={critical:"أولوية قصوى",high:"أولوية عالية",standard:"أولوية اعتيادية"};
const relevanceLabels: Record<string,string>={direct:"تأثير مباشر في اليمن",regional:"صلة إقليمية باليمن",strategic:"تأثير استراتيجي غير مباشر"};

const tabs: { key: Tab; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "priority", label: "الأولويات" },
  { key: "yemen", label: "اليمن" },
  { key: "international", label: "الإقليم والعالم" },
  { key: "statements", label: "بيانات رسمية" },
  { key: "economy", label: "اقتصاد" },
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
    case "priority": return development.priority_level === "critical" || development.priority_level === "high";
    case "yemen": return development.geographic_scope === "local" || development.geographic_scope === "national";
    case "international": return development.geographic_scope === "regional" || development.geographic_scope === "international";
    case "statements": return isOfficialStatement(development);
    case "economy": return development.category === "economy";
  }
}

export function BriefingEditionBody({
  executiveSummary,
  developments,
  studioEdition,
}: {
  executiveSummary: BriefingSummaryItem[];
  developments: BriefingDevelopment[];
  studioEdition?: { slug: string; revisionNo: number } | null;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const filtered = prioritizeBriefingDevelopments(developments).filter((development) => matchesTab(development, activeTab));
  const selectedLabel = tabs.find((tab) => tab.key === activeTab)?.label ?? "الكل";
  const sourceLabel = (development: BriefingDevelopment) => development.sources.find((source) => source.source_role === "primary")?.source_name ?? development.sources[0]?.source_name ?? null;

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
        <section className="briefing-summary-section" aria-label="الملخص التنفيذي">
          <details className="briefing-summary-disclosure">
            <summary>
              <span className="briefing-summary-summary-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M5 6h14M5 12h14M5 18h9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
              </span>
              <span className="briefing-summary-summary-title">الملخص التنفيذي</span>
              <span className="briefing-summary-summary-hint">اضغط لقراءة الموجز الكامل</span>
              <span className="briefing-summary-chevron material-symbols-rounded" aria-hidden="true">keyboard_arrow_down</span>
            </summary>
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
            </div>
          </details>
        </section>
      ) : null}

      <section className="briefing-developments-section" aria-labelledby="briefing-developments-title">
        <div className="briefing-section-heading briefing-developments-heading">
          <div>
            <h2 id="briefing-developments-title">سجل التطورات</h2>
            <p>{activeTab === "all" ? "اليمن أولًا، ثم الإقليم والعالم المرتبطان به؛ ترتيب العرض لا يغيّر الأرشيف الأصلي." : `التطورات المصنفة ضمن «${selectedLabel}» في هذا العدد.`}</p>
          </div>
          <span className="briefing-development-count">{filtered.length} تطورًا</span>
        </div>
        {filtered.length ? (
          <div className="briefing-timeline">
            {filtered.map((development, index) => {
              const happened = development.occurred_at
                ? formatBriefingDate(development.occurred_at, development.time_precision !== "date_only")
                : development.occurred_on
                  ? formatBriefingDateOnly(development.occurred_on)
                  : "وقت الوقوع غير محدد";
              return (
                <article className={`briefing-event briefing-event--dense sas-event-scope-${development.geographic_scope} sas-event-class-${development.information_class}${development.priority_level ? " sas-event-priority-"+development.priority_level : ""}`} key={development.order}>
                  <div className="briefing-event-index">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="briefing-event-content">
                    <div className="briefing-event-meta">
                      <span className="briefing-event-category">{briefingCategoryLabel(development.category)}</span>
                      <span>{briefingScopeLabel(development.geographic_scope)}</span>
                      <span>{happened}</span>
                      {development.location_text ? <span>{development.location_text}</span> : null}
                      {development.priority_level ? <span className="sas-priority-label">{priorityLabels[development.priority_level]}</span> : null}
                      {development.yemen_relevance ? <span className="sas-relevance-label">{relevanceLabels[development.yemen_relevance]}</span> : null}
                    </div>
                    {(() => {
                      const publisher = identityById(development.publisher_identity_id) ?? findSourceIdentity(sourceLabel(development));
                      const issuer = identityById(development.issuer_identity_id);
                      const identities = [
                        ...(issuer ? [{identity:issuer,role:"الجهة المصدرة"}] : []),
                        ...(publisher && publisher.id !== issuer?.id ? [{identity:publisher,role:"مصدر التوثيق"}] : [])
                      ];
                      return identities.length ? <div className="sas-identity-byline">
                        {identities.map(({identity,role})=><span className="sas-identity-mark-group" key={role+identity.id}>
                          <span className="sas-identity-mark"><img src={identity.image} alt="" loading="lazy"/></span>
                          <span className="sas-identity-byline-copy"><strong>{identity.name}</strong><small>{role}</small></span>
                        </span>)}
                      </div> : null;
                    })()}
                    <h3>{development.headline_ar}</h3>
                    {development.summary_ar ? <p className="briefing-event-summary"><BriefingEmphasis text={development.summary_ar}/></p> : null}
                    {development.what_changed_ar ? <p className="briefing-dense-change"><strong>ما تغيّر</strong> {development.what_changed_ar}</p> : null}
                    <div className="briefing-dense-foot">
                      <div className="briefing-dense-evidence">
                        <BriefingTypeTag value={development.information_class}/>
                        <BriefingVerification value={development.verification_status}/>
                        {sourceLabel(development) ? <span className="briefing-dense-source-name" title="الجهة الناشرة للمصدر الأساسي أو أول مصدر متاح">{sourceLabel(development)}</span> : <span className="briefing-no-source">لا توجد إحالة عامة</span>}
                        {development.sources.length > 0 ? <BriefingSourcesPopover sources={development.sources} label="التوثيق"/> : null}
                      </div>
                      {studioEdition ? (
                        <Link
                          className="briefing-studio-transfer-link"
                          href={`/admin/news-studio/briefing/${encodeURIComponent(studioEdition.slug)}/${development.order}?revision=${studioEdition.revisionNo}`}
                          title="إنشاء بطاقة بصرية من التطور في استوديو ساس"
                        >
                          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="3" y="4" width="18" height="16" rx="2"/>
                            <path d="m7 15 3.5-3.5 2.5 2.5 3-4 3 4.5"/>
                          </svg>
                          إنشاء بطاقة بصرية
                        </Link>
                      ) : null}
                      {(development.context_ar || development.why_it_matters_ar) ? (
                        <details className="briefing-dense-context">
                          <summary>السياق والدلالة</summary>
                          {development.context_ar ? <p><strong>السياق:</strong> {development.context_ar}</p> : null}
                          {development.why_it_matters_ar ? <p><strong>لماذا يهم:</strong> {development.why_it_matters_ar}</p> : null}
                        </details>
                      ) : null}
                    </div>
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

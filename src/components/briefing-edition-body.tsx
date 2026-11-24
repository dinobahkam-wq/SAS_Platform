"use client";

import { useState } from "react";
import Link from "next/link";
import { SasPillNav } from "@/components/sas-pill-nav";
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
import { BriefingLocationMark } from "@/components/briefing-location-mark";
import "./briefing-dense-layout.css";
import "./briefing-photo.css";
import "./briefing-studio-transfer.css";
import { prioritizeBriefingDevelopments } from "@/lib/briefing-view";
import type { BriefingDevelopment } from "@/lib/public-briefing";
import { findSourceIdentity, identityById, type Identity } from "@/lib/visual-identities";
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

/** Visual classification is factual presentation metadata, not a judgment of accuracy. */
function developmentTone(development: BriefingDevelopment): "critical" | "official" | "regional" | "international" | "neutral" {
  if (development.priority_level === "critical") return "critical";
  if (isOfficialStatement(development)) return "official";
  if (development.geographic_scope === "regional") return "regional";
  const issuer = identityById(development.issuer_identity_id);
  if (issuer?.kind === "international" || development.sources.some(source => source.source_type === "international_organization")) return "international";
  return "neutral";
}

type IdentityRole = { identity: Identity; role: "الجهة المصدرة" | "مصدر التوثيق" };

function developmentIdentityMarks(development: BriefingDevelopment): IdentityRole[] {
  const identities: IdentityRole[] = [];
  const used = new Set<string>();
  const add = (identity: Identity | null, role: IdentityRole["role"]) => {
    if (!identity || used.has(identity.id)) return;
    used.add(identity.id);
    identities.push({ identity, role });
  };
  // The issuer must be explicitly registered. Never infer an authority from a headline.
  add(identityById(development.issuer_identity_id), "الجهة المصدرة");
  add(identityById(development.publisher_identity_id), "مصدر التوثيق");
  const sources = [...development.sources].sort((a,b) =>
    Number(b.source_role === "primary") - Number(a.source_role === "primary"));
  for (const source of sources) {
    add(findSourceIdentity(source.source_name), "مصدر التوثيق");
  }
  return identities;
}

function BriefingIdentityMarks({ development, compact = false }: {
  development: BriefingDevelopment; compact?: boolean;
}) {
  const marks = developmentIdentityMarks(development);
  if (!marks.length) return null;
  const visible = compact ? marks.slice(0,3) : marks.slice(0,4);
  return <div className={compact ? "sas-priority-identities" : "sas-identity-byline"}
    aria-label="الجهات والمصادر الموثقة">
    {visible.map(({identity,role}) => <span className={compact ? "sas-priority-identity" : "sas-identity-mark-group"}
      key={identity.id} title={identity.name + " — " + role}>
      <span className="sas-identity-mark"><img src={identity.image} alt={identity.name} loading="lazy"/></span>
      {!compact && <span className="sas-identity-byline-copy"><strong>{identity.name}</strong><small>{role}</small></span>}
    </span>)}
    {marks.length > visible.length ? <span className="sas-extra-identities" aria-label={`جهات إضافية: ${marks.length-visible.length}`}>+{marks.length-visible.length}</span> : null}
  </div>;
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
  developments,
  studioEdition,
}: {
  developments: BriefingDevelopment[];
  studioEdition?: { slug: string; revisionNo: number } | null;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const ordered = prioritizeBriefingDevelopments(developments);
  const filtered = ordered.filter((development) => matchesTab(development, activeTab));

  const selectedLabel = tabs.find((tab) => tab.key === activeTab)?.label ?? "الكل";
  const sourceLabel = (development: BriefingDevelopment) => development.sources.find((source) => source.source_role === "primary")?.source_name ?? development.sources[0]?.source_name ?? null;

  return (
    <>
      <SasPillNav
        variant="briefing"
        ariaLabel="تصفية سجل التطورات حسب القسم"
        items={tabs.map((tab) => ({
          key: tab.key,
          label: tab.label,
          count: developments.filter((development) => matchesTab(development, tab.key)).length,
        }))}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as Tab)}
      />

      <section className="briefing-developments-section" aria-labelledby="briefing-developments-title">
        <div className="briefing-section-heading briefing-developments-heading">
          <div>
            <span className="sas-layer-eyebrow">02 · السجل التفصيلي</span>
            <h2 id="briefing-developments-title">سجل التطورات</h2>
            <p>{activeTab === "all" ? "اليمن أولًا، ثم الإقليم والعالم المرتبطان به؛ ترتيب العرض لا يغيّر الأرشيف الأصلي." : `التطورات المصنفة ضمن «${selectedLabel}» في هذا العدد.`}</p>
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
                <article id={`sas-development-${development.order}`} className={`briefing-event briefing-event--dense sas-tone-${developmentTone(development)} sas-event-scope-${development.geographic_scope} sas-event-class-${development.information_class}${development.priority_level ? " sas-event-priority-"+development.priority_level : ""}`} key={development.order}>
                  <div className="briefing-event-index">
                    <span>{String(development.order + 1).padStart(2, "0")}</span>
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
                    <div className="sas-development-visual-identities">
                      <BriefingIdentityMarks development={development}/>
                      <BriefingLocationMark place={development.place}/>
                    </div>
                    <div className={development.image ? "sas-briefing-media-row" : "sas-briefing-media-row sas-briefing-media-row--text-only"}>
                      {development.image ? <figure className="sas-briefing-photo">
                        <img src={development.image.url} alt={development.image.alt_text || `صورة مرافقة: ${development.headline_ar}`} loading="lazy" decoding="async"/>
                        {development.image.caption || development.image.credit ? <figcaption>{[development.image.caption, development.image.credit].filter(Boolean).join(" · ")}</figcaption> : null}
                      </figure> : null}
                      <div className="sas-briefing-media-copy">
                        <h3>{development.headline_ar}</h3>
                        {development.summary_ar ? <p className="briefing-event-summary"><BriefingEmphasis text={development.summary_ar}/></p> : null}
                      </div>
                    </div>

                    <div className="briefing-dense-foot">
                      <div className="briefing-dense-evidence">
                        <BriefingTypeTag value={development.information_class}/>
                        <BriefingVerification value={development.verification_status}/>
                        {sourceLabel(development) ? <span className="briefing-dense-source-name" title="الجهة الناشرة للمصدر الأساسي أو أول مصدر متاح">{sourceLabel(development)}</span> : <span className="briefing-no-source">لا توجد إحالة عامة</span>}
                        {development.sources.length > 0 ? <BriefingSourcesPopover sources={development.sources} label="التوثيق"/> : null}
                      </div>
                      {studioEdition ? <Link
                        className="briefing-studio-transfer-link"
                        href={`/admin/briefings/enrich/${encodeURIComponent(studioEdition.slug)}`}
                        title="إضافة صورة إلى هذا التطور عبر مراجعة الإحاطة"
                      >إضافة صورة</Link> : null}
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

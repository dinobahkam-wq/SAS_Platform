import Link from "next/link";
import "./visual-knowledge-feature.css";

type FeatureVariant = "lead" | "supporting";

function FeatureArrow() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5m7 7-7-7 7-7" /></svg>;
}

/**
 * The cover is a visual index of the subject matter, not a literal
 * constitutional hierarchy: population, territory, authority and
 * sovereignty are conceptual elements of a state.
 */
function CivicCover() {
  return (
    <div className="sas-vk-cover sas-vk-cover--civic" aria-hidden="true">
      <div className="sas-vk-cover-top"><span className="sas-vk-cover-mark">02 / SAS</span><span>علم السياسة</span></div>
      <div className="sas-vk-civic-diagram">
        <div className="sas-vk-civic-hub"><span className="sas-vk-hub-mark">◆</span><strong>الدولة</strong><small>كيان سياسي وقانوني</small></div>
        <div className="sas-vk-civic-grid">
          <span>السكان</span><span>الإقليم</span><span>السلطة العامة</span><span>السيادة</span>
        </div>
      </div>
      <div className="sas-vk-cover-foot"><span>المفاهيم</span><span>المؤسسات</span><span>نظم الحكم</span></div>
    </div>
  );
}

function TimelineCover() {
  const markers = [
    { year: "2014", label: "تحول سياسي", featured: true },
    { year: "2015", label: "", featured: false },
    { year: "2016", label: "", featured: false },
    { year: "2017", label: "", featured: false },
    { year: "2018", label: "مسار تفاوضي", featured: true },
    { year: "2019", label: "", featured: false },
    { year: "2022", label: "تحول مؤسسي", featured: true },
  ];
  return (
    <div className="sas-vk-cover sas-vk-cover--timeline" aria-hidden="true">
      <div className="sas-vk-cover-top"><span className="sas-vk-cover-mark">01 / SAS</span><span>التاريخ السياسي</span></div>
      <div className="sas-vk-timeline-graphic">
        <div className="sas-vk-timeline-overline">محطات غيّرت مسار الأزمة</div>
        <div className="sas-vk-timeline-track">
          {markers.map((item) => (
            <div key={item.year} className={"sas-vk-timeline-stop" + (item.featured ? " is-featured" : "")}>
              <span className="sas-vk-timeline-year">{item.year}</span>
              <span className="sas-vk-timeline-point" />
              <span className="sas-vk-timeline-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="sas-vk-cover-foot"><span>8 محطات موثقة</span><span>2014 — 2022</span></div>
    </div>
  );
}

const visualItems = {
  civic: {
    href: "/visual-knowledge/state-and-government",
    eyebrow: "التثقيف السياسي · الإصدار 02",
    type: "دليل تفاعلي",
    title: "ما الدولة؟ وكيف تعمل أنظمة الحكم؟",
    description: "افهم الفرق بين الدولة والحكومة، وأركان الدولة وأشكالها، وقارن بين النظم البرلمانية والرئاسية وشبه الرئاسية.",
    metadata: ["5 وحدات", "3 أنظمة حكم", "اختبار فهم"],
    action: "استكشاف الدليل",
  },
  timeline: {
    href: "/visual-knowledge/yemen-crisis-timeline",
    eyebrow: "التحولات السياسية · الإصدار 01",
    type: "خط زمني موثق",
    title: "اليمن: محطات أعادت تشكيل الأزمة",
    description: "ثماني محطات من 2014 إلى 2022 تكشف تغيرات المشهد اليمني، مع مصادر لكل واقعة.",
    metadata: ["2014–2022", "8 محطات"],
    action: "استعراض المحطات",
  },
} as const;

function KnowledgeCard({ type, variant }: { type: "civic" | "timeline"; variant: FeatureVariant }) {
  const item = visualItems[type];
  return (
    <article className={`sas-visual-feature sas-visual-feature--${variant} sas-visual-feature--${type}`}>
      <div className="sas-visual-feature-content">
        <span className="sas-visual-feature-label"><span className="sas-visual-feature-dot" aria-hidden="true" />{item.eyebrow}</span>
        <span className="sas-visual-feature-type">{item.type}</span>
        <h3><Link href={item.href}>{item.title}</Link></h3>
        <p className="sas-visual-feature-description">{item.description}</p>
        <div className="sas-visual-feature-meta">
          {item.metadata.map((value) => <span key={value}>{value}</span>)}
        </div>
        <Link href={item.href} className={"sas-visual-feature-action sas-cta " + (variant === "lead" ? "sas-cta--primary" : "sas-cta--secondary")} aria-label={item.action + ": " + item.title}>
          {item.action}<FeatureArrow />
        </Link>
      </div>
      {type === "civic" ? <CivicCover /> : <TimelineCover />}
    </article>
  );
}

/** The main release has a larger editorial treatment; the other is supporting. */
export function CivicKnowledgeFeature({ variant = "lead" }: { variant?: FeatureVariant; compact?: boolean }) {
  return <KnowledgeCard type="civic" variant={variant} />;
}

export function VisualKnowledgeFeature({ variant = "supporting" }: { variant?: FeatureVariant; compact?: boolean }) {
  return <KnowledgeCard type="timeline" variant={variant} />;
}

/**
 * The homepage and archive share the same coherent editorial hierarchy.
 * New releases can be added to the secondary grid without multiplying leads.
 */
export function VisualKnowledgeShowcase() {
  return (
    <div className="sas-visual-showcase" aria-label="إصدارات المعرفة البصرية">
      <CivicKnowledgeFeature />
      <div className="sas-visual-showcase-supporting"><VisualKnowledgeFeature /></div>
    </div>
  );
}

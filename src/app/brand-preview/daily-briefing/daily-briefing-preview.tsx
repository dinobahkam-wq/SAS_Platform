"use client";

import { useMemo, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";

type ViewMode = "reader" | "workspace";
type Category = "politics" | "security" | "diplomacy" | "economy";
type Classification = "fact" | "position" | "claim";

type BriefingSource = {
  id: string;
  name: string;
  title: string;
  kind: string;
  role: string;
  publishedAt: string;
  excerpt: string;
  url: string;
};

type BriefingUpdate = {
  id: string;
  category: Category;
  categoryLabel: string;
  classification: Classification;
  classificationLabel: string;
  time: string;
  title: string;
  summary: string;
  whatChanged: string;
  whyItMatters: string;
  source: BriefingSource;
};

const sources: BriefingSource[] = [
  {
    id: "src-01",
    name: "جهة حكومية افتراضية",
    title: "بيان رسمي توضيحي حول تطور دبلوماسي",
    kind: "بيان رسمي",
    role: "مصدر أولي",
    publishedAt: "12 نوفمبر 2026 · 16:40",
    excerpt: "مقتطف توضيحي من نص مصدر افتراضي. في النسخة الفعلية يُعرض النص الأصلي حرفيًا مع رابط مباشر إلى الجهة الناشرة.",
    url: "#",
  },
  {
    id: "src-02",
    name: "وكالة أنباء افتراضية",
    title: "تقرير إخباري عن تطور أمني",
    kind: "وكالة أنباء",
    role: "مصدر ثانوي",
    publishedAt: "12 نوفمبر 2026 · 15:25",
    excerpt: "مقتطف توضيحي من مادة صحفية افتراضية. يميّز سجل المصدر بين ما تنقله الوكالة وما تؤكده مصادر مستقلة.",
    url: "#",
  },
  {
    id: "src-03",
    name: "مؤسسة دولية افتراضية",
    title: "موجز مؤسسي حول مؤشرات اقتصادية",
    kind: "وثيقة مؤسسية",
    role: "مصدر أولي",
    publishedAt: "12 نوفمبر 2026 · 12:10",
    excerpt: "مقتطف توضيحي من وثيقة افتراضية. تُحفظ بيانات الإصدار والجهة والرابط وتاريخ الوصول عند بناء سجل المصدر.",
    url: "#",
  },
];

const updates: BriefingUpdate[] = [
  {
    id: "upd-01",
    category: "diplomacy",
    categoryLabel: "دبلوماسي",
    classification: "position",
    classificationLabel: "موقف رسمي",
    time: "18:20",
    title: "تطور دبلوماسي افتراضي في ملف اليمن",
    summary: "مثال تصميمي لعرض موقف صادر عن جهة رسمية، مع إسناد واضح إلى البيان الأصلي وعدم تحويل صياغة الجهة إلى حقيقة مستقلة.",
    whatChanged: "التغير في هذا المثال هو صدور بيان جديد يتضمن صياغة مختلفة عن الموقف السابق للجهة.",
    whyItMatters: "تُقاس الدلالة هنا بمقارنة اللغة المستخدمة، والجهة المخاطبة، وما إذا كان البيان يضيف التزامًا أو يكتفي بإعادة تأكيد موقف سابق.",
    source: sources[0],
  },
  {
    id: "upd-02",
    category: "security",
    categoryLabel: "أمني",
    classification: "claim",
    classificationLabel: "ادعاء منسوب",
    time: "16:45",
    title: "تطور أمني افتراضي في إحدى الجبهات",
    summary: "مثال على خبر يتضمن رواية صادرة عن طرف مشارك. تظهر صفة الادعاء بوضوح إلى حين التحقق المستقل.",
    whatChanged: "ظهور رواية جديدة بشأن واقعة ميدانية، دون توافر تأكيد مستقل ضمن هذا المثال.",
    whyItMatters: "لا تُعامل الرواية بوصفها واقعة مثبتة. تُقارن مع بيانات الأطراف الأخرى والمصادر المستقلة قبل رفع مستوى الثقة.",
    source: sources[1],
  },
  {
    id: "upd-03",
    category: "economy",
    categoryLabel: "اقتصادي",
    classification: "fact",
    classificationLabel: "واقعة موثقة",
    time: "13:10",
    title: "مؤشر اقتصادي افتراضي مرتبط باليمن",
    summary: "مثال لبيان معلومة رقمية أو مؤسسية مع الاحتفاظ بوثيقة المصدر وتاريخ نشرها وسياق المؤشر.",
    whatChanged: "نشر تحديث جديد لمؤشر اقتصادي في وثيقة مؤسسية افتراضية.",
    whyItMatters: "تُقرأ قيمة المؤشر بمقارنته بالسلسلة الزمنية وبالمنهجية التي أنتجته، لا بعزل الرقم عن سياقه.",
    source: sources[2],
  },
];

const filters = [
  { id: "all", label: "كل التطورات" },
  { id: "politics", label: "سياسي" },
  { id: "diplomacy", label: "دبلوماسي" },
  { id: "security", label: "أمني" },
  { id: "economy", label: "اقتصادي" },
];

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.65,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  if (name === "politics") {
    return <svg {...common}><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6M9 10h.01M15 10h.01" /></svg>;
  }
  if (name === "security") {
    return <svg {...common}><path d="M12 3 20 6v5c0 5-3.3 8.4-8 10-4.7-1.6-8-5-8-10V6l8-3Z" /><path d="m9 12 2 2 4-4" /></svg>;
  }
  if (name === "diplomacy") {
    return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>;
  }
  if (name === "economy") {
    return <svg {...common}><path d="M3 20h18M5 16l4-4 3 2 7-8" /><path d="M15 6h4v4" /></svg>;
  }
  if (name === "shield") {
    return <svg {...common}><path d="M12 3 20 6v5c0 5-3.3 8.4-8 10-4.7-1.6-8-5-8-10V6l8-3Z" /></svg>;
  }
  if (name === "source") {
    return <svg {...common}><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 12h7M9 16h7" /></svg>;
  }
  if (name === "clock") {
    return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
  }
  if (name === "check") {
    return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></svg>;
  }
  if (name === "layers") {
    return <svg {...common}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></svg>;
  }
  if (name === "message") {
    return <svg {...common}><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 9 9 0 0 1-4-.9L4 20l1.2-3.4A7.2 7.2 0 0 1 4 12c0-4.2 3.6-7.5 8-7.5s8 2.8 8 7Z" /><path d="M8 11h8M8 14h5" /></svg>;
  }
  return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>;
}

function CategoryIcon({ category }: { category: Category }) {
  return <Icon name={category} size={18} />;
}

function SourceButton({
  source,
  onOpen,
}: {
  source: BriefingSource;
  onOpen: (source: BriefingSource) => void;
}) {
  return (
    <button className="briefing-source-button" type="button" onClick={() => onOpen(source)}>
      <span className="briefing-source-icon"><Icon name="source" size={15} /></span>
      <span className="briefing-source-copy">
        <strong>{source.name}</strong>
        <small>{source.role} · {source.kind}</small>
      </span>
      <span className="briefing-source-open">بيانات المصدر <span aria-hidden="true">↗</span></span>
    </button>
  );
}

function ReaderView() {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>("upd-01");
  const [selectedSource, setSelectedSource] = useState<BriefingSource | null>(null);
  const visibleUpdates = useMemo(
    () => updates.filter((item) => filter === "all" || item.category === filter),
    [filter],
  );

  return (
    <div className="briefing-reader">
      <div className="briefing-public-header">
        <a href="/" className="briefing-brand"><BrandLogo variant="full" /><span>الإحاطة اليومية</span></a>
        <nav aria-label="التنقل داخل الإحاطة">
          <a href="#briefing-reading">قراءة ساس</a>
          <a href="#briefing-ledger">سجل التطورات</a>
          <a href="#briefing-method">المنهجية</a>
        </nav>
        <span className="briefing-header-date">12 نوفمبر 2026</span>
      </div>

      <section className="briefing-hero">
        <div className="briefing-hero-main">
          <div className="briefing-kicker"><span className="briefing-kicker-line" /> إحاطة سياسية واستراتيجية</div>
          <h1>الإحاطة <em>اليمنية</em></h1>
          <p className="briefing-hero-deck">ما الذي تغيّر؟ وما الذي يستحق الانتباه؟ قراءة منظمة للتطورات ومصادرها وسياقاتها.</p>
          <div className="briefing-hero-meta">
            <span><Icon name="clock" size={14} /> نافذة التغطية: 24 ساعة</span>
            <span><Icon name="check" size={14} /> آخر تحقق: 19:45 بتوقيت اليمن</span>
          </div>
        </div>
        <div className="briefing-hero-stats">
          <div><strong>03</strong><span>تطورات مختارة</span></div>
          <div><strong>03</strong><span>مصادر موثقة</span></div>
          <div><strong>04</strong><span>محاور رصد</span></div>
        </div>
        <div className="briefing-hero-index">SAS / DAILY BRIEFING / 001</div>
      </section>

      <div className="briefing-preview-disclaimer">
        <Icon name="info" size={15} />
        نموذج تصميم داخلي — جميع الأحداث والمصادر والتواريخ الواردة في هذه المعاينة افتراضية ولا تمثل أخبارًا حقيقية.
      </div>

      <section className="briefing-snapshot">
        <div className="briefing-section-heading">
          <span className="briefing-section-index">01</span>
          <div><span>خلاصة العدد</span><h2>أبرز ما يستحق الانتباه</h2></div>
        </div>
        <div className="briefing-snapshot-grid">
          <article><span className="briefing-snapshot-no">01</span><p>موقف رسمي جديد يستدعي المقارنة بالنصوص السابقة، لا الاكتفاء بعنوان البيان.</p></article>
          <article><span className="briefing-snapshot-no">02</span><p>رواية أمنية منسوبة إلى طرف، يجب إبقاؤها في نطاق الادعاء حتى التحقق المستقل.</p></article>
          <article><span className="briefing-snapshot-no">03</span><p>مؤشر مؤسسي يحتاج إلى قراءة زمنية ومنهجية قبل استخلاص دلالته الاقتصادية.</p></article>
        </div>
      </section>

      <section className="briefing-reading" id="briefing-reading">
        <div className="briefing-section-heading">
          <span className="briefing-section-index">02</span>
          <div><span>القراءة الرئيسية</span><h2>قراءة ساس</h2></div>
          <span className="briefing-reading-length">نموذج نصي · 3 دقائق</span>
        </div>
        <div className="briefing-reading-body">
          <p className="briefing-reading-lead">لا تُقاس أهمية التطورات اليومية بعدد الأخبار المنشورة عنها، بل بما تضيفه إلى فهم اتجاهات الأزمة وموازين الفاعلين.</p>
          <p>في هذا النموذج التوضيحي، تُقرأ المواقف الرسمية بوصفها نصوصًا سياسية لها سياقها ومفرداتها، وتُفصل الروايات المنسوبة إلى الأطراف عن الوقائع التي أمكن التحقق منها. كما تُعامل المؤشرات الاقتصادية باعتبارها سلاسل بيانات لا أرقامًا معزولة.</p>
          <p>قيمة الإحاطة ليست في إعادة سرد ما نُشر، بل في ترتيب الأدلة، وإظهار ما تغيّر فعلًا، وتحديد ما لا يزال غير محسوم. لذلك يبدأ كل تطور بمصدره، ثم يأتي تفسير دلالته في سياق أوسع.</p>
          <blockquote>المصدر يثبت ما قالته الجهة أو نشرته؛ أما دلالة ذلك على مسار الأزمة فتحتاج إلى تحليل مستقل.</blockquote>
        </div>
      </section>

      <section className="briefing-ledger" id="briefing-ledger">
        <div className="briefing-section-heading">
          <span className="briefing-section-index">03</span>
          <div><span>قاعدة الأدلة</span><h2>سجل التطورات</h2></div>
          <span className="briefing-ledger-count">03 سجلات</span>
        </div>
        <div className="briefing-ledger-intro">كل سجل يميّز بين طبيعة المعلومة، وتوقيت التطور، والمصدر الذي يستند إليه.</div>
        <div className="briefing-filters" role="group" aria-label="تصفية التطورات">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              className={filter === item.id ? "is-active" : ""}
              onClick={() => setFilter(item.id)}
            >{item.label}</button>
          ))}
        </div>

        <div className="briefing-update-list">
          {visibleUpdates.map((item, index) => (
            <article className="briefing-update" key={item.id}>
              <div className="briefing-update-rail">
                <span className="briefing-update-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="briefing-update-line" />
              </div>
              <div className="briefing-update-content">
                <div className="briefing-update-meta">
                  <span className={"briefing-category briefing-category-" + item.category}><CategoryIcon category={item.category} />{item.categoryLabel}</span>
                  <span className={"briefing-classification briefing-classification-" + item.classification}>{item.classificationLabel}</span>
                  <time><Icon name="clock" size={13} /> {item.time}</time>
                </div>
                <h3>{item.title}</h3>
                <p className="briefing-update-summary">{item.summary}</p>
                <SourceButton source={item.source} onOpen={setSelectedSource} />
                <button
                  type="button"
                  className="briefing-update-expand"
                  aria-expanded={expanded === item.id}
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                >
                  {expanded === item.id ? "إخفاء التفاصيل" : "تفاصيل التطور وقراءته"}
                  <span>{expanded === item.id ? "−" : "+"}</span>
                </button>
                {expanded === item.id ? (
                  <div className="briefing-update-details">
                    <div><strong>ما الذي تغيّر؟</strong><p>{item.whatChanged}</p></div>
                    <div><strong>لماذا يهم؟</strong><p>{item.whyItMatters}</p></div>
                    <button type="button" onClick={() => setSelectedSource(item.source)}>فحص المصدر وتفاصيله <span aria-hidden="true">←</span></button>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
          {!visibleUpdates.length ? <p className="briefing-no-results">لا توجد تطورات ضمن هذا التصنيف في النموذج.</p> : null}
        </div>
      </section>

      <section className="briefing-method" id="briefing-method">
        <div className="briefing-section-heading">
          <span className="briefing-section-index">04</span>
          <div><span>الشفافية التحريرية</span><h2>المصادر والمنهجية</h2></div>
        </div>
        <div className="briefing-method-grid">
          <div><Icon name="layers" size={20} /><h3>تصنيف المعلومة</h3><p>واقعة موثقة، موقف منسوب، ادعاء يحتاج إلى تحقق، أو تحليل صادر عن ساس.</p></div>
          <div><Icon name="source" size={20} /><h3>أولوية المصدر</h3><p>تقديم الوثيقة أو البيان الأصلي متى كان متاحًا، مع التمييز بين المصادر الأولية والثانوية.</p></div>
          <div><Icon name="check" size={20} /><h3>حدود التغطية</h3><p>إظهار نافذة الرصد ووقت آخر تحقق، والتنبيه إلى المعلومات غير المحسومة.</p></div>
        </div>
        <p className="briefing-method-note">تُختار التطورات وفق التأثير والجدة والانتشار وجودة التوثيق والاستمرارية، لا وفق كثافة التغطية الإعلامية وحدها.</p>
      </section>

      <footer className="briefing-reader-footer">
        <BrandLogo variant="compact" />
        <div><strong>منصة ساس للإعلام والدراسات</strong><span>إحاطة مبنية على الأدلة والمصادر</span></div>
        <span className="briefing-footer-code">SAS · RESEARCH & MEDIA</span>
      </footer>

      {selectedSource ? (
        <div className="briefing-source-backdrop" role="presentation" onClick={() => setSelectedSource(null)}>
          <aside className="briefing-source-panel" role="dialog" aria-modal="true" aria-label="تفاصيل المصدر" onClick={(event) => event.stopPropagation()}>
            <div className="briefing-source-panel-head">
              <span className="briefing-panel-kicker">سجل المصدر</span>
              <button type="button" onClick={() => setSelectedSource(null)} aria-label="إغلاق">×</button>
            </div>
            <div className="briefing-source-panel-icon"><Icon name="source" size={23} /></div>
            <span className="briefing-source-role">{selectedSource.role} · {selectedSource.kind}</span>
            <h2>{selectedSource.name}</h2>
            <h3>{selectedSource.title}</h3>
            <dl>
              <div><dt>تاريخ النشر</dt><dd>{selectedSource.publishedAt}</dd></div>
              <div><dt>معرّف المصدر</dt><dd dir="ltr">{selectedSource.id}</dd></div>
            </dl>
            <div className="briefing-source-excerpt"><span>مقتطف من المصدر</span><p>{selectedSource.excerpt}</p></div>
            <a className="briefing-source-link is-disabled" href={selectedSource.url} aria-disabled="true" onClick={(event) => event.preventDefault()}>رابط المصدر غير متاح في النموذج <span>↗</span></a>
            <p className="briefing-source-disclaimer">في النسخة الفعلية سيقود هذا الرابط إلى المادة الأصلية مباشرة، مع حفظ وقت الوصول وبيانات التحقق.</p>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function WorkspaceView() {
  const [headline, setHeadline] = useState("الإحاطة اليمنية");
  const [lead, setLead] = useState("ملخص تحريري موجز يوضح أهم ما تغيّر خلال نافذة الرصد، ويهيئ القارئ لفهم سجل التطورات.");
  const [analysis, setAnalysis] = useState("تُكتب القراءة الرئيسية بعد مراجعة التطورات والمصادر المرتبطة بها. يجب أن تفسر العلاقة بين الوقائع والمواقف والادعاءات، وأن تميز استنتاج ساس من النص المنقول.");
  const [prompt, setPrompt] = useState("");
  const [promptState, setPromptState] = useState(false);

  return (
    <div className="briefing-workspace">
      <header className="briefing-workspace-header">
        <div className="briefing-workspace-brand"><BrandLogo variant="compact" /><div><strong>غرفة تحرير ساس</strong><span>الإحاطة اليومية</span></div></div>
        <div className="briefing-workspace-status"><span className="briefing-status-dot" /> نموذج داخلي · غير متصل بقاعدة البيانات</div>
        <div className="briefing-workspace-actions"><button type="button" disabled>حفظ المسودة</button><button type="button" disabled>إرسال للمراجعة</button></div>
      </header>

      <div className="briefing-workspace-body">
        <aside className="briefing-workspace-sidebar">
          <div className="briefing-workspace-side-head"><span>مساحة العمل</span><button type="button" disabled>＋ عدد جديد</button></div>
          <div className="briefing-edition-mini is-current"><span className="briefing-mini-date">12 نوفمبر 2026</span><strong>الإحاطة اليمنية</strong><span className="briefing-mini-status">مسودة تصميمية</span></div>
          <div className="briefing-edition-mini"><span className="briefing-mini-date">—</span><strong>لا توجد أعداد أخرى</strong><span className="briefing-mini-status">قائمة تجريبية</span></div>
          <div className="briefing-side-divider" />
          <div className="briefing-workspace-side-head"><span>مصادر العدد</span><span className="briefing-side-count">03</span></div>
          {sources.map((source) => (
            <div className="briefing-workspace-source" key={source.id}>
              <Icon name="source" size={16} />
              <div><strong>{source.name}</strong><small>{source.role}</small></div>
            </div>
          ))}
          <div className="briefing-workspace-sidebar-note"><Icon name="info" size={15} /><p>هذه القائمة توضيحية. لن تظهر المصادر في الواجهة العامة إلا من خلال سجلات مرتبطة بتطور منشور.</p></div>
        </aside>

        <main className="briefing-editor-canvas">
          <div className="briefing-editor-topline"><div><span className="briefing-panel-kicker">تحرير العدد / 001</span><h1>إعداد الإحاطة</h1></div><span className="briefing-editor-version">نسخة تصميمية 0.1</span></div>
          <div className="briefing-editor-metadata">
            <label><span>تاريخ الإصدار</span><input value="12 نوفمبر 2026" readOnly /></label>
            <label><span>بداية نافذة التغطية</span><input value="11 نوفمبر · 20:00" readOnly /></label>
            <label><span>نهاية نافذة التغطية</span><input value="12 نوفمبر · 20:00" readOnly /></label>
          </div>
          <section className="briefing-editor-section">
            <div className="briefing-editor-section-title"><span>01</span><h2>بيانات العدد</h2></div>
            <label className="briefing-editor-field"><span>عنوان الإحاطة</span><input value={headline} onChange={(event) => setHeadline(event.target.value)} /></label>
            <label className="briefing-editor-field"><span>المشهد في دقيقة</span><textarea rows={3} value={lead} onChange={(event) => setLead(event.target.value)} /></label>
          </section>
          <section className="briefing-editor-section">
            <div className="briefing-editor-section-title"><span>02</span><h2>القراءة الرئيسية</h2><span className="briefing-word-target">الهدف: 400–650 كلمة</span></div>
            <label className="briefing-editor-field"><span>قراءة ساس</span><textarea rows={7} value={analysis} onChange={(event) => setAnalysis(event.target.value)} /></label>
            <div className="briefing-editor-hint">تحرير محلي للمعاينة فقط. لا يتم حفظ النص أو إرساله إلى أي خدمة.</div>
          </section>
          <section className="briefing-editor-section">
            <div className="briefing-editor-section-title"><span>03</span><h2>سجل التطورات المختارة</h2></div>
            {updates.map((item, index) => (
              <div className="briefing-editor-update" key={item.id}>
                <span className="briefing-editor-update-no">{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{item.title}</strong><small>{item.categoryLabel} · {item.classificationLabel} · مصدر مرتبط</small></div>
                <span className="briefing-editor-ready"><Icon name="check" size={13} /> مكتمل شكليًا</span>
              </div>
            ))}
            <button className="briefing-add-update" type="button" disabled>＋ إضافة تطور من السجل</button>
          </section>
          <div className="briefing-editor-footer-actions"><button type="button" disabled>حفظ المسودة</button><button type="button" disabled>إرسال للمراجعة</button><span>الأزرار غير مفعّلة حتى اكتمال نموذج البيانات والصلاحيات.</span></div>
        </main>

        <aside className="briefing-ai-panel">
          <div className="briefing-ai-panel-head"><span className="briefing-ai-mark"><Icon name="message" size={19} /></span><div><strong>مساعد ساس التحريري</strong><small>مخصص لهيئة التحرير</small></div></div>
          <div className="briefing-ai-private"><Icon name="shield" size={14} /> مساحة خاصة بالمحرر — لا تظهر للقراء</div>
          <div className="briefing-ai-conversation">
            <div className="briefing-ai-message briefing-ai-message-system">يمكنني مساعدتك في فحص المصادر، ومقارنة البيانات الرسمية، وفصل الوقائع عن الادعاءات، وتحسين صياغة القراءة التحليلية.</div>
            <div className="briefing-ai-message briefing-ai-message-user">قارن لغة هذا البيان بآخر بيان للجهة نفسها.</div>
            <div className="briefing-ai-message briefing-ai-message-system">ستُعرض المقارنة هنا بعد ربط المساعد بمصادر العدد وسجلها. لن يُسمح له باعتماد العدد أو نشره.</div>
          </div>
          <div className="briefing-ai-capabilities">
            <span>مهام مقترحة</span>
            <button type="button" onClick={() => setPrompt("استخرج الموقف الرسمي وصنّف لغته، مع إرفاق النص الأصلي.")}>تحليل بيان رسمي</button>
            <button type="button" onClick={() => setPrompt("قارن هذا التطور بما سبقه وحدد ما تغيّر فعلًا.")}>مقارنة التطورات</button>
            <button type="button" onClick={() => setPrompt("راجع هذا النص وافصل الوقائع عن الادعاءات والاستنتاجات.")}>مراجعة الدقة التحريرية</button>
          </div>
          <label className="briefing-ai-composer"><span>طلب تحريري</span><textarea rows={3} value={prompt} onChange={(event) => { setPrompt(event.target.value); setPromptState(false); }} placeholder="اكتب ما تريد من المساعد..." /></label>
          <button className="briefing-ai-send" type="button" disabled={!prompt.trim()} onClick={() => setPromptState(true)}>تجهيز الطلب</button>
          {promptState ? <p className="briefing-ai-notice">تم تجهيز النص داخل المعاينة فقط. اتصال GPT الفعلي لم يُنفّذ بعد.</p> : null}
          <div className="briefing-ai-integration-note">تكامل GPT الفعلي سيكون عبر الخادم وبمفتاح محفوظ في بيئة التشغيل، مع صلاحية اقتراح وتحرير فقط، ومن دون صلاحية النشر.</div>
        </aside>
      </div>
    </div>
  );
}

export default function DailyBriefingPreview() {
  const [view, setView] = useState<ViewMode>("reader");

  return (
    <main className="briefing-preview-root">
      <div className="briefing-preview-switcher">
        <span>معاينة اتجاه الإحاطة اليومية</span>
        <div role="group" aria-label="اختيار المعاينة">
          <button type="button" className={view === "reader" ? "is-active" : ""} onClick={() => setView("reader")}>واجهة القارئ</button>
          <button type="button" className={view === "workspace" ? "is-active" : ""} onClick={() => setView("workspace")}>غرفة التحرير</button>
        </div>
      </div>
      {view === "reader" ? <ReaderView /> : <WorkspaceView />}
    </main>
  );
}

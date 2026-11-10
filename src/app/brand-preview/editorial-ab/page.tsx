import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export const metadata = {
  title: "مقارنة النظامين التحريريين A وB | منصة ساس",
  description:
    "مقارنة تطبيقية بين تجاريب طويل وحده في العناوين، وبين تجاريب للعناوين الرئيسية وثمانية سيريف ديسبلاي للعناوين الفرعية.",
  robots: { index: false, follow: false },
};

const weights = [
  { value: 300, label: "خفيف" },
  { value: 400, label: "عادي" },
  { value: 500, label: "متوسط" },
  { value: 700, label: "عريض" },
  { value: 900, label: "أسود" },
];

const systems = [
  {
    code: "A",
    title: "تجاريب في جميع العناوين",
    subtitle: "TAJARIB DISPLAY + THMANYAH SANS",
    className: "ab-system-a",
    secondaryFont: "Tajarib Taweel",
    secondaryFontLabel: "تجاريب طويل",
  },
  {
    code: "B",
    title: "تجاريب + ثمانية سيريف",
    subtitle: "TAJARIB DISPLAY + THMANYAH SERIF DISPLAY + SANS",
    className: "ab-system-b",
    secondaryFont: "Thmanyah Serif Display",
    secondaryFontLabel: "ثمانية Serif Display",
  },
] as const;

function WeightSpecimen({
  family,
  familyLabel,
}: {
  family: string;
  familyLabel: string;
}) {
  return (
    <section className="ab-weight-section">
      <div className="ab-sample-label">WEIGHT SPECIMEN · {familyLabel}</div>
      <div className="ab-weight-list" style={{ fontFamily: `"${family}", "Thmanyah Sans", sans-serif` }}>
        {weights.map((weight) => (
          <div className="ab-weight-row" key={weight.value}>
            <span style={{ fontWeight: weight.value }}>
              الدولة، المجتمع، المعرفة والتحليل.
            </span>
            <small>{weight.value} · {weight.label}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function SystemPanel({
  code,
  title,
  subtitle,
  className,
  secondaryFont,
  secondaryFontLabel,
}: (typeof systems)[number]) {
  return (
    <article className={`ab-system ${className}`}>
      <header className="ab-system-header">
        <div>
          <span className="ab-system-code">SYSTEM {code}</span>
          <h2>{title}</h2>
        </div>
        <span className="ab-system-subtitle">{subtitle}</span>
      </header>

      <div className="ab-system-content">
        <section className="ab-primary-headline">
          <div className="ab-sample-label">01 / PRIMARY EDITORIAL HEADLINE · TAJARIB BLACK 900</div>
          <span className="eyebrow">تحليل سياسي · اليمن · نموذج تجريبي</span>
          <h3>
            كيف أعاد التدخل السعودي تشكيل الأزمة اليمنية؟ حدود إدارة الصراع واحتمالات استعادة الدولة
          </h3>
          <p>
            اختبار عنوان تحريري طويل لقياس قوة الحضور البصري، وتماسك السطور،
            ووضوح الحروف عند استخدام الوزن الأسود في العناوين الرئيسية.
          </p>
          <div className="ab-meta-row">
            <span>منصة ساس</span>
            <span>مادة تجريبية غير منشورة</span>
            <span>تجاريب طويل · 900</span>
          </div>
        </section>

        <section className="ab-article-sample">
          <div className="ab-sample-label">02 / ARTICLE TITLE · {code === "A" ? "TAJARIB BOLD 700" : "THMANYAH SERIF DISPLAY BOLD 700"}</div>
          <h3>الدولة قبل التسوية: سؤال بناء القدرة الوطنية</h3>
          <p className="ab-deck">
            لا تُقاس التسوية السياسية بقدرتها على إيقاف المواجهة فحسب، بل
            بقدرتها على إعادة بناء المؤسسات التي تجعل الاتفاق قابلًا للتنفيذ والاستمرار.
          </p>
          <div className="ab-meta-row">
            <span>القسم: التحليل والرأي</span>
            <span>زمن القراءة: 6 دقائق</span>
          </div>

          <div className="ab-body-copy">
            <p>
              لا تبدأ معالجة الأزمات الوطنية من لحظة توقيع الاتفاقات، بل من
              تحديد البنية المؤسسية القادرة على تحويل التفاهمات السياسية إلى
              قواعد نافذة وممارسات مستقرة. ومن دون هذه القدرة، تتحول التسوية
              إلى ترتيب مؤقت لإدارة التوازنات، لا إلى مدخل لاستعادة الدولة.
            </p>
            <h4>من الاتفاق السياسي إلى القدرة المؤسسية</h4>
            <p>
              يتطلب الانتقال من التسوية إلى الاستقرار وجود مؤسسات عامة موحدة،
              وسلسلة واضحة للمسؤولية، واحتكار قانوني ومنظم لأدوات الإكراه،
              إلى جانب قدرة إدارية ومالية تضمن استمرار الخدمات العامة وإنفاذ القرارات.
            </p>
            <h5>المؤسسات بوصفها شرطًا للاستدامة</h5>
            <p>
              عندما تتعدد مراكز القرار والتنفيذ، تصبح الالتزامات عرضة للتعطيل
              أو الانتقائية. لذلك ينبغي أن تتجه المعالجة إلى إعادة بناء الوظائف
              العامة وربطها بمسؤوليات محددة وآليات رقابة ومساءلة قابلة للتحقق.
            </p>
            <blockquote>
              الاختبار الحقيقي لأي تسوية ليس ما تتضمنه وثيقتها، بل ما تستطيع
              مؤسسات الدولة تنفيذه بعد توقيعها.
            </blockquote>
          </div>
        </section>

        <section className="ab-report-sample">
          <div className="ab-sample-label">03 / RESEARCH REPORT TITLE</div>
          <span className="ab-report-kicker">منصة ساس · دراسات وأبحاث</span>
          <h3>تحولات البيئة الإقليمية وأثرها في مسارات الأزمة اليمنية</h3>
          <p>
            نموذج عنوان غلاف تقرير بحثي يختبر حضور الخط الثانوي في مساحة أكبر،
            مع المحافظة على وضوح التسلسل بين العنوان الرئيسي والعناوين الداخلية.
          </p>
          <div className="ab-report-meta">
            <div><small>نوع المنتج</small><strong>تقرير بحثي</strong></div>
            <div><small>النطاق</small><strong>اليمن والمحيط الإقليمي</strong></div>
            <div><small>الحالة</small><strong>نموذج تصميمي</strong></div>
          </div>
          <div className="ab-report-subheadings">
            <h4>الملخص التنفيذي</h4>
            <p>
              يدرس هذا النموذج أثر التحولات في البيئة الإقليمية على مسارات
              الأزمة اليمنية، مع التركيز على تفاعل المصالح الأمنية والسياسية
              وانعكاسها على مؤسسات الدولة وفرص التسوية.
            </p>
            <h5>محاور التقرير</h5>
            <ul>
              <li>تحولات البيئة الاستراتيجية الإقليمية.</li>
              <li>تأثير التنافس على بنية الأزمة اليمنية.</li>
              <li>انعكاسات التحولات على فرص استعادة الدولة.</li>
            </ul>
          </div>
        </section>

        <WeightSpecimen family={secondaryFont} familyLabel={secondaryFontLabel} />
      </div>
    </article>
  );
}

export default function EditorialTypographyABPage() {
  return (
    <main className="ab-review">
      <header className="public-header">
        <div className="public-header-inner ab-review-header">
          <Link href="/" className="public-brand" aria-label="منصة ساس">
            <BrandLogo variant="full" priority />
          </Link>
          <Link href="/brand-preview" className="public-login-link">
            العودة إلى مقارنة الخطوط
          </Link>
        </div>
      </header>

      <section className="ab-review-intro">
        <span className="eyebrow">SAS · EDITORIAL TYPOGRAPHY REVIEW</span>
        <h1>مقارنة النظامين التحريريين A وB</h1>
        <p>
          اختبار متكافئ على العنوان السياسي الطويل، وقالب المقال، وغلاف التقرير
          البحثي. ثُبّتت النصوص والأحجام والمساحات؛ والاختلاف محصور في توزيع
          عائلات الخطوط وأوزانها.
        </p>
        <div className="ab-review-legend">
          <span>العنوان الرئيسي في النظامين: تجاريب طويل · 900</span>
          <span>النصوص في النظامين: ثمانية سانس · 400</span>
          <span>A: تجاريب للعناوين الفرعية</span>
          <span>B: ثمانية Serif Display للعناوين الفرعية</span>
        </div>
      </section>

      <section className="ab-systems-grid" aria-label="مقارنة النظامين A وB">
        {systems.map((system) => (
          <SystemPanel key={system.code} {...system} />
        ))}
      </section>

      <aside className="ab-review-note">
        هذه صفحة اختبار داخلية فقط. لم يتغير النظام الطباعي المستخدم في صفحات المنصة
        أو لوحة الإدارة. جميع النصوص أمثلة تصميمية وليست مواد منشورة.
        <p><Link href="/brand-preview/products-b" className="public-login-link">اختبار النظام B على الخبر والمقال وغلاف الدراسة</Link></p>
      </aside>
    </main>
  );
}

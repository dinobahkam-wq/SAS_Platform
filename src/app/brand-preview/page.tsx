import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export const metadata = {
  title: "مقارنة الأنظمة الطباعية | منصة ساس",
  description: "صفحة داخلية لمقارنة ثلاثة أنظمة طباعية عربية لمنصة ساس.",
  robots: { index: false, follow: false },
};

const options = [
  {
    code: "A",
    title: "تجاريب طويل + ثمانية سانس",
    subtitle: "TAJARIB DISPLAY / THMANYAH SANS",
    className: "typography-option--tajarib",
  },
  {
    code: "B",
    title: "ثمانية سيريف + ثمانية سانس",
    subtitle: "THMANYAH SERIF DISPLAY / SANS",
    className: "typography-option--serif",
  },
  {
    code: "C",
    title: "ثمانية سانس فقط",
    subtitle: "THMANYAH SANS / ALL",
    className: "typography-option--sans",
  },
] as const;

function TypographyOption({
  code,
  title,
  subtitle,
  className,
}: (typeof options)[number]) {
  return (
    <article className={`typography-option ${className}`}>
      <header className="typography-option-head">
        <div>
          <div className="typography-option-code">SYSTEM {code}</div>
          <strong style={{ display: "block", marginTop: 7, fontSize: 13, fontWeight: 600 }}>
            {title}
          </strong>
        </div>
        <small>{subtitle}</small>
      </header>

      <div className="typography-option-body">
        <section className="typography-option-hero">
          <span className="eyebrow">منصة للإعلام والمعرفة السياسية</span>
          <h2>نفهم الأحداث،<br />ونقرأ ما وراءها.</h2>
          <p>
            منصة إعلامية وبحثية تنظّم الأخبار، وتقدم التحليل والرأي، وتنشر
            الدراسات والأبحاث حول اليمن ومحيطه الإقليمي والدولي.
          </p>
        </section>

        <hr className="typography-option-divider" />

        <section>
          <div className="typography-sample-label">SECTION CARD</div>
          <div className="typography-sample-card">
            <span className="typography-sample-card-index">01 / CONTENT</span>
            <h3>الأخبار والشؤون الجارية</h3>
            <p>متابعة منظمة للأحداث والتطورات، مع إسناد واضح للمصادر والتوقيت.</p>
          </div>
        </section>

        <section className="typography-sample-article">
          <div className="typography-sample-label">EDITORIAL ARTICLE</div>
          <div className="typography-sample-meta">تحليل سياسي · اليمن</div>
          <h3>الدولة قبل التسوية: سؤال بناء القدرة الوطنية</h3>
          <p>
            لا تتوقف معالجة الأزمة عند التوصل إلى اتفاق سياسي؛ بل تبدأ من
            استعادة المؤسسات القادرة على إنفاذه، وتوحيد أدوات السلطة العامة
            ضمن إطار وطني قابل للاستمرار.
          </p>
        </section>

        <section className="typography-sample-report">
          <div className="typography-sample-label">RESEARCH REPORT</div>
          <h4>تحولات البيئة الإقليمية وأثرها في اليمن</h4>
          <p>
            ورقة بحثية تستعرض اتجاهات التنافس الإقليمي وانعكاساتها على
            بنية الدولة والأمن والاستقرار.
          </p>
        </section>

        <section className="typography-weight-sample">
          <div className="typography-sample-label">WEIGHT TEST · SAME FONT SIZE</div>
          {[300, 400, 500, 700, 900].map((weight) => (
            <div className="typography-weight-sample-row" key={weight} style={{ fontWeight: weight }}>
              <span>الدولة، المجتمع، المعرفة والتحليل.</span>
              <small>{weight}</small>
            </div>
          ))}
        </section>
      </div>
    </article>
  );
}

export default function BrandPreviewPage() {
  return (
    <main className="typography-review">
      <header className="public-header">
        <div className="public-header-inner typography-review-header">
          <Link href="/" className="public-brand" aria-label="منصة ساس">
            <BrandLogo variant="full" priority />
          </Link>
          <Link href="/" className="public-login-link">العودة إلى الموقع</Link>
        </div>
      </header>

      <section className="typography-review-intro">
        <span className="eyebrow">SAS · BRAND TYPOGRAPHY</span>
        <h1>مقارنة الأنظمة الطباعية</h1>
        <p>
          مقارنة متكافئة بين ثلاثة أنظمة مقترحة لهوية منصة ساس. ثبّتنا النصوص
          والأحجام والمساحات، وأبقينا خط النصوص واحدًا في الأنظمة الثلاثة؛
          الاختلاف هنا في عائلة خط العناوين فقط.
        </p>
        <div className="typography-review-legend">
          <span>النصوص: ثمانية سانس · 400</span>
          <span>العناوين: 500</span>
          <span>الأوزان المتاحة: 300–900</span>
          <span>صفحة اختبار داخلية</span>
        </div>
      </section>

      <section className="typography-review-grid" aria-label="مقارنة الأنظمة الطباعية">
        {options.map((option) => <TypographyOption key={option.code} {...option} />)}
      </section>

      <aside className="typography-review-footnote">
        ملاحظة منهجية: هذه الصفحة لا تعتمد نظامًا طباعيًا نهائيًا. جميع الأنظمة
        تستخدم ملفات الخطوط المحلية الموجودة في المستودع، وتعرض نماذج من واجهات
        المنصة الفعلية: العنوان الرئيسي، بطاقة القسم، المقال، والتقرير البحثي.
        يظل نظام الموقع الأساسي على تجاريب طويل إلى حين اعتماد القرار النهائي.
      </aside>
    </main>
  );
}

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export const metadata = {
  title: "المقارنة الطباعية",
  robots: { index: false, follow: false },
};

const weights = [
  { label: "خفيف", value: "300", style: { fontWeight: 300 as const } },
  { label: "عادي", value: "400", style: { fontWeight: 400 as const } },
  { label: "متوسط", value: "500", style: { fontWeight: 500 as const } },
  { label: "عريض", value: "700", style: { fontWeight: 700 as const } },
  { label: "أسود", value: "900", style: { fontWeight: 900 as const } },
];

function Specimen({ family, className }: { family: string; className: string }) {
  return (
    <section className={`brand-specimen ${className}`}>
      <div className="brand-specimen-label">
        <span>{family}</span>
        <span>ARABIC TYPE SPECIMEN</span>
      </div>
      <h2>نفهم الأحداث،<br />ونقرأ ما وراءها.</h2>
      <h3>منصة ساس للإعلام والدراسات</h3>
      <p>
        تعمل منصة ساس على تنظيم الأخبار وتقديم التحليل والرأي ونشر الدراسات
        والأبحاث حول اليمن ومحيطه الإقليمي والدولي. نربط الخبر بسياقه، والتحليل
        بمصادره، والبحث بأسئلة الواقع.
      </p>
      <div className="brand-weight-list">
        {weights.map((weight) => (
          <div className="brand-weight-row" key={weight.value} style={weight.style}>
            <span>الدولة، المجتمع، المعرفة، والتحليل.</span>
            <small>{weight.label} · {weight.value}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function BrandPreviewPage() {
  return (
    <main className="brand-preview-page">
      <header className="public-header">
        <div className="public-header-inner">
          <Link href="/" className="public-brand" aria-label="العودة إلى منصة ساس">
            <BrandLogo variant="full" priority />
          </Link>
          <Link href="/" className="public-login-link">العودة إلى الموقع</Link>
        </div>
      </header>

      <section className="brand-preview-intro">
        <span className="eyebrow">SAS · BRAND TYPOGRAPHY</span>
        <h1>اختبار الخطوط العربية</h1>
        <p>
          مقارنة مباشرة بين عائلتي ثمانية سيريف ديسبلاي وثمانية سانس باستخدام
          النصوص نفسها، وبالأوزان المتاحة، لتقييم وضوح القراءة وشخصية العناوين
          ومدى ملاءمتها لهوية منصة ساس.
        </p>
      </section>

      <div className="brand-preview-grid">
        <Specimen family="THMANYAH SERIF DISPLAY" className="brand-specimen-serif" />
        <Specimen family="THMANYAH SANS" className="brand-specimen-sans" />
      </div>

      <aside className="brand-preview-note">
        هذه صفحة اختبار داخلية غير مدرجة في قوائم الموقع. تم تفعيل سيريف ديسبلاي
        مؤقتًا للعناوين، مع إبقاء سانس للنصوص والواجهة. قارن النتيجة على شاشة
        الحاسوب والهاتف قبل اعتماد النظام الطباعي النهائي.
      </aside>
    </main>
  );
}

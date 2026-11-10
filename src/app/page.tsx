import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

const sections = [
  { number: "01", title: "الأخبار والشؤون الجارية", description: "متابعة منظمة للأحداث والتطورات، مع إسناد واضح للمصادر والتوقيت." },
  { number: "02", title: "التحليل والرأي", description: "قراءات سياسية واستراتيجية تضع الوقائع في سياقاتها الأوسع." },
  { number: "03", title: "الدراسات والأبحاث", description: "أوراق بحثية ودراسات معمقة تدعم الفهم وصناعة القرار." },
  { number: "04", title: "البرامج والوسائط", description: "حوارات وبرامج ومحتوى مرئي وصوتي يوسّع نطاق المعرفة." },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="public-header">
        <div className="public-header-inner">
          <Link href="/" className="public-brand" aria-label="منصة ساس">
            <BrandLogo variant="full" priority />
          </Link>
          <nav className="public-nav" aria-label="الأقسام">
            <a href="#news">الأخبار</a><a href="#analysis">التحليل والرأي</a><a href="#research">الدراسات والأبحاث</a><a href="#media">البرامج والوسائط</a>
          </nav>
          <Link href="/login" className="public-login-link">دخول الإدارة</Link>
        </div>
      </header>

      <section className="public-hero">
        <div>
          <span className="eyebrow">منصة للإعلام والمعرفة السياسية</span>
          <h1>نفهم الأحداث،<br />ونقرأ ما وراءها.</h1>
          <p>منصة إعلامية وبحثية تُنظّم الأخبار، وتقدم التحليل والرأي، وتنشر الدراسات والأبحاث حول اليمن ومحيطه الإقليمي والدولي.</p>
        </div>
        <div className="public-hero-note">
          <p>نعمل على بناء مساحة معرفية موثوقة، تربط الخبر بسياقه، والتحليل بمصادره، والبحث بأسئلة الواقع.</p>
          <span className="topbar-kicker">SAS MEDIA AND STUDIES PLATFORM</span>
        </div>
      </section>

      <section className="public-sections">
        <div className="panel-header" style={{ padding: "0 0 18px", background: "transparent", border: 0 }}>
          <div><span className="eyebrow">أقسام المنصة</span><h2 style={{ margin: "7px 0 0", fontSize: 24 }}>مساحات المحتوى</h2></div>
          <span className="helper-text">01 — 04</span>
        </div>
        <div className="public-section-grid">
          {sections.map((section) => (
            <a id={["news", "analysis", "research", "media"][Number(section.number) - 1]} href="#top" key={section.number} className="public-section-card">
              <span className="helper-text" dir="ltr">{section.number}</span>
              <h3>{section.title}</h3><p>{section.description}</p>
            </a>
          ))}
        </div>
      </section>

      <footer className="public-footer">
        <div className="public-footer-inner"><span>منصة ساس للإعلام والدراسات</span><span dir="ltr" className="topbar-kicker">© SAS MEDIA AND STUDIES PLATFORM</span></div>
      </footer>
    </main>
  );
}

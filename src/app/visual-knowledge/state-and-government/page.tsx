import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter, PublicHeader } from "@/components/public-site";
import { StateGovernmentCivics } from "@/components/state-government-civics";

export const metadata: Metadata = {
  title: "فكرة الدولة وأنظمة الحكم | المعرفة البصرية",
  description: "دليل تفاعلي مبسط يوضح الفرق بين الدولة والحكومة والنظام السياسي، وأركان الدولة وأشكالها وأنظمة الحكم البرلمانية والرئاسية وشبه الرئاسية.",
  openGraph: {
    type: "article",
    title: "ما الدولة؟ وكيف تعمل أنظمة الحكم؟ | منصة ساس",
    description: "خمس وحدات تثقيفية تفاعلية لمفاهيم الدولة وشكلها ونظام الحكم، مع اختبار قصير ومصادر تخصصية.",
  },
};
export default function StateAndGovernmentPage() {
  return (
    <main className="public-site">
      <PublicHeader />
      <nav className="site-container" aria-label="مسار التنقل" style={{ paddingTop: 24, paddingBottom: 20, fontSize: 12 }}>
        <Link href="/" style={{ color: "var(--muted)" }}>الرئيسية</Link>
        <span aria-hidden="true" style={{ padding: "0 9px", color: "var(--muted)" }}>/</span>
        <Link href="/visual-knowledge" style={{ color: "var(--muted)" }}>المعرفة البصرية</Link>
        <span aria-hidden="true" style={{ padding: "0 9px", color: "var(--muted)" }}>/</span>
        <span aria-current="page">فكرة الدولة وأنظمة الحكم</span>
      </nav>
      <div className="site-container" style={{ paddingBottom: 70 }}>
        <StateGovernmentCivics />
      </div>
      <PublicFooter />
    </main>
  );
}

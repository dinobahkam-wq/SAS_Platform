import Link from "next/link";
import { PublicHeader, PublicFooter } from "@/components/public-site";

/** Contextual 404 for unpublished, archived or invalid editorial links. */
export default function ContentNotFound() {
  return (
    <main className="public-site">
      <PublicHeader />
      <section className="sas-content-unavailable" dir="rtl">
        <span className="sas-content-unavailable-code">404</span>
        <h1>هذه المادة غير متاحة للنشر حاليًا</h1>
        <p>ربما تغيّر رابط المادة، أو أُزيلت من النشر، أو لم يعد عنوانها متاحًا. يمكنك متابعة أحدث المواد من الأقسام الرئيسية.</p>
        <div className="sas-content-unavailable-actions">
          <Link href="/">العودة إلى الرئيسية</Link>
          <Link href="/research">الدراسات والأبحاث</Link>
          <Link href="/news">الأخبار</Link>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}

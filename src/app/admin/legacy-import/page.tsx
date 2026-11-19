import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { LegacyWordPressImporter } from "@/components/legacy-wordpress-importer";

export const metadata: Metadata = {
  title: "ترحيل أرشيف WordPress — غرفة التحرير",
  robots: { index: false, follow: false },
};

export default async function LegacyImportPage() {
  await requireAdmin();
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">غرفة التحرير / الأرشيف</span>
          <h1>ترحيل المواد من ساس القديم</h1>
          <p>استيراد انتقائي غير مدمّر للمقالات والتحليلات والبودكاست، مع مراجعة المؤلف والمصادر والصور قبل النشر.</p>
        </div>
      </div>
      <LegacyWordPressImporter />
    </>
  );
}

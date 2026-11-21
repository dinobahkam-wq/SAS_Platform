import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { allVisualAssets } from "@/lib/visual-identities";
import "@/components/sas-identity.css";
import "./identities.css";

export const dynamic = "force-dynamic";

export default async function IdentitiesPage() {
  await requireAdmin();
  const kinds: Record<string,string> = {
    government:"جهة حكومية", media:"مؤسسة إعلامية",
    international:"منظمة دولية", regional:"جهة إقليمية", country:"علم دولة",
  };
  return <section>
    <header className="page-heading">
      <div><span className="eyebrow">غرفة التحرير / إدارة الأصول</span><h1>مكتبة هويات ساس</h1>
      <p>المكتبة المشتركة المستخدمة في بطاقات الإحاطة اليومية واستوديو الصور. الشعارات مستمدة من الملفات المعتمدة في المستودع.</p></div>
      <Link className="button button-secondary" href="/admin/news-studio">فتح استوديو الصور</Link>
    </header>
    <div className="sas-identities-status" role="note">عدد الهويات: {allVisualAssets.length} · إدارة الملفات حالياً عبر GitHub. لا توجد وظيفة رفع أو حذف مباشرة في هذه النسخة.</div>
    <div className="sas-identities-grid">
      {allVisualAssets.map(identity=><article className="sas-identities-card" key={identity.id}>
        <div className="sas-identities-art"><img src={identity.image} loading="lazy" alt={identity.name}/></div>
        <div><h2>{identity.name}</h2><p>{kinds[identity.kind]}</p><small dir="ltr">{identity.id}</small></div>
      </article>)}
    </div>
    <p className="sas-identities-foot">تمييز ضروري: شعار الجهة صاحبة البيان يختلف عن شعار الناشر الصحفي. في السجلات القديمة تظهر هوية المصدر فقط إن عُرفت.</p>
  </section>;
}

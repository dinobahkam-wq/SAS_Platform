import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { DevelopmentEditorialForm, type EditorialDevelopment, type EditorialPlace } from "./development-editor";
import "./editorial.css";

export const dynamic = "force-dynamic";

export default async function BriefingEditorialPage() {
  const {supabase} = await requireAdmin();
  const {data:places, error:placeError} = await supabase.from("briefing_places")
    .select("slug,name_ar,kind,country_code,coordinate_precision")
    .eq("is_active",true).order("name_ar");
  const {data,error} = await supabase.from("briefing_developments")
    .select("id,headline_ar,category,status,priority_level,yemen_relevance,issuer_identity_id,publisher_identity_id,editorial_impact_note_ar,place_slug")
    .in("status",["draft","ready"])
    .order("updated_at",{ascending:false}).limit(60);
  const items=(data??[]) as EditorialDevelopment[];
  return <section>
    <header className="page-heading">
      <div><span className="eyebrow">غرفة التحرير / الإحاطة اليومية</span><h1>تصنيف التطورات</h1>
        <p>إدارة الأولوية ومسار التأثير والهوية البصرية لكل تطور غير منشور، مع الاحتفاظ بمراجعة المحرر.</p></div>
      <Link href="/admin/briefings" className="button button-secondary">أرشيف الإحاطات</Link>
    </header>
    <div className="sas-editorial-info" role="note">الحقول غير المحددة تبقى فارغة ولا تُفسّر بأنها أولوية اعتيادية. تصنيف التطور لا ينشره؛ وتظل مراجعات الإحاطة المعتمدة محمية.</div>
    {(error||placeError)?<div role="alert" className="empty-state">تعذر تحميل التصنيفات. تحقق من تطبيق ترحيل السجل الجغرافي ومن صلاحيات الإدارة.</div>:items.length?
      <div className="sas-editorial-list">{items.map(item=><DevelopmentEditorialForm item={item} places={(places??[]) as EditorialPlace[]} key={item.id}/>)}</div>:
      <div className="empty-state">لا توجد تطورات جاهزة للتحرير في الوقت الحالي.</div>}
  </section>;
}

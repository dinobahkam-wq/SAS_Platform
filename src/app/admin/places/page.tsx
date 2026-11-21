import Link from "next/link";
import {requireAdmin} from "@/lib/admin";
import {PlaceCreateForm} from "./place-create-form";
import {BriefingLocationMark} from "@/components/briefing-location-mark";
import "@/components/sas-identity.css";
import "./places.css";
export const dynamic="force-dynamic";

export default async function PlacesAdminPage(){
 const {supabase}=await requireAdmin();
 const {data,error}=await supabase.from("briefing_places")
   .select("slug,name_ar,kind,country_code,parent_slug,latitude,longitude,coordinate_precision,source_name,source_url")
   .order("country_code").order("kind").order("name_ar").limit(200);
 const places=data??[];
 return <section>
 <header className="page-heading"><div><span className="eyebrow">غرفة التحرير / إدارة الأصول</span>
 <h1>السجل الجغرافي لساس</h1><p>أماكن بهويات ثابتة وإسناد مصدر ودقة مكانية واضحة؛ لا تقدير تلقائي لموقع الأخبار.</p></div>
 <Link className="button button-secondary" href="/admin/briefings/editorial">تصنيف التطورات</Link></header>
 {error?<p role="alert">تعذر قراءة السجل. تحقق من تطبيق ترحيل الجغرافيا.</p>:
 <><p className="sas-geo-notice">سجل {places.length} موضعاً معتمداً. المواقع التي تفتقر إلى إحداثيات لا تظهر لها علامة مكانية دقيقة.</p>
 <div className="sas-geo-list">{places.map(p=><article key={p.slug} className="sas-geo-place">
   <strong>{p.name_ar}</strong>
   <BriefingLocationMark place={{slug:p.slug,name_ar:p.name_ar,kind:p.kind as "country"|"governorate"|"city"|"site",country_code:p.country_code,latitude:p.latitude,longitude:p.longitude,precision:p.coordinate_precision as "none"|"city_centroid"|"approximate"|"verified_site",source_name:p.source_name,source_url:p.source_url}} compact/>
   <small>{p.kind} · {p.country_code}</small>
   <span>{p.coordinate_precision==="none"?"حدود إدارية دون نقطة مرجعية":p.coordinate_precision==="city_centroid"?"مركز المدينة — تقريبي":p.coordinate_precision}</span>
   <a href={p.source_url} target="_blank" rel="noopener noreferrer">المصدر: {p.source_name}</a>
   <code dir="ltr">{p.slug}</code>
 </article>)}</div>
 <PlaceCreateForm parents={places.filter(p=>p.kind!=="city")} /></>}
 </section>;
}

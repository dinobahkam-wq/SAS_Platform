"use client";
import {useActionState} from "react";
import {createBriefingPlace,type GeoPlaceCreateState} from "./actions";

type Parent={slug:string;name_ar:string;kind:string;country_code:string};
const initial:GeoPlaceCreateState={ok:false,message:""};
export function PlaceCreateForm({parents}:{parents:Parent[]}){
 const [state,action,pending]=useActionState(createBriefingPlace,initial);
 return <form action={action} className="sas-geo-create">
   <h2>إضافة موقع موثق</h2>
   <p>يُضاف الموقع إلى سجل التحرير فقط، ولا يُربط بأي تطور تلقائياً.</p>
   <div className="sas-geo-fields">
     <label>الاسم العربي<input name="name_ar" maxLength={140} required placeholder="مثال: سيئون"/></label>
     <label>المعرّف الثابت<input name="slug" dir="ltr" pattern="[a-z0-9]+(-[a-z0-9]+)*" required placeholder="ye-seiyun"/></label>
     <label>المستوى الجغرافي<select name="kind" defaultValue="city"><option value="country">دولة</option><option value="governorate">محافظة</option><option value="city">مدينة</option><option value="site">موقع محدد</option></select></label>
     <label>رمز الدولة<select name="country_code" defaultValue="YE"><option value="YE">اليمن (YE)</option></select></label>
     <label>المكان الأب<select name="parent_slug" defaultValue=""><option value="">لا يوجد — للدولة فقط</option>{parents.map(p=><option key={p.slug} value={p.slug}>{p.name_ar} · {p.kind}</option>)}</select></label>
     <label>درجة تحديد الموقع<select name="coordinate_precision" defaultValue="none"><option value="none">دون إحداثيات</option><option value="city_centroid">مركز مدينة تقريبي</option><option value="approximate">موقع تقريبي</option><option value="verified_site">موقع محدد موثق</option></select></label>
     <label>خط العرض<input name="latitude" inputMode="decimal" type="number" step="any" min="-90" max="90" dir="ltr" placeholder="14.542"/></label>
     <label>خط الطول<input name="longitude" inputMode="decimal" type="number" step="any" min="-180" max="180" dir="ltr" placeholder="49.124"/></label>
     <label>اسم المصدر<input name="source_name" required placeholder="GeoNames"/></label>
     <label>رابط التوثيق<input name="source_url" required type="url" dir="ltr" placeholder="https://..."/></label>
   </div>
   <button type="submit" className="button button-primary" disabled={pending}>{pending?"جارٍ الإضافة…":"إضافة الموقع"}</button>
   {state.message&&<p role="status" className={state.ok?"sas-geo-success":"sas-geo-error"}>{state.message}</p>}
 </form>
}

"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

export type GeoPlaceCreateState={ok:boolean;message:string};
const slugPattern=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function createBriefingPlace(
  _previous:GeoPlaceCreateState,form:FormData,
):Promise<GeoPlaceCreateState>{
  const {supabase}=await requireAdmin();
  const slug=String(form.get("slug")??"").trim();
  const name_ar=String(form.get("name_ar")??"").trim();
  const kind=String(form.get("kind")??"");
  const country_code=String(form.get("country_code")??"").toUpperCase().trim();
  const parent_slug=String(form.get("parent_slug")??"").trim();
  const latitudeInput=String(form.get("latitude")??"").trim();
  const longitudeInput=String(form.get("longitude")??"").trim();
  const source_name=String(form.get("source_name")??"").trim();
  const source_url=String(form.get("source_url")??"").trim();
  const coordinate_precision=String(form.get("coordinate_precision")??"");
  if(!slugPattern.test(slug)||slug.length>100||name_ar.length<2||name_ar.length>140)
    return {ok:false,message:"تحقق من اسم المكان ومعرّفه اللاتيني."};
  if(!["country","governorate","city","site"].includes(kind)||!/^[A-Z]{2}$/.test(country_code))
    return {ok:false,message:"النوع أو رمز الدولة غير صالح."};
  if(kind==="country"&&parent_slug)
    return {ok:false,message:"الدولة لا يكون لها مكان أب."};
  if(kind!=="country"&&!parent_slug)
    return {ok:false,message:"اختر الدولة أو المحافظة الأم أولاً."};
  const hasCoords=Boolean(latitudeInput||longitudeInput);
  if(Boolean(latitudeInput)!==Boolean(longitudeInput)||
     (hasCoords&&!["city_centroid","approximate","verified_site"].includes(coordinate_precision))||
     (!hasCoords&&coordinate_precision!=="none"))
    return {ok:false,message:"يلزم إدخال الإحداثيين معاً وتحديد مستوى الدقة."};
  const latitude=hasCoords?Number(latitudeInput):null;
  const longitude=hasCoords?Number(longitudeInput):null;
  if(hasCoords&&(!Number.isFinite(latitude)||!Number.isFinite(longitude)||
    Math.abs(latitude!)>90||Math.abs(longitude!)>180))
    return {ok:false,message:"الإحداثيات خارج النطاق المقبول."};
  if(source_name.length<3||source_name.length>120)
    return {ok:false,message:"اذكر اسم المصدر الجغرافي."};
  try {const url=new URL(source_url);if(url.protocol!=="https:")throw new Error("protocol")}
  catch{return {ok:false,message:"يجب إضافة رابط مصدر جغرافي موثوق يبدأ بـ https."}}
  if(parent_slug){
    const {data:parent,error:parentError}=await supabase.from("briefing_places")
      .select("slug,country_code,kind,is_active").eq("slug",parent_slug).maybeSingle();
    if(parentError||!parent||!parent.is_active||parent.country_code!==country_code||
      (kind==="governorate"&&parent.kind!=="country")||
      (kind==="city"&&!["governorate","country"].includes(parent.kind))||
      (kind==="site"&&!["city","governorate"].includes(parent.kind)))
      return {ok:false,message:"الموقع الأب غير صالح أو يتبع دولة أخرى."};
  }
  const {error}=await supabase.from("briefing_places").insert({
    slug,name_ar,kind,country_code,parent_slug:parent_slug||null,
    latitude,longitude,coordinate_precision,source_name,source_url,
  });
  if(error)return {ok:false,message:error.code==="23505"?"هذا المعرف الجغرافي مستخدم.":"تعذر حفظ الموقع، راجع صلاحياتك وبياناته."};
  revalidatePath("/admin/places");
  revalidatePath("/admin/briefings/editorial");
  return {ok:true,message:"أُضيف الموقع إلى السجل الجغرافي المعتمد، ولم تُعدّل أي إحاطة منشورة."};
}

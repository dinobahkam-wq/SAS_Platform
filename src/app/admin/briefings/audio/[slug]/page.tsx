import Link from "next/link";
import {notFound} from "next/navigation";
import {requireAdmin} from "@/lib/admin";
import {BriefingAudioUploadForm} from "../briefing-audio-upload-form";
import {publishBriefingAudio} from "../actions";
import "../audio.css";
export const dynamic="force-dynamic";

const errors:Record<string,string>={
  edition:"لا يوجد إصدار منشور صالح لإرفاق الصوت.",
  file:"ملف غير صالح: يُقبل تسجيل M4A بترميز AAC حتى 10 MB ومدة 15–1800 ثانية.",
  upload:"تعذر رفع التسجيل إلى التخزين. راجع إعدادات الحاوية وصلاحياتك.",
  database:"تعذر حفظ بيانات التسجيل أو الوصول إلى الجدول.",
  record:"لم يُعثر على مسودة تسجيل مرتبطة بالمراجعة المنشورة.",
  publish:"تعذر اعتماد التسجيل؛ تأكد من صلاحيات المدير.",
  locked:"هناك تسجيل منشور بالفعل. لا يمكن استبداله دون إصدار مراجعة تحريرية جديدة.",
};

export default async function BriefingAudioAdminPage({
  params,searchParams,
}:{
  params:Promise<{slug:string}>;
  searchParams:Promise<{error?:string;uploaded?:string;published?:string}>;
}) {
  const {supabase}=await requireAdmin();
  const {slug}=await params;const query=await searchParams;
  if(!/^[a-z0-9-]{3,180}$/.test(slug))notFound();
  const {data:edition,error:editionError}=await supabase.from("briefing_editions")
    .select("id,slug,edition_no,edition_date,current_revision_id")
    .eq("slug",slug).maybeSingle();
  if(editionError||!edition?.current_revision_id)notFound();
  const {data:revision}=await supabase.from("briefing_revisions")
    .select("id,revision_no,title_ar,status")
    .eq("id",edition.current_revision_id).maybeSingle();
  if(!revision||revision.status!=="published")notFound();
  const {data:asset,error:assetError}=await supabase.from("briefing_audio_assets")
    .select("id,status,object_path,file_name,duration_seconds,published_at")
    .eq("edition_id",edition.id).eq("revision_id",revision.id).maybeSingle();
  const previewUrl=asset?supabase.storage.from("sas-briefing-audio").getPublicUrl(asset.object_path).data.publicUrl:null;
  return <section className="sas-admin-briefing-audio">
    <header className="page-heading">
      <div><span className="eyebrow">غرفة التحرير / الإحاطة اليومية / النسخة الصوتية</span>
        <h1>الإحاطة الصوتية — العدد {edition.edition_no}</h1>
        <p>{revision.title_ar} · مراجعة {revision.revision_no}</p></div>
      <Link href="/admin/briefings" className="button button-secondary">العودة إلى الأعداد</Link>
    </header>
    {query.error && errors[query.error]?<p className="notice notice-error" role="alert">{errors[query.error]}</p>:null}
    {query.uploaded?<p className="notice notice-success">تم رفع الصوت كمسودة. استمع إليه ثم اعتمد النشر.</p>:null}
    {query.published?<p className="notice notice-success">نُشرت النسخة الصوتية لهذا العدد.</p>:null}
    {assetError?<p className="notice notice-error" role="alert">تعذر جلب بيانات الصوت؛ تحقق من تطبيق ترحيل قاعدة البيانات.</p>:null}
    <div className="panel sas-admin-audio-panel">
      <h2>التسجيل المرتبط بهذا العدد</h2>
      {asset&&previewUrl?<div>
        <p><strong>الحالة:</strong> {asset.status==="published"?"منشور":"مسودة — غير ظاهر لزوار الموقع"}</p>
        <p><strong>الملف:</strong> {asset.file_name} · <strong>المدة:</strong> {Math.floor(asset.duration_seconds/60)} دقيقة و{asset.duration_seconds%60} ثانية</p>
        <audio controls preload="metadata" src={previewUrl}/>
        {asset.status==="draft"?<form action={publishBriefingAudio} className="sas-admin-audio-publish">
          <input type="hidden" name="slug" value={slug}/>
          <p>قبل النشر: تأكد أن التسجيل يتناول هذا العدد ومراجعته المعتمدة، وأن الأسماء والوقائع والتواريخ صحيحة. سيظهر المشغّل بعد الاعتماد مباشرة.</p>
          <button type="submit" className="button button-primary">اعتماد ونشر التسجيل</button>
        </form>:<p>هذا التسجيل منشور ومتاح في الرئيسية وصفحة العدد.</p>}
      </div>:!assetError?<p>لم تُرفع نسخة صوتية لهذا العدد بعد.</p>:null}
      {!asset || asset.status==="draft" ? <BriefingAudioUploadForm slug={slug}/>:null}
    </div>
  </section>;
}

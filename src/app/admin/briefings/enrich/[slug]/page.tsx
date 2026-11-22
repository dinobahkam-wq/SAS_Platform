import Link from "next/link";
import {notFound} from "next/navigation";
import {requireAdmin} from "@/lib/admin";
import {DevelopmentImageUpload} from "../development-image-upload";
import {startBriefingPhotoRevision,removeBriefingPhoto,publishBriefingPhotoRevision} from "../actions";
import "./enrich.css";
export const dynamic="force-dynamic";

const errorLabels:Record<string,string>={
  record:"تعذر العثور على العدد أو مراجعته.",
  draft:"المراجعة ليست مسودة قابلة للتعديل.",
  file:"الملف غير صالح؛ يتطلب WebP حقيقياً بعد المعالجة.",
  rights:"صيغة الترخيص أو رابط المصدر غير صالحين.",
  upload:"تعذر رفع الصورة إلى المكتبة.",
  metadata:"تعذر تسجيل بيانات الصورة.",
  link:"فشل ربط الصورة بالتطور؛ لم تُنشر أي تغييرات.",
  publish:"تعذر إتمام النشر. افحص حالة المراجعة في غرفة التحرير.",
};

export default async function EnrichBriefingPage({
  params,searchParams,
}:{
  params:Promise<{slug:string}>;
  searchParams:Promise<{error?:string;added?:string;published?:string;removed?:string}>;
}) {
  const {supabase}=await requireAdmin();
  const {slug}=await params;
  const q=await searchParams;
  if(!/^[a-z0-9-]{3,180}$/.test(slug))notFound();
  const {data:edition,error:editionError}=await supabase.from("briefing_editions")
    .select("id,slug,edition_no,current_revision_id").eq("slug",slug).maybeSingle();
  if(editionError||!edition)notFound();
  const {data:revisions,error:revisionError}=await supabase.from("briefing_revisions")
    .select("id,revision_no,status,revision_kind,title_ar,edition_id")
    .eq("edition_id",edition.id).order("revision_no",{ascending:false}).limit(12);
  if(revisionError)throw new Error("تعذر قراءة مراجعات الإحاطة.");
  const draft=revisions?.find(x=>x.status==="draft")??null;
  const current=revisions?.find(x=>x.id===edition.current_revision_id)??null;
  const revision=draft??current;
  if(!revision)notFound();
  const isDraft=revision.status==="draft";
  const {data:items,error:itemsError}=await supabase.from("briefing_edition_items")
    .select("development_id,display_order")
    .eq("revision_id",revision.id).eq("display_section","developments")
    .order("display_order",{ascending:true});
  if(itemsError)throw new Error("تعذر قراءة تطورات المسودة.");
  const ids=(items??[]).map(item=>item.development_id);
  const {data:stories,error:storyError}=ids.length?await supabase.from("briefing_developments")
    .select("id,headline_ar,summary_ar").in("id",ids):
    {data:[],error:null};
  if(storyError)throw new Error("تعذر قراءة نصوص التطورات.");
  const {data:images,error:imageError}=await supabase.from("briefing_revision_images")
    .select("development_id,media_asset_id").eq("revision_id",revision.id);
  if(imageError)throw new Error("تعذر قراءة صور المسودة؛ تحقق من ترحيل قاعدة البيانات.");
  const assetIds=(images??[]).map(x=>x.media_asset_id);
  const {data:assets,error:assetError}=assetIds.length?await supabase.from("media_assets")
    .select("id,bucket_id,object_path,alt_text,caption,credit,rights_basis").in("id",assetIds):
    {data:[],error:null};
  if(assetError)throw new Error("تعذر قراءة بيانات الوسائط.");
  const storyMap=new Map((stories??[]).map(x=>[x.id,x]));
  const imageMap=new Map((images??[]).map(x=>[x.development_id,x.media_asset_id]));
  const assetMap=new Map((assets??[]).map(x=>[x.id,x]));
  const count=images?.length??0;
  return <section className="sas-photo-enrichment">
    <header className="page-heading">
      <div><span className="eyebrow">غرفة التحرير / الإحاطة اليومية / الإثراء البصري</span>
      <h1>{revision.title_ar}</h1>
      <p>العدد {edition.edition_no} · مراجعة رقم {revision.revision_no} · {revision.status==="published"?"منشور":revision.status==="draft"?"مسودة":revision.status}</p></div>
      <Link href={"/admin/briefings/"+slug} className="button button-secondary">العودة إلى العدد</Link>
    </header>
    {q.error&&errorLabels[q.error]?<p className="notice notice-error" role="alert">{errorLabels[q.error]}</p>:null}
    {q.added?<p className="notice notice-success">حُفظت صورة WebP وربطت بمراجعة هذا التطور. لم تُنشر بعد.</p>:null}
    {q.published?<p className="notice notice-success">نُشرت مراجعة الإحاطة الجديدة. بقي الإصدار السابق محفوظاً.</p>:null}
    <div className="sas-photo-overview">
      <div><strong>الإثراء البصري الاختياري</strong><p>ارفع صوراً للتطورات التي تختارها أنت. الملفات غير المصورة تبقى نصية بالكامل.</p></div>
      <span>{count} صورة مرتبطة من {items?.length??0} تطوراً</span>
    </div>
    {!isDraft?<div className="sas-photo-published-gate">
      <p>هذا العدد منشور. للحفاظ على أرشيفه، تُنشأ مسودة تصحيحية جديدة تُنسخ إليها الصور السابقة، ثم تضيف الصور الجديدة وتنشر المراجعة عند اكتمالها.</p>
      {revision.status==="published"?<form action={startBriefingPhotoRevision}>
        <input type="hidden" name="slug" value={slug}/>
        <button type="submit" className="button button-primary">إنشاء مراجعة لإضافة الصور</button>
      </form>:<p role="status">المراجعة الحالية ليست مسودة؛ تحقق من حالتها في الإدارة.</p>}
    </div>:<div className="sas-photo-draft-banner"><strong>مسودة قابلة للتحرير</strong><p>يمكنك إضافة الصور واستبدالها، ثم الضغط على «اعتماد ونشر» بعد مراجعتها.</p></div>}
    <div className="sas-photo-story-list">
    {(items??[]).map(item=>{
      const story=storyMap.get(item.development_id);
      if(!story)return null;
      const assetId=imageMap.get(item.development_id);
      const asset=assetId?assetMap.get(assetId):null;
      const url=asset?supabase.storage.from(asset.bucket_id).getPublicUrl(asset.object_path).data.publicUrl:null;
      return <article id={"development-"+item.development_id} key={item.development_id} className="sas-photo-story">
        <div className="sas-photo-story-head"><span>{String(item.display_order+1).padStart(2,"0")}</span>
        <h2>{story.headline_ar}</h2></div>
        {story.summary_ar?<p className="sas-photo-story-summary">{story.summary_ar}</p>:null}
        {url?<figure className="sas-photo-figure"><img src={url} alt={asset?.alt_text || `صورة مرافقة: ${story.headline_ar}`} loading="lazy"/>
          {asset?.caption || asset?.credit ? <figcaption>{[asset.caption,asset.credit].filter(Boolean).join(" · ")}</figcaption> : null}</figure>:
          <p className="sas-photo-empty">بدون صورة — تصميم نصي افتراضي</p>}
        {isDraft?<div className="sas-photo-story-actions">
          <DevelopmentImageUpload slug={slug} revisionId={revision.id} developmentId={item.development_id}/>
          {asset?<form action={removeBriefingPhoto}>
            <input name="slug" type="hidden" value={slug}/>
            <input name="revision_id" type="hidden" value={revision.id}/>
            <input name="development_id" type="hidden" value={item.development_id}/>
            <button type="submit" className="button button-secondary button-small">إزالة ربط الصورة</button>
          </form>:null}
        </div>:null}
      </article>;
    })}
    </div>
    {isDraft?<form className="sas-photo-publish-bar" action={publishBriefingPhotoRevision}>
      <input name="slug" type="hidden" value={slug}/>
      <input name="revision_id" type="hidden" value={revision.id}/>
      <p>تأكد من أن جميع الصور ترتبط بأخبارها وأن لديك حق نشرها. سيتم اعتماد ونشر مراجعة جديدة مع الاحتفاظ بالإصدار السابق.</p>
      <button className="button button-primary" type="submit">اعتماد الإحاطة ونشر المراجعة</button>
    </form>:null}
  </section>;
}

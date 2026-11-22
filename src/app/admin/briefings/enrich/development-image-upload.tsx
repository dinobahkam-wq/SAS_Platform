"use client";

import {useRef,useState,type FormEvent} from "react";
import {prepareWebpUpload} from "@/lib/prepare-webp-upload";
import {uploadBriefingPhoto} from "./actions";

export function DevelopmentImageUpload({
  slug,revisionId,developmentId,
}: {slug:string;revisionId:string;developmentId:string}) {
  const retry=useRef(false);
  const fileRef=useRef<HTMLInputElement|null>(null);
  const [status,setStatus]=useState("");
  const [open,setOpen]=useState(false);
  async function convert(event:FormEvent<HTMLFormElement>){
    if(retry.current){retry.current=false;return;}
    event.preventDefault();
    const form=event.currentTarget;
    const fileInput=form.elements.namedItem("file");
    const file=fileInput instanceof HTMLInputElement?fileInput.files?.[0]:null;
    if(!file){setStatus("اختر صورة أولاً.");return;}
    try {
      setStatus("جارٍ التحويل الآمن إلى WebP…");
      const result=await prepareWebpUpload(file);
      if(!(fileInput instanceof HTMLInputElement))return;
      const transfer=new DataTransfer();transfer.items.add(result.file);
      fileInput.files=transfer.files;
      const w=form.elements.namedItem("width");
      const h=form.elements.namedItem("height");
      const original=form.elements.namedItem("original_file_name");
      if(w instanceof HTMLInputElement)w.value=String(result.width);
      if(h instanceof HTMLInputElement)h.value=String(result.height);
      if(original instanceof HTMLInputElement)original.value=result.originalName;
      retry.current=true;
      setStatus(`تم تحويل الصورة إلى WebP (${Math.round(result.file.size/1024)} KB)؛ جارٍ الحفظ…`);
      form.requestSubmit();
    }catch(error){setStatus(error instanceof Error?error.message:"تعذر تحويل الملف.");}
  }
  return <div className="sas-photo-widget">
    <button type="button" className="button button-secondary button-small" onClick={()=>{setOpen(true);setStatus("");fileRef.current?.click();}}>إضافة صورة / استبدالها</button>
    <form action={uploadBriefingPhoto} onSubmit={convert} className="sas-photo-form" hidden={!open}>
      <input name="slug" type="hidden" value={slug}/>
      <input name="revision_id" type="hidden" value={revisionId}/>
      <input name="development_id" type="hidden" value={developmentId}/>
      <input name="width" type="hidden"/>
      <input name="height" type="hidden"/>
      <input name="original_file_name" type="hidden"/>
      <label>اختر الصورة من الجهاز<input name="file" ref={fileRef} onChange={()=>setOpen(true)} type="file" accept="image/jpeg,image/png,image/avif,image/webp" required/></label>
      <label>وصف الصورة للقارئ<input name="alt_text" maxLength={300} placeholder="ماذا يظهر في الصورة؟"/></label>
      <label>تعليق اختياري<input name="caption" maxLength={600} placeholder="المشهد وتاريخه عند الحاجة"/></label>
      <label>صاحب الصورة / جهة الحقوق<input name="credit" maxLength={200} placeholder="اسم المصور أو الجهة"/></label>
      <label>الترخيص<select name="rights_basis" defaultValue="">
        <option value="">غير محدد — يمكن استكماله لاحقاً</option>
        <option value="owned">صورة مملوكة لساس</option>
        <option value="permission">إذن استخدام أو ترخيص صريح</option>
        <option value="public_domain">ملك عام موثق</option>
        <option value="cc_by">CC BY مع نسب الحقوق</option>
      </select></label>
      <label>الرابط الأصلي أو توثيق الترخيص<input name="original_source_url" type="url" placeholder="https://..."/></label>
      <p>بيانات الوصف والمصدر والحقوق اختيارية، وتُحفظ الحقول غير المعبأة دون افتراض ترخيص. تأكد من امتلاك حق نشر الصورة قبل اعتماد الإحاطة. تُحوّل إلى WebP محلياً وتُربط بالمسودة.</p>
      <button type="submit" className="button button-primary button-small">حفظ الصورة للتطور</button>
      {status?<p role="status">{status}</p>:null}
    </form>
  </div>;
}

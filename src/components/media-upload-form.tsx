"use client";

import { useRef, useState, type FormEvent } from "react";
import { uploadMedia } from "@/app/admin/media/actions";
import { prepareWebpUpload } from "@/lib/prepare-webp-upload";

export function MediaUploadForm() {
  const bypassValidation = useRef(false);
  const [message, setMessage] = useState("");

  async function validateImage(event: FormEvent<HTMLFormElement>) {
    if (bypassValidation.current) {
      bypassValidation.current = false;
      return;
    }

    event.preventDefault();
    setMessage("");
    const form = event.currentTarget;
    const input = form.elements.namedItem("file");
    const file = input instanceof HTMLInputElement ? input.files?.[0] : undefined;

    if (!file) {
      setMessage("اختر صورة أولًا.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      setMessage("الصيغ المدعومة: JPG وPNG وWebP وAVIF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage("حجم الصورة يتجاوز الحد الأقصى البالغ 10 ميغابايت.");
      return;
    }

    try {
      setMessage("جارٍ تحويل الصورة إلى WebP وتحسين أبعادها…");
      const result=await prepareWebpUpload(file);
      const dt=new DataTransfer();dt.items.add(result.file);
      input.files=dt.files;
      const widthField=form.elements.namedItem("width");
      const heightField=form.elements.namedItem("height");
      const originalField=form.elements.namedItem("original_file_name");
      if(widthField instanceof HTMLInputElement)widthField.value=String(result.width);
      if(heightField instanceof HTMLInputElement)heightField.value=String(result.height);
      if(originalField instanceof HTMLInputElement)originalField.value=result.originalName;
      bypassValidation.current=true;
      setMessage(`تم التحويل إلى WebP: ${Math.round(result.file.size/1024)} KB؛ جارٍ الرفع…`);
      form.requestSubmit();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "فشل تحويل الصورة إلى WebP.");
    }
  }

  return (
    <form action={uploadMedia} onSubmit={validateImage} className="form-stack">
      {message ? <div className="notice notice-error">{message}</div> : null}
      <label className="field"><span>ملف الصورة</span><input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/avif" required /></label>
      <input type="hidden" name="original_file_name" />
      <input type="hidden" name="width" />
      <input type="hidden" name="height" />
      <label className="field"><span>النص البديل (إلزامي)</span><input name="alt_text" required placeholder="وصف مختصر لما يظهر في الصورة" /></label>
      <label className="field"><span>تعليق الصورة</span><input name="caption" /></label>
      <label className="field"><span>المصدر / المصور (إلزامي)</span><input name="credit" required placeholder="صورة خاصة / وكالة الأنباء / اسم المصور" /></label>
      <label className="field"><span>أساس حقوق الاستخدام</span><select name="rights_basis" required defaultValue=""><option value="" disabled>اختر نوع الترخيص</option><option value="owned">مملوكة لساس أو حصلنا عليها مباشرة</option><option value="permission">إذن أو ترخيص بالنشر</option><option value="public_domain">الملك العام موثق المصدر</option><option value="cc_by">ترخيص CC BY مع نسب المؤلف</option></select></label>
      <label className="field"><span>رابط المصدر أو تصريح الاستخدام (مطلوب لغير الصور المملوكة)</span><input name="original_source_url" type="url" placeholder="https://..." /></label>
      <p className="helper-text">تحويل تلقائي إلى WebP بجودة 82% وبحد أقصى 1600 بكسل. لا نرفع الأصل قبل تحويله. الحاوية العامة sas-public-media.</p>
      <button className="button button-primary" type="submit">رفع الصورة إلى المكتبة</button>
    </form>
  );
}

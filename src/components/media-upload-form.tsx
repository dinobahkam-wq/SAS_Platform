"use client";

import { useRef, useState, type FormEvent } from "react";
import { uploadMedia } from "@/app/admin/media/actions";

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
      const image = await createImageBitmap(file);
      const width = image.width;
      const height = image.height;
      image.close();

      if (Math.max(width, height) > 2560) {
        setMessage("يجب ألا يتجاوز أطول ضلع للصورة 2560 بكسل.");
        return;
      }

      const widthField = form.elements.namedItem("width");
      const heightField = form.elements.namedItem("height");
      if (widthField instanceof HTMLInputElement) widthField.value = String(width);
      if (heightField instanceof HTMLInputElement) heightField.value = String(height);

      bypassValidation.current = true;
      form.requestSubmit();
    } catch {
      setMessage("تعذر قراءة أبعاد الصورة. جرّب ملف صورة آخر.");
    }
  }

  return (
    <form action={uploadMedia} onSubmit={validateImage} className="form-stack">
      {message ? <div className="notice notice-error">{message}</div> : null}
      <label className="field"><span>ملف الصورة</span><input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/avif" required /></label>
      <input type="hidden" name="width" />
      <input type="hidden" name="height" />
      <label className="field"><span>النص البديل (لإمكانية الوصول)</span><input name="alt_text" placeholder="وصف مختصر لما يظهر في الصورة" /></label>
      <label className="field"><span>تعليق الصورة</span><input name="caption" /></label>
      <label className="field"><span>حقوق الصورة / المصور</span><input name="credit" /></label>
      <p className="helper-text">الحد الأقصى 10 ميغابايت، وأطول ضلع 2560 بكسل. تُخزن الصور في الحاوية العامة sas-public-media.</p>
      <button className="button button-primary" type="submit">رفع الصورة إلى المكتبة</button>
    </form>
  );
}

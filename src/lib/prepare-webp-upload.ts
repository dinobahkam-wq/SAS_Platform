"use client";

export type WebpResult = {file:File;width:number;height:number;originalName:string};
/**
 * Normalize user-provided still photos to WebP before upload.
 * Original pixels are decoded locally: no image is sent until conversion succeeds.
 * Browser implementations that cannot encode WebP fail closed instead of silently
 * uploading PNG. SVG/GIF are deliberately excluded (SVG scripting/animation).
 */
export async function prepareWebpUpload(source:File):Promise<WebpResult>{
  if(!["image/jpeg","image/png","image/webp","image/avif"].includes(source.type))
    throw new Error("نوع الصورة غير مدعوم. اختر JPG أو PNG أو WebP أو AVIF.");
  if(source.size===0 || source.size>10*1024*1024)
    throw new Error("حجم الملف الأصلي يجب ألا يتجاوز 10 ميجابايت.");
  const bitmap=await createImageBitmap(source);
  try{
    const width=Math.max(1,Math.round(bitmap.width*Math.min(1,1600/Math.max(bitmap.width,bitmap.height))));
    const height=Math.max(1,Math.round(bitmap.height*Math.min(1,1600/Math.max(bitmap.width,bitmap.height))));
    const canvas=document.createElement("canvas");
    canvas.width=width;canvas.height=height;
    const context=canvas.getContext("2d",{alpha:false});
    if(!context) throw new Error("تعذر إنشاء محرك الصور على هذا المتصفح.");
    context.fillStyle="#ffffff";context.fillRect(0,0,width,height);
    context.drawImage(bitmap,0,0,width,height);
    const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/webp",.82));
    if(!blob||blob.type!=="image/webp")
      throw new Error("لا يدعم هذا المتصفح تصدير WebP؛ جرّب Chrome أو Edge الحديث.");
    const converted=new File([blob],source.name.replace(/\.[^.]+$/,"")+".webp",{type:"image/webp"});
    return {file:converted,width,height,originalName:source.name};
  }finally{bitmap.close();}
}

"use client";

import { useEffect, useState } from "react";
import { uploadBriefingAudio } from "./actions";

export function BriefingAudioUploadForm({slug}: {slug:string}) {
  const [preview,setPreview]=useState("");
  const [duration,setDuration]=useState(0);
  const [error,setError]=useState("");
  const [fileName,setFileName]=useState("");
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  return <form className="sas-admin-audio-upload" action={uploadBriefingAudio}>
    <input name="slug" type="hidden" value={slug}/>
    <input name="duration_seconds" type="hidden" value={duration ? String(Math.round(duration)) : ""}/>
    <label htmlFor="sas-admin-briefing-audio-file">ملف الإحاطة الصوتية (M4A / AAC)</label>
    <input id="sas-admin-briefing-audio-file" name="file" type="file"
      accept=".m4a,audio/mp4,audio/x-m4a" required onChange={event => {
        const file=event.target.files?.[0];
        setDuration(0);setError("");setFileName(file?.name ?? "");
        setPreview(file?URL.createObjectURL(file):"");
        if(file && (!file.name.toLowerCase().endsWith(".m4a")||file.size>10*1024*1024))
          setError("يُقبل ملف M4A لا يتجاوز 10 MB فقط.");
      }}/>
    {preview ? <>
      <audio controls preload="metadata" src={preview}
        onLoadedMetadata={event => {
          const secs=event.currentTarget.duration;
          if(Number.isFinite(secs)&&secs>=15&&secs<=1800) setDuration(secs);
          else setError("تعذر تحديد مدة تسجيل صالحة (15–1800 ثانية).");
        }}
        onError={()=>setError("تعذر فتح الملف الصوتي؛ تحقق من أنه تسجيل M4A صالح.")}/>
      {duration>0?<p>المدة المكتشفة: {Math.floor(duration/60)} دقيقة و{Math.round(duration%60)} ثانية · {fileName}</p>:null}
    </>:null}
    {error?<p role="alert">{error}</p>:null}
    <p>رفع التسجيل يحفظه مسودة فقط. استمع إليه ثم اعتمده من صفحة العدد. لا يتغير نص الإحاطة المنشور.</p>
    <button className="button button-primary" type="submit" disabled={!!error||!duration}>رفع وحفظ كمسودة</button>
  </form>;
}

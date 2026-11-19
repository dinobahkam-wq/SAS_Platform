"use client";

import { useState } from "react";
import { parseWordPressExport, type LegacyPreview, type LegacyEditorialType } from "@/lib/legacy-wordpress-export";
import { importLegacyDrafts, type LegacyImportOutcome } from "@/app/admin/legacy-import/actions";

const TYPES: { value: LegacyEditorialType; label: string }[] = [
  {value:"analysis",label:"تحليل سياسي"},
  {value:"opinion",label:"مقال رأي"},
  {value:"podcast",label:"بودكاست"},
  {value:"skip",label:"تأجيل"},
];

export function LegacyWordPressImporter() {
  const [items,setItems]=useState<LegacyPreview[]>([]);
  const [fileName,setFileName]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [outcomes,setOutcomes]=useState<LegacyImportOutcome[]>([]);
  const [filter,setFilter]=useState<"high"|"all">("high");
  const selected=items.filter(item=>item.selected&&item.suggestedType!=="skip");
  const visible=items.filter(item=>filter==="all"||item.suggestedType!=="skip");

  async function loadFile(file?:File) {
    if(!file)return;
    setItems([]);setOutcomes([]);setError("");setFileName(file.name);
    if(!/\.(?:xml|wxr)$/i.test(file.name)||file.size>20*1024*1024||!file.size){
      setError("اختر ملف تصدير WordPress بصيغة XML وحجم لا يتجاوز 20MB.");return;
    }
    try { setItems(parseWordPressExport(await file.text())); }
    catch(err){setError(err instanceof Error?err.message:"تعذر تحليل ملف التصدير.");}
  }
  function patch(id:number,changes:Partial<LegacyPreview>) {
    setItems(current=>current.map(item=>item.legacyId===id?{...item,...changes}:item));
  }
  async function importBatch() {
    if(busy||selected.length===0)return;
    const batch=selected.slice(0,10);
    setBusy(true);setError("");
    try {
      const outcome=await importLegacyDrafts(batch.map(item=>({
        legacyId:item.legacyId,originalUrl:item.originalUrl,originalDate:item.originalDate,
        title:item.title,slug:item.slug,excerpt:item.excerpt,uploader:item.uploader,
        taxonomy:item.taxonomy,editorialType:item.editorialType,blocks:item.blocks,mediaLinks:item.mediaLinks,
      })));
      setOutcomes(prev=>[outcome,...prev]);
      // A record is never marked transferred merely because the request was sent.
      const doneTitles=new Set([...outcome.imported,...outcome.skipped].map(item=>item.title));
      setItems(prev=>prev.map(item=>doneTitles.has(item.title)?{...item,selected:false}:item));
      if(outcome.failed.length) setError("بعض المواد لم تُستورد، راجع تفاصيل الأخطاء أدناه.");
    }catch(err){setError(err instanceof Error?err.message:"تعذر حفظ الدفعة.");}
    finally{setBusy(false);}
  }
  const totalImported=outcomes.reduce((n,o)=>n+o.imported.length,0);

  return <div className="panel" style={{padding:20,display:"grid",gap:18}}>
    <div>
      <h2 style={{margin:"0 0 8px"}}>ترحيل أرشيف WordPress</h2>
      <p className="helper-text">ارفع ملف التصدير الأصلي. تتم معاينة المواد في المتصفح أولًا، ثم تُنقل التحليلات ومقالات الرأي والبودكاست إلى <strong>مسودات غير منشورة</strong> في نظام ساس. لا يتغير الموقع القديم.</p>
    </div>
    <label className="field">
      <span>ملف تصدير WordPress (XML / WXR)</span>
      <input type="file" accept=".xml,.wxr,text/xml,application/xml" disabled={busy}
        onChange={event=>{void loadFile(event.currentTarget.files?.[0]);event.currentTarget.value="";}}/>
      <small className="helper-text">الحجم الأقصى 20MB. إن كان الملف كبيرًا، صدّر التصنيفات على دفعات من الموقع القديم.</small>
    </label>

    {error&&<div className="notice notice-error" role="alert">{error}</div>}
    {fileName&&<div className="helper-text">الملف: <b>{fileName}</b> — مواد WordPress المؤهلة للفحص: <b>{items.length}</b> — المحددة: <b>{selected.length}</b> — المنقولة في هذه الجلسة: <b>{totalImported}</b></div>}
    {items.length>0&&<>
      <div className="toolbar">
        <button type="button" className={filter==="high"?"active":""} onClick={()=>setFilter("high")}>مواد الأولوية</button>
        <button type="button" className={filter==="all"?"active":""} onClick={()=>setFilter("all")}>جميع مواد التصدير</button>
      </div>
      <p className="helper-text">ترتيب الأولوية: التحليلات، ثم مقالات الرأي، ثم البودكاست. المواد غير المصنفة مؤجلة مبدئيًا. اختر النوع الصحيح يدويًا قبل النقل. اسم حساب الناشر في WordPress <strong>ليس إثباتًا لاسم الكاتب</strong>.</p>
      <div className="table-wrap" style={{maxHeight:450,overflow:"auto"}}>
        <table className="data-table">
          <thead><tr><th>نقل</th><th>المادة الأصلية</th><th>التصنيف</th><th>ملاحظات</th></tr></thead>
          <tbody>{visible.slice(0,200).map(item=><tr key={item.legacyId}>
            <td><input type="checkbox" aria-label={"اختيار "+item.title} checked={item.selected&&item.suggestedType!=="skip"} onChange={e=>patch(item.legacyId,{selected:e.target.checked})} disabled={busy||item.suggestedType==="skip"}/></td>
            <td><a href={item.originalUrl} target="_blank" rel="noopener noreferrer">{item.title}</a><div className="table-subtitle">{item.originalDate.slice(0,10)} · WordPress {item.legacyId}</div></td>
            <td><select aria-label={"نوع المادة: "+item.title} value={item.suggestedType} disabled={busy} onChange={e=>{
              const next=e.target.value as LegacyEditorialType;
              patch(item.legacyId,{suggestedType:next,editorialType:next==="skip"?"opinion":next,selected:next!=="skip"});
            }}>{TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}</select></td>
            <td><span className="helper-text">{item.blocks.length} فقرات</span>{item.mediaLinks.length>0?<div className="table-subtitle">{item.mediaLinks.length} مرفقات تحتاج مراجعة</div>:null}</td>
          </tr>)}</tbody>
        </table>
      </div>
      {visible.length>200&&<p className="helper-text">تعرض المعاينة أول 200 مادة في هذا المرشح. لتجنب الإغفال قسّم التصدير إلى ملفات أصغر.</p>}
      <div className="form-actions">
        <button className="button button-primary" type="button" disabled={busy||selected.length===0} onClick={()=>void importBatch()}>
          {busy?"جارٍ نقل المسودات...":`نقل الدفعة التالية (${Math.min(10,selected.length)} مواد) كمسودات`}
        </button>
        <span className="helper-text">لا ينشر هذا الإجراء أي مادة ولا يحذف موادًا موجودة.</span>
      </div>
    </>}

    {outcomes.map((outcome,index)=><div key={index} className="panel" style={{padding:15}}>
      <h3>نتيجة الدفعة {outcomes.length-index}</h3>
      <p className="helper-text">منقول: {outcome.imported.length} · موجود سابقًا: {outcome.skipped.length} · تعذر: {outcome.failed.length}</p>
      {outcome.imported.map(item=><div key={item.id}><a href={"/admin/content/"+item.id}>{item.title} — مراجعة المسودة</a></div>)}
      {outcome.skipped.map(item=><p key={item.title} className="helper-text">{item.title}: {item.reason}</p>)}
      {outcome.failed.map(item=><p key={item.title} className="notice notice-error">{item.title}: {item.reason}</p>)}
    </div>)}
  </div>;
}

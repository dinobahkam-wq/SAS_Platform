"use client";

import { useActionState } from "react";
import { allVisualAssets } from "@/lib/visual-identities";
import { saveBriefingEditorialMetadata, type EditorialSaveState } from "./actions";

export type EditorialDevelopment = {
  id: string; headline_ar: string; category: string; status: string;
  priority_level: string | null; yemen_relevance: string | null;
  issuer_identity_id: string | null; publisher_identity_id: string | null;
  editorial_impact_note_ar: string | null;
};

const priorityOptions = [
  {value:"",label:"غير مصنّف"},
  {value:"critical",label:"أولوية قصوى"},
  {value:"high",label:"أولوية عالية"},
  {value:"standard",label:"أولوية اعتيادية"},
];
const relevanceOptions = [
  {value:"",label:"غير محدد"},
  {value:"direct",label:"تأثير مباشر في اليمن"},
  {value:"regional",label:"تأثير إقليمي على اليمن"},
  {value:"strategic",label:"تأثير استراتيجي غير مباشر"},
];
const initialState:EditorialSaveState = {ok:false,message:""};
export function DevelopmentEditorialForm({ item }:{item:EditorialDevelopment}) {
  const [state, action, pending] = useActionState(saveBriefingEditorialMetadata,initialState);
  return <form action={action} className="sas-editorial-form">
    <input type="hidden" name="id" value={item.id} />
    <div className="sas-editorial-form-heading"><h2>{item.headline_ar}</h2><small>{item.status} · {item.category}</small></div>
    <div className="sas-editorial-grid">
      <label>الأولوية
        <select name="priority" defaultValue={item.priority_level??""} required={false}>
          {priorityOptions.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      <label>الصلة باليمن
        <select name="relevance" defaultValue={item.yemen_relevance??""}>
          {relevanceOptions.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      <label>الجهة صاحبة الحدث أو البيان
        <select name="issuer" defaultValue={item.issuer_identity_id??""}>
          <option value="">غير محددة</option>
          {allVisualAssets.map(asset=><option value={asset.id} key={asset.id}>{asset.name}</option>)}
        </select>
      </label>
      <label>الجهة الناشرة أو مصدر التوثيق
        <select name="publisher" defaultValue={item.publisher_identity_id??""}>
          <option value="">غير محددة</option>
          {allVisualAssets.map(asset=><option value={asset.id} key={asset.id}>{asset.name}</option>)}
        </select>
      </label>
    </div>
    <label>مبرر الأهمية ومسار التأثير في اليمن
      <textarea name="note" defaultValue={item.editorial_impact_note_ar??""} maxLength={1800} rows={3} placeholder="ما الأثر، ولماذا يرتبط باليمن؟ وما حدود الأدلة؟" />
    </label>
    <div className="sas-editorial-actions">
      <button type="submit" className="button button-primary button-small" disabled={pending}>{pending?"جارٍ الحفظ…":"حفظ التصنيف"}</button>
      {state.message?<span role="status" className={state.ok?"sas-editorial-success":"sas-editorial-error"}>{state.message}</span>:null}
    </div>
  </form>;
}

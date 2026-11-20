"use client";

import { useActionState } from "react";
import { inviteTeamMember, setTeamMemberActive, type TeamActionResult } from "@/app/admin/team/actions";

const idle:TeamActionResult={ok:false,message:""};

export function InviteTeamForm() {
  const [result,action,busy]=useActionState(inviteTeamMember,idle);
  return <form action={action} className="sas-team-invite-form">
    <label htmlFor="team-email">البريد الإلكتروني للعضو الجديد</label>
    <div className="sas-team-invite-row">
      <input id="team-email" type="email" name="email" required maxLength={254} autoComplete="off" placeholder="name@example.com" dir="ltr"/>
      <button type="submit" className="button button-primary" disabled={busy}>{busy?"جارٍ الإرسال...":"إرسال دعوة الإدارة"}</button>
    </div>
    {result.message?<p role="status" className={result.ok?"sas-team-success":"sas-team-error"}>{result.message}</p>:null}
    <p className="helper-text">تُرسل الدعوة إلى البريد المسجل. يملك العضو صلاحيات التحرير وNews Studio، ولا يستطيع دعوة أعضاء جدد أو تعطيل المدير العام.</p>
  </form>;
}

export function MemberStatusForm({id,active}:{id:string;active:boolean}) {
  const [result,action,busy]=useActionState(setTeamMemberActive,idle);
  return <form action={action} className="sas-team-status-form">
    <input type="hidden" name="member_id" value={id}/>
    <input type="hidden" name="action" value={active?"deactivate":"activate"}/>
    <button type="submit" className="button button-quiet button-small" disabled={busy}>
      {busy?"جارٍ التحديث...":active?"تعطيل الصلاحية":"إعادة التفعيل"}
    </button>
    {result.message?<span role="status" className={result.ok?"sas-team-success":"sas-team-error"}>{result.message}</span>:null}
  </form>;
}

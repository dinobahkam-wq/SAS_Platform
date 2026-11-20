import { requirePlatformOwner } from "@/lib/platform-owner";
import { createTeamAdminClient } from "@/lib/supabase/team-admin";
import { InviteTeamForm, MemberStatusForm } from "@/components/admin-team-forms";
import "./team.css";

export const dynamic="force-dynamic";

export default async function TeamPage() {
  const {supabase,userId}=await requirePlatformOwner();
  const {data:roles,error}=await supabase.from("user_roles")
    .select("user_id,role,is_active,created_at")
    .eq("role","admin").order("created_at",{ascending:true}).limit(150);
  let members:Array<{id:string;email:string;active:boolean;owner:boolean;lastSignIn:string|null}>=[];
  let authError="";
  if(!error) {
    try {
      const client=createTeamAdminClient();
      members=await Promise.all((roles??[]).map(async row=>{
        const {data,error:accountError}=await client.auth.admin.getUserById(row.user_id);
        if(accountError)throw accountError;
        return {
          id:row.user_id,
          email:data.user?.email??"البريد غير متاح",
          active:row.is_active,
          owner:row.user_id===userId,
          lastSignIn:data.user?.last_sign_in_at??null,
        };
      }));
    } catch {
      authError="تعذر تحميل حسابات الأعضاء. تحقق من ضبط المفتاح السري لخادم Supabase.";
    }
  }
  return <>
    <header className="page-heading">
      <div>
        <span className="eyebrow">غرفة التحرير / المدير العام</span>
        <h1>الأعضاء والصلاحيات</h1>
        <p>دعوة أعضاء الإدارة إلى منصة ساس، ومراجعة حساباتهم، وتفعيل أو تعطيل الوصول.</p>
      </div>
    </header>
    <div className="sas-team-owner-note">
      <strong>المدير العام</strong> يحتفظ وحده بصلاحية دعوة الأعضاء وتعطيلهم. يحصل العضو الإداري على الأدوات التحريرية نفسها، بما فيها الإحاطة اليومية وNews Studio، دون حق إدارة العضويات.
    </div>
    <section className="panel sas-team-panel">
      <div className="panel-header"><h2>إضافة عضو إداري</h2></div>
      <div className="panel-body"><InviteTeamForm/></div>
    </section>
    <section className="panel sas-team-panel">
      <div className="panel-header"><h2>الأعضاء الحاليون</h2><span className="pill">{members.length} حسابات إدارية</span></div>
      {error||authError?<div className="notice notice-error" role="alert">{authError||"تعذر قراءة سجل صلاحيات المستخدمين."}</div>:
       <div className="table-wrap"><table className="data-table sas-team-table">
        <thead><tr><th>الحساب</th><th>الصفة</th><th>الحالة</th><th>آخر دخول</th><th>الإجراء</th></tr></thead>
        <tbody>{members.map(member=><tr key={member.id}>
          <td dir="ltr">{member.email}</td>
          <td>{member.owner?<strong>المدير العام</strong>:"عضو إداري"}</td>
          <td><span className={"pill "+(member.active?"pill-green":"pill-red")}>{member.active?"نشط":"معطل"}</span></td>
          <td dir="ltr">{member.lastSignIn?new Date(member.lastSignIn).toLocaleDateString("en-GB"):"لم يسجل الدخول"}</td>
          <td>{member.owner?<span className="helper-text">حساب محمي</span>:<MemberStatusForm id={member.id} active={member.active}/>}</td>
        </tr>)}</tbody>
       </table></div>}
    </section>
  </>;
}

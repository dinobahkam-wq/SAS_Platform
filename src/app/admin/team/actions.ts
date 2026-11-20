"use server";

import { revalidatePath } from "next/cache";
import { requirePlatformOwner } from "@/lib/platform-owner";
import { createTeamAdminClient } from "@/lib/supabase/team-admin";

export type TeamActionResult = { ok: boolean; message: string };

function validEmail(value: unknown) {
  const email = String(value ?? "").trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export async function inviteTeamMember(_previous: TeamActionResult, formData: FormData): Promise<TeamActionResult> {
  const {userId} = await requirePlatformOwner();
  const email=validEmail(formData.get("email"));
  if (!email) return {ok:false,message:"أدخل بريدًا إلكترونيًا صالحًا."};

  const client=createTeamAdminClient();
  const {data:existing,error:readError}=await client.from("user_roles").select("user_id").eq("role","admin");
  if (readError) return {ok:false,message:"تعذر التحقق من سجل الأعضاء."};
  // Check by account email to avoid re-sending or silently promoting an unrelated registered user.
  for (const role of existing??[]) {
    const {data:account}=await client.auth.admin.getUserById(role.user_id);
    if (account.user?.email?.toLowerCase()===email) return {ok:false,message:"الحساب موجود بالفعل في قائمة الأعضاء."};
  }

  const siteUrl=process.env.SAS_SITE_URL?.trim();
  let redirectTo:string|undefined;
  if(siteUrl) {
    try{
      const site=new URL(siteUrl);
      if(!["https:","http:"].includes(site.protocol))throw Error("Invalid scheme");
      redirectTo=new URL("/auth/accept-invite",site).href;
    }catch{return {ok:false,message:"عنوان SAS_SITE_URL غير صالح."};}
  }

  const {data,error}=await client.auth.admin.inviteUserByEmail(email,redirectTo?{redirectTo}:undefined);
  if(error||!data.user)return {ok:false,message:"تعذر إرسال الدعوة. تحقق من إعدادات بريد Supabase أو وجود الحساب مسبقًا."};

  const {error:roleError}=await client.from("user_roles").upsert({
    user_id:data.user.id,role:"admin",is_active:true,assigned_by:userId,
  },{onConflict:"user_id"});

  if(roleError) {
    // Never leave a newly invited user with an unmanaged role on partial failure.
    // An invitation alone conveys no admin permission; report the recovery need.
    return {ok:false,message:"أُرسلت الدعوة، لكن تعذر منح صلاحية الإدارة. لا يستطيع الحساب دخول الإدارة إلى أن تُعالج الصلاحية."};
  }
  revalidatePath("/admin/team");
  return {ok:true,message:"أُرسلت الدعوة. سيحصل العضو على صلاحيات إدارة المحتوى والاستوديو بعد تفعيل حسابه."};
}

export async function setTeamMemberActive(_previous:TeamActionResult, formData:FormData):Promise<TeamActionResult> {
  const {userId}=await requirePlatformOwner();
  const memberId=String(formData.get("member_id")??"");
  const action=String(formData.get("action")??"");
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(memberId) ||
     !["activate","deactivate"].includes(action))return {ok:false,message:"بيانات العضو أو الإجراء غير صالحة."};
  if(memberId===userId)return {ok:false,message:"لا يمكن تغيير حالة حساب المدير العام من هذه الواجهة."};
  const client=createTeamAdminClient();
  const {data:role,error:readError}=await client.from("user_roles").select("role").eq("user_id",memberId).maybeSingle();
  if(readError||!role||role.role!=="admin")return {ok:false,message:"العضو غير موجود أو لا يحمل صلاحية إدارية."};
  const {error}=await client.from("user_roles").update({
    is_active:action==="activate",assigned_by:userId,
  }).eq("user_id",memberId).eq("role","admin");
  if(error)return {ok:false,message:"تعذر تحديث حالة العضو."};
  revalidatePath("/admin/team");
  return {ok:true,message:action==="activate"?"أُعيد تفعيل صلاحية العضو.":"عُطلت صلاحية العضو. الدخولات التالية محجوبة؛ يلزم إبطال الجلسات النشطة من إعدادات المصادقة إذا تطلب الأمر إلغاءً فوريًا."};
}

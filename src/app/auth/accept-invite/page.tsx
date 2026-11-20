"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BrandLogo } from "@/components/brand-logo";

export default function AcceptInvitePage() {
  const router=useRouter();
  const [ready,setReady]=useState(false);
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);

  useEffect(()=>{
    const supabase=createClient();
    let cancelled=false;
    async function initialize() {
      try{
        const qs=new URLSearchParams(window.location.search);
        const code=qs.get("code");
        const hash=qs.get("token_hash");
        const type=qs.get("type");
        if(code) {
          const {error}=await supabase.auth.exchangeCodeForSession(code);
          if(error)throw error;
          window.history.replaceState({}, "", "/auth/accept-invite");
        } else if(hash&&type==="invite") {
          const {error}=await supabase.auth.verifyOtp({token_hash:hash,type:"invite"});
          if(error)throw error;
          window.history.replaceState({}, "", "/auth/accept-invite");
        }
        const {data:{session},error}=await supabase.auth.getSession();
        if(error||!session)throw Error("انتهت صلاحية الدعوة أو لم يُنشأ اتصال آمن. اطلب دعوة جديدة من المدير العام.");
        if(!cancelled)setReady(true);
      }catch(e) {
        if(!cancelled)setMessage(e instanceof Error?e.message:"تعذر تفعيل الدعوة.");
      }
    }
    void initialize();
    return()=>{cancelled=true;};
  },[]);

  async function finish(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(busy)return;
    if(password.length<12){setMessage("استخدم كلمة مرور من 12 رمزًا على الأقل.");return;}
    if(password!==confirm){setMessage("كلمتا المرور غير متطابقتين.");return;}
    setBusy(true);setMessage("");
    const supabase=createClient();
    const {error}=await supabase.auth.updateUser({password});
    if(error){setMessage("تعذر حفظ كلمة المرور. تحقق من استيفاء متطلبات الأمان.");setBusy(false);return;}
    router.replace("/admin");
    router.refresh();
  }
  return <main className="login-screen">
    <div className="login-card">
      <div className="login-brand"><BrandLogo variant="full" priority/></div>
      <div className="login-heading">
        <span className="eyebrow">فريق ساس / دعوة الإدارة</span>
        <h1>تفعيل حساب العضو</h1>
        <p>اختر كلمة مرور قوية لتفعيل الوصول إلى غرفة التحرير.</p>
      </div>
      {message?<div className="notice notice-error" role="alert">{message}</div>:null}
      {ready?<form className="form-stack" onSubmit={event=>void finish(event)}>
        <label className="field"><span>كلمة المرور الجديدة</span>
          <input type="password" autoComplete="new-password" minLength={12} required value={password} onChange={event=>setPassword(event.target.value)}/></label>
        <label className="field"><span>تأكيد كلمة المرور</span>
          <input type="password" autoComplete="new-password" minLength={12} required value={confirm} onChange={event=>setConfirm(event.target.value)}/></label>
        <button className="button button-primary button-full" type="submit" disabled={busy}>{busy?"جارٍ الحفظ...":"تفعيل الحساب والدخول"}</button>
      </form>:<p className="helper-text">يتم التحقق من رابط الدعوة...</p>}
    </div>
  </main>;
}

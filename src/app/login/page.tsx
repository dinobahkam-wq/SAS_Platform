import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn } from "./actions";
import { createClient } from "@/lib/supabase/server";

const errorMessages: Record<string, string> = {
  missing: "أدخل البريد الإلكتروني وكلمة المرور.",
  credentials: "تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور.",
  unauthorized: "هذا الحساب لا يملك صلاحية إدارة منصة ساس.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims?.sub) {
    const { data: role } = await supabase
      .from("user_roles")
      .select("role, is_active")
      .eq("user_id", String(data.claims.sub))
      .maybeSingle();

    if (role?.role === "admin" && role.is_active) redirect("/admin");
  }

  return (
    <main className="login-screen">
      <div className="login-card">
        <Link href="/" className="login-brand" aria-label="العودة إلى منصة ساس">
          <span className="brand-symbol">S</span>
          <span>
            <strong>منصة ساس</strong>
            <small>للإعلام والدراسات</small>
          </span>
        </Link>

        <div className="login-heading">
          <span className="eyebrow">مساحة العمل الداخلية</span>
          <h1>تسجيل الدخول</h1>
          <p>الدخول مخصص للمستخدمين المخولين بإدارة المنصة.</p>
        </div>

        {params.error && errorMessages[params.error] ? (
          <div className="notice notice-error" role="alert">
            {errorMessages[params.error]}
          </div>
        ) : null}

        <form action={signIn} className="form-stack">
          <label className="field">
            <span>البريد الإلكتروني</span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              placeholder="name@example.com"
              dir="ltr"
              required
            />
          </label>
          <label className="field">
            <span>كلمة المرور</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="أدخل كلمة المرور"
              required
            />
          </label>
          <button className="button button-primary button-full" type="submit">
            دخول لوحة الإدارة
            <span aria-hidden="true">←</span>
          </button>
        </form>

        <div className="login-footer">
          <span>وصول محمي عبر Supabase Auth</span>
          <Link href="/">العودة للموقع</Link>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { signOut } from "@/app/login/actions";
import { BrandLogo } from "@/components/brand-logo";

export function BriefingShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { email: string; displayName: string; role: "admin" | "editor" };
}) {
  return (
    <div className="briefing-frame">
      <aside className="briefing-sidebar">
        <Link href="/briefing-room" className="briefing-brand">
          <BrandLogo variant="compact" priority />
          <span><strong>الإحاطة اليومية</strong><small>SAS DAILY BRIEFING</small></span>
        </Link>
        <div className="briefing-nav-label">مساحة التحرير</div>
        <nav className="briefing-nav" aria-label="تنقل غرفة الإحاطة">
          <Link href="/briefing-room"><span>▤</span> الأعداد</Link>
          <Link href="/briefing-room/new"><span>＋</span> إنشاء عدد</Link>
          <Link href="/briefing-room/review"><span>◷</span> المراجعة والاعتماد</Link>
        </nav>
        <div className="briefing-sidebar-bottom">
          <span className="briefing-role">{user.role === "admin" ? "مدير النظام" : "محرر"}</span>
          <Link href="/" className="briefing-public-link">العودة إلى الموقع العام ↗</Link>
          {user.role === "admin" ? <Link href="/admin" className="briefing-public-link">لوحة إدارة ساس ↗</Link> : null}
        </div>
      </aside>
      <div className="briefing-main">
        <header className="briefing-topbar">
          <div><span className="briefing-kicker">SAS MEDIA & STUDIES</span><strong>غرفة تحرير الإحاطة اليومية</strong></div>
          <div className="briefing-user">
            <span className="briefing-avatar">{user.displayName.slice(0, 1)}</span>
            <span><strong>{user.displayName}</strong><small dir="ltr">{user.email}</small></span>
            <form action={signOut}><button className="button button-quiet button-small" type="submit">خروج</button></form>
          </div>
        </header>
        <main className="briefing-content">{children}</main>
        <footer className="briefing-footer"><span>منصة ساس للإعلام والدراسات</span><span>DAILY BRIEFING · PRIVATE WORKSPACE</span></footer>
      </div>
    </div>
  );
}

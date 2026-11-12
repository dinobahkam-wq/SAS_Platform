import Link from "next/link";
import { signOut } from "@/app/login/actions";
import { BrandLogo } from "@/components/brand-logo";

const navigation = [
  { href: "/admin", label: "نظرة عامة", symbol: "⌂", exact: true },
  { href: "/admin/content", label: "إدارة المحتوى", symbol: "▤" },
  { href: "/admin/sources", label: "المصادر", symbol: "◎" },
  { href: "/admin/categories", label: "التصنيفات", symbol: "▦" },
  { href: "/admin/media", label: "مكتبة الوسائط", symbol: "▧" },
  { href: "/admin/news-studio", label: "استوديو الصور الإخبارية", symbol: "✦" },
  { href: "/briefing-room", label: "الإحاطة اليومية", symbol: "◷" },
];

export function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { email: string; displayName: string };
}) {
  return (
    <div className="admin-frame">
      <aside className="admin-sidebar">
        <Link href="/admin" className="sidebar-brand" aria-label="غرفة تحرير منصة ساس">
          <BrandLogo variant="compact" priority />
          <span>
            <strong>غرفة التحرير</strong>
            <small>منصة ساس</small>
          </span>
        </Link>

        <div className="sidebar-caption">مساحة العمل</div>
        <nav className="sidebar-nav" aria-label="القائمة الرئيسية">
          {navigation.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              className="sidebar-link"
              aria-label={item.label}
            >
              <span className="nav-symbol" aria-hidden="true">{item.symbol}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-status">
            <span className="status-dot" />
            <span>قاعدة البيانات متصلة عبر Supabase</span>
          </div>
          <Link href="/" className="sidebar-public-link">عرض الموقع العام ↗</Link>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="topbar-kicker">SAS MEDIA & STUDIES</span>
            <strong>نظام إدارة المنصة</strong>
          </div>
          <div className="topbar-user">
            <span className="user-avatar">{user.displayName.slice(0, 1)}</span>
            <span className="user-meta">
              <strong>{user.displayName}</strong>
              <small dir="ltr">{user.email}</small>
            </span>
            <form action={signOut}>
              <button className="button button-quiet button-small" type="submit">خروج</button>
            </form>
          </div>
        </header>
        <main className="admin-content">{children}</main>
        <footer className="admin-footer">
          <span>منصة ساس للإعلام والدراسات</span>
          <span dir="ltr">SAS PLATFORM · ADMIN</span>
        </footer>
      </div>
    </div>
  );
}

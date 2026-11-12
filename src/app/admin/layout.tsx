import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAdmin();

  return (
    <AdminShell user={{ email: user.email, displayName: user.displayName }}>
      {children}
    </AdminShell>
  );
}

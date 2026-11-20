import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAdmin();
  const {data: owner} = await user.supabase.rpc("is_platform_owner");

  return (
    <AdminShell user={{ email: user.email, displayName: user.displayName, isOwner: owner === true }}>
      {children}
    </AdminShell>
  );
}

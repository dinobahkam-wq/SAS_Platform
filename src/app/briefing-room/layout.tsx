import { BriefingShell } from "@/components/briefing-shell";
import { requireBriefingStaff } from "@/lib/briefing-auth";

export const dynamic = "force-dynamic";

export default async function BriefingRoomLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireBriefingStaff();
  return (
    <BriefingShell user={{ email: user.email, displayName: user.displayName, role: user.role }}>
      {children}
    </BriefingShell>
  );
}

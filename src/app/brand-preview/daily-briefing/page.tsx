import type { Metadata } from "next";
import DailyBriefingPreview from "./daily-briefing-preview";

export const metadata: Metadata = {
  title: "معاينة الإحاطة اليومية",
  robots: { index: false, follow: false },
};

export default function DailyBriefingPreviewPage() {
  return <DailyBriefingPreview />;
}

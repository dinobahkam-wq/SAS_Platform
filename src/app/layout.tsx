import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "./knowledge-reading.css";
import "./theme.css";
import "./brand-hero.css";
import "./threads-hero.css";
import "./sitewide-threads.css";
import "./hero-actions-fix.css";
import { SasHeroThreads } from "@/components/sas-hero-threads";
import { themeInitializer } from "@/lib/theme-initializer";

export const metadata: Metadata = {
  title: {
    default: "منصة ساس للإعلام والدراسات",
    template: "%s | منصة ساس",
  },
  description:
    "منصة إعلامية وبحثية تُنظّم الأخبار وتقدم التحليل والدراسات حول اليمن ومحيطه الإقليمي والدولي.",
  applicationName: "SAS Platform",
  metadataBase: new URL("https://www.sas-media.net"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <Script id="sas-theme-initializer" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeInitializer }} />
        <SasHeroThreads />
        <div className="sas-site-content">{children}</div>
      </body>
    </html>
  );
}

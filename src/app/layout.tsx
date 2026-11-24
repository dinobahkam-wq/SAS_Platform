import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "./knowledge-reading.css";
import "./theme.css";
import "./brand-hero.css";
import "./threads-hero.css";
import "./sitewide-threads.css";
import "./hero-actions-fix.css";
import "./content-unavailable.css";
import "./editorial-products.css";
import "./mobile-polish.css";
import "./mukalla-home-hero.css";
import "./sas-split-hero.css";
import "./unified-glass-header.css";
import { SasHeroThreads } from "@/components/sas-hero-threads";
import { SasPublicScrollReveal } from "@/components/sas-public-scroll-reveal";
import { SasPwaControls } from "@/components/sas-pwa-controls";
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
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "ساس", statusBarStyle: "default" },
  icons: { icon: "/brand/icons/sas-pwa-192.png?v=sas-color-20261124", apple: "/brand/icons/sas-pwa-apple-180.png?v=sas-color-20261124" },
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
        <SasPublicScrollReveal />
        <SasPwaControls />
        <div className="sas-site-content">{children}</div>
      </body>
    </html>
  );
}

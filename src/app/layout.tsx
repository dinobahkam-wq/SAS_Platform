import type { Metadata } from "next";
import "./globals.css";
import "./knowledge-reading.css";
import "./theme.css";
import "./brand-hero.css";
import "./hero-carousel.css";
import "./mukalla-hero.css";
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
      <head><script dangerouslySetInnerHTML={{ __html: themeInitializer }} /></head>
      <body>{children}</body>
    </html>
  );
}

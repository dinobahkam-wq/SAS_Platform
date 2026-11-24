import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "منصة ساس للإعلام والدراسات",
    short_name: "ساس",
    description: "مِن الخَبر، إِلى المعرِفَة",
    lang: "ar",
    dir: "rtl",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f7faf8",
    theme_color: "#006f70",
    icons: [
      { src: "/brand/icons/sas-pwa-192.png?v=sas-color-20261124", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/icons/sas-pwa-512.png?v=sas-color-20261124", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/icons/sas-pwa-maskable-512.png?v=sas-color-20261124", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}

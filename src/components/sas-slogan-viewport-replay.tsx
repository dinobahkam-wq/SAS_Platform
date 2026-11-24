"use client";

import { useEffect } from "react";

/**
 * Replays the approved CSS Arabic slogan stroke only after it has fully
 * left and re-entered the viewport; keeps Arabic glyph shaping intact.
 * JS-disabled and reduced-motion visitors retain the existing readable CSS.
 */
export function SasSloganViewportReplay() {
  useEffect(() => {
    const title = document.querySelector<HTMLElement>(".sas-split-hero .sas-slogan-stroke");
    if (!title || !("IntersectionObserver" in window)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.intersectionRatio >= 0.25) {
          title.removeAttribute("data-sas-slogan-waiting");
        } else if (!entry.isIntersecting) {
          // Disable the pseudo-element CSS animations fully while the slogan
          // is off-screen, so entering again restarts both animation tracks.
          title.setAttribute("data-sas-slogan-waiting", "true");
        }
      }
    }, { threshold: [0, 0.25], rootMargin: "0px 0px -5% 0px" });
    observer.observe(title);

    const stop = () => title.removeAttribute("data-sas-slogan-waiting");
    preference.addEventListener("change", stop);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", stop);
      title.removeAttribute("data-sas-slogan-waiting");
    };
  }, []);

  return null;
}

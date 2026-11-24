"use client";

import { useEffect } from "react";

/** Sets a DOM attribute without causing React renders on every scroll event. */
export function SasHeaderScrollState() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".sas-unified-header");
    if (!header) return;
    let frame = 0;
    const sync = () => {
      frame = 0;
      const value = window.scrollY > 36 ? "true" : "false";
      if (header.dataset.scrolled !== value) header.dataset.scrolled = value;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(sync);
    };
    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}

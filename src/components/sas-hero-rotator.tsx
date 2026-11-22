"use client";

import { useEffect, useState } from "react";

/**
 * Homepage editorial hero. The first frame is the approved palace artwork.
 * Additional frames are served from /public/12.webp ... /public/16.webp.
 * Files not yet available are skipped, rather than showing broken images.
 */
const SOURCES = [
  "/sa.webp.png",
  "/12.webp",
  "/13.webp",
  "/14.webp",
  "/15.webp",
  "/16.webp",
] as const;

export function SasHeroRotator() {
  const [available, setAvailable] = useState<string[]>([SOURCES[0]]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const candidates = SOURCES.slice(1);
    Promise.all(candidates.map((src) => new Promise<string | null>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => resolve(null);
      img.src = src;
    }))).then((results) => {
      if (!cancelled) setAvailable([SOURCES[0], ...results.filter((src): src is string => src !== null)]);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (reducedMotion || paused || available.length < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % available.length), 6500);
    return () => window.clearInterval(timer);
  }, [available.length, paused, reducedMotion]);

  return (
    <div
      className="sas-hero-visual sas-hero-rotator"
      aria-hidden="true"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {available.map((src, i) => (
        <div
          key={src}
          className={"sas-hero-rotator-frame" + (i === index ? " is-active" : "")}
          style={{ backgroundImage: `url("${src}")` }}
        />
      ))}
    </div>
  );
}

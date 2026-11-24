"use client";

import { useEffect, useRef, useState } from "react";
import "./home-briefing-rotating-copy.css";

export type BriefingTickerHeadline = {
  order: number;
  title: string;
  href: string;
};

function readingDuration(title: string) {
  // Long headlines deserve adequate reading time, even without opening the briefing.
  return Math.min(12000, Math.max(6500, 3000 + title.length * 95));
}

/**
 * Full-text ticker for the current published briefing.
 * A measured, content-sized mint panel animates width AND height in place.
 * The fixed label never participates in the resizing animation.
 */
export function HomeBriefingRotatingCopy({ headlines }: { headlines: BriefingTickerHeadline[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const active = headlines.length ? headlines[activeIndex % headlines.length] : null;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [headlines]);

  useEffect(() => {
    if (!active || headlines.length < 2 || paused || reducedMotion) return;
    const timeout = window.setTimeout(() => {
      setActiveIndex(index => (index + 1) % headlines.length);
    }, readingDuration(active.title));
    return () => window.clearTimeout(timeout);
  }, [active?.title, headlines.length, paused, reducedMotion]);

  useEffect(() => {
    const measure = measureRef.current;
    const track = trackRef.current;
    if (!measure || !track) return;
    let alive = true;
    const resize = () => {
      if (!alive) return;
      const rect = measure.getBoundingClientRect();
      // 32px is the inline padding of the visible highlight.
      // The measuring element wraps at the full available line width minus padding.
      setDimensions({ width: Math.ceil(rect.width) + 32, height: Math.ceil(rect.height) + 16 });
    };
    resize();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
    observer?.observe(track);
    observer?.observe(measure);
    void document.fonts?.ready.then(resize).catch(() => {});
    return () => { alive = false; observer?.disconnect(); };
  }, [active?.title]);

  if (!active) return null;

  return (
    <div className="sas-home-briefing-rotating-copy" aria-label="أهم أنباء العدد المنشور"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)} onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}>
      <span className="sas-home-briefing-rotating-prefix">
        <span className="sas-home-briefing-rotating-dot" aria-hidden="true"/>
        أهم الأنباء
      </span>
      <div className="sas-home-briefing-ticker-track" ref={trackRef}>
        <div className="sas-home-briefing-rotating-stage"
          style={dimensions ? { width: dimensions.width, height: dimensions.height } : undefined}>
          <a key={active.order} href={active.href} className="sas-home-briefing-rotating-phrase"
            title={active.title} aria-label={`اقرأ التطور: ${active.title}`}>
            {active.title}
          </a>
        </div>
        <span ref={measureRef} className="sas-home-briefing-ticker-measure" aria-hidden="true">{active.title}</span>
      </div>
      <span className="sas-home-briefing-rotating-counter" aria-label={`الخبر ${activeIndex + 1} من ${headlines.length}`}>
        {String(activeIndex + 1).padStart(2,"0")} / {String(headlines.length).padStart(2,"0")}
      </span>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import "./home-briefing-rotating-copy.css";

export type BriefingTickerHeadline = {
  order: number;
  title: string;
  href: string;
};

const INTERVAL_MS = 4800;

/** The ticker uses only published headlines supplied by this edition.
 * Its mint highlight animates to the measured width of each Arabic headline.
 */
export function HomeBriefingRotatingCopy({ headlines }: { headlines: BriefingTickerHeadline[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const active = headlines.length ? headlines[activeIndex % headlines.length] : null;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [headlines]);

  useEffect(() => {
    if (headlines.length < 2 || reducedMotion) return;
    const timer = window.setInterval(() => setActiveIndex(prev => (prev + 1) % headlines.length), INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [headlines.length, reducedMotion]);

  useEffect(() => {
    const span = textRef.current;
    if (!span) return;
    const measure = () => setMeasuredWidth(Math.ceil(span.getBoundingClientRect().width));
    measure();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(span);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => observer?.disconnect();
  }, [active?.title]);

  if (!active) return null;

  return (
    <div className="sas-home-briefing-rotating-copy" aria-label="أهم أنباء العدد المنشور">
      <span className="sas-home-briefing-rotating-prefix">
        <span className="sas-home-briefing-rotating-dot" aria-hidden="true"/>
        أهم الأنباء
      </span>
      <div className="sas-home-briefing-ticker-track">
        <div className="sas-home-briefing-rotating-stage"
          style={measuredWidth !== null ? { width: `min(100%, ${measuredWidth + 28}px)` } : undefined}>
          <a key={active.order} href={active.href} className="sas-home-briefing-rotating-phrase"
            title={active.title} aria-label={`اقرأ التطور: ${active.title}`}>
            {active.title}
          </a>
        </div>
        <span ref={textRef} className="sas-home-briefing-ticker-measure" aria-hidden="true">{active.title}</span>
      </div>
      <span className="sas-home-briefing-rotating-counter" aria-hidden="true">
        {String(activeIndex + 1).padStart(2,"0")} / {String(headlines.length).padStart(2,"0")}
      </span>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

/**
 * The photographs are separately managed editorial assets, not part of the logo.
 * Upload files under public/hero with these stable names; unavailable files are
 * excluded automatically, preserving the clean gradient until they arrive.
 */
const candidates = [
  { src: "/hero/yemen-identity.webp", alt: "مشهد يعبر عن الهوية اليمنية" },
  { src: "/hero/yemen-history.webp", alt: "مشهد من التراث والعمران اليمني" },
  { src: "/hero/yemen-war.webp", alt: "مشهد يوثق آثار الحرب في اليمن" },
  { src: "/hero/yemen-peace.webp", alt: "مشهد يرمز إلى السلام والتعافي" },
] as const;

type Slide = { src: string; alt: string };

export function HeroPhotoCarousel() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Only use verified, fully loaded local images. No broken placeholders.
    Promise.all(candidates.map((candidate) => new Promise<Slide | null>((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve(img.naturalWidth > 0 ? candidate : null);
      img.onerror = () => resolve(null);
      img.src = candidate.src;
    }))).then((results) => {
      if (!cancelled) setSlides(results.filter((slide): slide is Slide => slide !== null));
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (slides.length < 2 || paused || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((current) => (current + 1) % slides.length);
    }, 7800);
    return () => window.clearInterval(timer);
  }, [slides.length, paused, reducedMotion]);

  if (!slides.length) return null;
  return (
    <div
      className="sas-hero-gallery"
      aria-label="صور تعبيرية عن اليمن"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div className="sas-hero-slides" aria-hidden="true">
        {slides.map((slide, index) => (
          <div className={"sas-hero-slide" + (index === active ? " is-active" : "")} key={slide.src}
            style={{ backgroundImage: "url(" + JSON.stringify(slide.src) + ")" }} />
        ))}
      </div>
      {slides.length > 1 ? (
        <div className="sas-hero-pagination" aria-label="التنقل بين الصور">
          {slides.map((slide, index) => (
            <button
              type="button"
              key={slide.src}
              className={"sas-hero-dot" + (index === active ? " is-current" : "")}
              aria-label={"عرض الصورة " + (index + 1)}
              aria-pressed={index === active}
              onClick={() => setActive(index)}
              title={slide.alt}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

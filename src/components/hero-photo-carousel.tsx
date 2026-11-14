"use client";

import { useEffect, useState } from "react";

/**
 * Temporary photography sourced from Wikimedia Commons with attribution.
 * Licensed sample images are loaded from Commons only for visual testing.
 * Replace with approved locally hosted images before production if desired.
 */
const candidates = [
  {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Old_City_of_Sana%27a-111119.jpg?width=1280",
    alt: "صنعاء القديمة، عمارة يمنية تراثية",
    credit: "صنعاء القديمة — ويكيميديا كومنز",
    source: "https://commons.wikimedia.org/wiki/File:Old_City_of_Sana%27a-111119.jpg",
  },
  {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Shibam_Hadramaut.jpg?width=1280",
    alt: "أبراج مدينة شبام التاريخية بحضرموت",
    credit: "شبام حضرموت — ويكيميديا كومنز",
    source: "https://commons.wikimedia.org/wiki/File:Shibam_Hadramaut.jpg",
  },
  {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Destroyed_house_in_the_south_of_Sanaa_12-6-2015-1.jpg?width=1280",
    alt: "منزل متضرر من الحرب جنوب صنعاء عام 2015",
    credit: "آثار الحرب 2015 — تصوير Ibrahem Qasim، CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Destroyed_house_in_the_south_of_Sanaa_12-6-2015-1.jpg",
  },
  {
    src: "https://commons.wikimedia.org/wiki/Special:FilePath/Socotra_Island%2C_Yemen.jpg?width=1280",
    alt: "طبيعة سقطرى اليمنية وشواطئها",
    credit: "سقطرى — تصوير Rod Waddington، CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Socotra_Island,_Yemen.jpg",
  },
] as const;

type Slide = { src: string; alt: string; credit: string; source: string };

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
      <a className="sas-hero-photo-credit" href={slides[active]?.source}
        target="_blank" rel="noopener noreferrer"
        title="بيانات مصدر الصورة وترخيصها">
        {slides[active]?.credit}
      </a>
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

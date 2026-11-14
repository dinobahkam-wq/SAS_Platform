"use client";

import { useEffect, useRef, useState } from "react";

type ThemePreference = "light" | "dark" | "system";
const STORAGE_KEY = "sas-theme-preference";
const options: { value: ThemePreference; label: string; description: string }[] = [
  { value: "light", label: "فاتح", description: "الواجهة النهارية" },
  { value: "dark", label: "داكن", description: "الواجهة الليلية" },
  { value: "system", label: "تلقائي", description: "يتبع إعداد الجهاز" },
];
function readPreference(): ThemePreference {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch { return "system"; }
}
function applyPreference(value: ThemePreference) {
  const dark = value === "dark" || (value === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}
export function ThemeControl() {
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => {
      const next = readPreference();
      setPreference(next);
      applyPreference(next);
    };
    sync();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", sync);
    window.addEventListener("storage", sync);
    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onOutside = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  function choose(value: ThemePreference) {
    setPreference(value);
    try { window.localStorage.setItem(STORAGE_KEY, value); } catch { /* Storage may be restricted. */ }
    applyPreference(value);
    setOpen(false);
  }
  return (
    <div className="sas-theme-switcher" ref={ref} dir="rtl">
      {open && (
        <div className="sas-theme-menu" role="group" aria-label="اختيار مظهر الموقع">
          <span className="sas-theme-menu-title">مظهر المنصة</span>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={"sas-theme-choice" + (preference === option.value ? " is-selected" : "")}
              aria-pressed={preference === option.value}
              onClick={() => choose(option.value)}
            >
              <span className="sas-theme-choice-label">{option.label}</span>
              <small>{option.description}</small>
              {preference === option.value && <span className="sas-theme-check" aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}
      <button
        className="sas-theme-trigger"
        type="button"
        aria-label="تغيير المظهر: فاتح أو داكن أو تلقائي"
        aria-expanded={open}
        aria-haspopup="true"
        title="تغيير مظهر منصة ساس"
        onClick={() => setOpen((current) => !current)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.7 13A8.9 8.9 0 0 1 11 3.3 9 9 0 1 0 20.7 13Z" />
        </svg>
        <span>المظهر</span>
      </button>
    </div>
  );
}

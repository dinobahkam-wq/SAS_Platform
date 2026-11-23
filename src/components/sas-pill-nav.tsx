"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./sas-pill-nav.css";

export type SasPillItem = {
  key: string;
  label: string;
  href?: string;
  count?: number;
};

type Props = {
  items: SasPillItem[];
  activeKey: string;
  onChange?: (key: string) => void;
  variant: "header" | "briefing";
  className?: string;
  ariaLabel: string;
};

export function SasPillNav({ items, activeKey, onChange, variant, className = "", ariaLabel }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });
  const [reduceMotion, setReduceMotion] = useState(false);
  const targetKey = focusKey ?? hoverKey ?? activeKey;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const index = items.findIndex((item) => item.key === targetKey);
      const target = itemRefs.current[index];
      if (!target) {
        setIndicator((prev) => prev.ready ? { ...prev, ready: false } : prev);
        return;
      }
      const nextLeft = target.offsetLeft;
      const nextWidth = target.offsetWidth;
      setIndicator((prev) =>
        prev.ready && Math.abs(prev.left - nextLeft) < 0.5 && Math.abs(prev.width - nextWidth) < 0.5
          ? prev
          : { left: nextLeft, width: nextWidth, ready: true });
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(track);
    itemRefs.current.forEach((node) => { if (node) observer?.observe(node); });
    document.fonts?.ready?.then(measure).catch(() => {});
    return () => observer?.disconnect();
  }, [items, targetKey]);

  return (
    <nav className={["sas-pill-nav", "sas-pill-nav--" + variant, className].filter(Boolean).join(" ")}
      aria-label={ariaLabel} data-reduced-motion={reduceMotion ? "true" : "false"}>
      <div ref={trackRef} className="sas-pill-nav__track">
        <span aria-hidden="true" className={"sas-pill-nav__indicator" + (indicator.ready ? " is-ready" : "")}
          style={{ left: indicator.left, width: indicator.width }} />
        {items.map((item, index) => {
          const active = item.key === activeKey;
          const shared = {
            className: "sas-pill-nav__item" + (active ? " is-active" : ""),
            onPointerEnter: () => setHoverKey(item.key),
            onPointerLeave: () => setHoverKey(null),
            onFocus: () => setFocusKey(item.key),
            onBlur: () => setFocusKey(null),
          };
          const content = <>
            <span className="sas-pill-nav__label">{item.label}</span>
            {typeof item.count === "number" ? <span className="sas-pill-nav__count" aria-hidden="true">{item.count.toLocaleString("en-US")}</span> : null}
          </>;
          return item.href ? (
            <Link key={item.key} href={item.href}
              ref={(node) => { itemRefs.current[index] = node; }}
              {...shared} aria-current={active ? "page" : undefined}>{content}</Link>
          ) : (
            <button key={item.key} type="button"
              ref={(node) => { itemRefs.current[index] = node; }}
              {...shared} aria-pressed={active}
              onClick={() => onChange?.(item.key)}>{content}</button>
          );
        })}
      </div>
    </nav>
  );
}

const mainSections: SasPillItem[] = [
  { key: "/briefings", href: "/briefings", label: "الإحاطة اليومية" },
  { key: "/insights", href: "/insights", label: "التحليل والدراسات" },
  { key: "/visual-knowledge", href: "/visual-knowledge", label: "المعرفة البصرية" },
  { key: "/programs", href: "/programs", label: "الفيديو والبرامج" },
];

export function SasHeaderPillNav() {
  const pathname = usePathname();
  const active = mainSections.find((item) => pathname === item.href || pathname.startsWith(item.href + "/"));
  return <SasPillNav items={mainSections} activeKey={active?.key ?? ""}
    variant="header" className="site-nav" ariaLabel="الأقسام الرئيسية" />;
}

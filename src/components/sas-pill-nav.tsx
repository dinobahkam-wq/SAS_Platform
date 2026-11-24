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
          const highlighted = item.key === targetKey;
          const shared = {
            className: "sas-pill-nav__item" + (active ? " is-active" : "") + (highlighted ? " is-highlighted" : ""),
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

function ProductIcon({ section }: { section: string }) {
  const common = {
    width: 21, height: 21, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: 1.7,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  if (section === "/briefings") return (
    <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>
  );
  if (section === "/insights") return (
    <svg {...common}><path d="M12 6c-3.5-2.1-6.8-2-9-1v14c2.3-1 5.8-1 9 1 3.2-2 6.7-2 9-1V5c-2.3-1-5.5-1.1-9 1Z"/><path d="M12 6v14"/></svg>
  );
  if (section === "/visual-knowledge") return (
    <svg {...common}><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 15v3M12 11v7M17 7v11"/></svg>
  );
  return (
    <svg {...common}><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3V9Z"/></svg>
  );
}

const mainSections: SasPillItem[] = [
  { key: "/briefings", href: "/briefings", label: "الإحاطة اليومية" },
  { key: "/insights", href: "/insights", label: "التحليل والدراسات" },
  { key: "/visual-knowledge", href: "/visual-knowledge", label: "المعرفة البصرية" },
  { key: "/programs", href: "/programs", label: "الفيديو والبرامج" },
];

/** Primary product destinations use ordinary links, not the briefing filter pill control.
 * The layout is entirely responsive CSS: compact intrinsic width on desktop,
 * 2x2 fully visible links on narrow devices.
 */
export function SasHeaderPillNav() {
  const pathname = usePathname();
  return (
    <nav className="sas-product-nav" aria-label="الأقسام الرئيسية — منتجات منصة ساس">
      <div className="sas-product-nav__list">
        {mainSections.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.key} href={item.href!} className={"sas-product-nav__link" + (active ? " is-active" : "")}
              aria-current={active ? "page" : undefined}>
              <span className="sas-product-nav__icon"><ProductIcon section={item.key} /></span>
              <span className="sas-product-nav__text">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const layout = read("src/app/layout.tsx");
const mobile = read("src/app/mobile-polish.css");
const home = read("src/app/page.tsx");
const header = read("src/components/public-site.tsx");
const nav = read("src/components/sas-pill-nav.tsx");
const threads = read("src/components/sas-hero-threads.tsx");

test("mobile polish is an additive final public stylesheet, not a destructive redesign", () => {
  const old = layout.indexOf('import "./editorial-products.css";');
  const next = layout.indexOf('import "./mobile-polish.css";');
  assert.ok(old >= 0 && next > old, "mobile overrides should follow earlier public styles");
  assert.match(mobile, /\.public-site \.home-brand-hero/);
  assert.match(mobile, /\.public-site \.home-section/);
  assert.match(mobile, /\.public-site \.sas-visual-feature/);
  assert.doesNotMatch(mobile, /\.admin-frame\s*[,{]/);
  assert.doesNotMatch(mobile, /\.briefing-public-site\s*[,{]/);
});

test("mobile header supports usable RTL tabs and 44-pixel tap targets", () => {
  assert.match(header, /<SasHeaderPillNav \/>/);
  assert.match(nav, /الأقسام الرئيسية/);
  assert.match(header, /aria-label="البحث في منصة ساس"/);
  assert.match(header, /<ThemeControl \/>/);
  assert.match(mobile, /grid-template-areas: "brand actions" "nav nav"/);
  assert.match(mobile, /overflow-x: auto/);
  assert.match(mobile, /-webkit-overflow-scrolling: touch/);
  assert.match(mobile, /min-height: 44px/);
  assert.match(mobile, /white-space: nowrap/);
  assert.match(mobile, /focus-visible|\.public-site \.site-nav a/);
});

test("page maintains four products, official display and two hero actions", () => {
  for (const name of ["الإحاطة اليومية", "التحليل والدراسات", "المعرفة البصرية", "الفيديو والبرامج"]) {
    assert.ok(home.includes(name), "Missing product: " + name);
  }
  assert.match(home, /مِن الخَبر،/);
  assert.match(home, /<VisualKnowledgePortal \/>/);
  assert.match(home, /<HomeBriefingShowcase/);
  assert.match(home, /sas-cta--primary/);
  assert.match(home, /sas-cta--secondary/);
});

test("mobile reading improves briefing summaries, study cards, visual covers and empty state", () => {
  for (const selector of [
    ".sas-home-briefing-highlight-copy p",
    ".sas-home-briefing-title",
    ".knowledge-card-copy h3",
    ".knowledge-card-copy p",
    ".sas-visual-feature-description",
    ".sas-vk-civic-grid span",
    ".sas-vk-timeline-label",
    ".public-empty-state",
  ]) assert.ok(mobile.includes(selector), "No mobile treatment: " + selector);
  assert.match(mobile, /color: var\(--muted\)/);
  assert.match(mobile, /font:.*Thmanyah Sans/);
  assert.match(mobile, /Tajarib Taweel/);
});

test("breakpoints cover phone and tablet and respect reduced motion", () => {
  for (const width of ["900", "760", "540", "390"]) {
    assert.ok(mobile.includes("max-width: " + width + "px"), width);
  }
  assert.match(mobile, /prefers-reduced-motion: reduce/);
  assert.match(mobile, /pointer: fine/);
  assert.match(mobile, /\.sas-threads-background--sitewide \.sas-threads-mesh \{ opacity: \.52;/);
});

test("decorative WebGL density is reduced only for phone-sized viewports", () => {
  assert.match(threads, /matchMedia\("\(max-width: 760px\)"\)/);
  assert.match(threads, /lineCount=\{compact \? 36 : 64\}/);
  assert.match(threads, /speed=\{compact \? 0\.21 : 0\.19\}/);
  assert.match(threads, /media\.removeEventListener\("change", sync\)/);
  assert.match(threads, /aria-hidden="true"/);
});

test("logo stays visually prominent and theme/search share real 44px control rules", () => {
  const brand = read("src/components/brand-logo.tsx");
  const theme = read("src/components/theme-control.tsx");
  assert.match(header, /<BrandLogo variant="color" priority \/>/);
  assert.match(brand, /brand-logo-color/);
  assert.match(theme, /className="sas-theme-trigger"/);
  assert.match(mobile, /\.public-site \.site-brand \.brand-logo-color \{[\s\S]*?width: 138px;[\s\S]*?object-fit: cover;/);
  assert.match(mobile, /\.public-site \.site-header \.sas-theme-trigger/);
  assert.match(mobile, /flex: 0 0 44px/);
  assert.match(mobile, /\.public-site \.site-header \.sas-header-search:hover/);
  assert.match(mobile, /\.public-site \.site-header \.sas-theme-trigger:focus-visible/);
  assert.match(mobile, /width: 124px; height: 54px;/);
});
test("mesh remains legible on phones without overriding reduced-motion preferences", () => {
  assert.match(threads, /opacity=\{dark \? \(compact \? 0\.46 : 0\.37\) : \(compact \? 0\.52 : 0\.44\)\}/);
  assert.match(mobile, /\.sas-threads-background--sitewide::after/);
  assert.match(mobile, /-webkit-mask-image: linear-gradient\(to bottom/);
  assert.match(mobile, /prefers-reduced-motion: reduce/);
  assert.match(mobile, /\.sas-threads-background--sitewide \.sas-threads-mesh \{ opacity: \.30;/);
});

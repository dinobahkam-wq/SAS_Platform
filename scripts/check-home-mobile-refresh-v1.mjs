import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = path => readFileSync(path, "utf8");
const ticker = read("src/components/home-briefing-rotating-copy.tsx");
const tickerCss = read("src/components/home-briefing-rotating-copy.css");
const nav = read("src/components/sas-pill-nav.tsx");
const navCss = read("src/app/unified-glass-header.css");
const hero = read("src/app/sas-split-hero.css");
const replay = read("src/components/sas-slogan-viewport-replay.tsx");
const home = read("src/app/page.tsx");

test("briefing headline rotation accelerates and still supports reading pause", () => {
  assert.match(ticker, /Math\.min\(7200, Math\.max\(3600, 1900 \+ title\.length \* 51\)\)/);
  assert.match(ticker, /onMouseEnter=\{\(\) => setPaused\(true\)\}/);
  assert.match(ticker, /onFocusCapture=\{\(\) => setPaused\(true\)\}/);
  assert.match(ticker, /reducedMotion/);
  assert.match(tickerCss, /width \.48s/);
  assert.match(tickerCss, /height \.48s/);
});

test("four mobile product tabs have icons and one row, accessible states and motion reduction", () => {
  for (const route of ["/briefings", "/insights", "/visual-knowledge", "/programs"])
    assert.ok(nav.includes("href: \"" + route + "\""), route);
  assert.match(nav, /function ProductIcon/);
  assert.match(nav, /<ProductIcon section=\{item\.key\}/);
  assert.match(nav, /aria-current=\{active \? "page"/);
  assert.match(navCss, /grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(navCss, /\.sas-product-nav__icon/);
  assert.match(navCss, /\.sas-product-nav__link:focus-visible/);
  assert.match(navCss, /prefers-reduced-motion:reduce/);
  assert.match(navCss, /html\[data-theme="dark"\]/);
});

test("Arabic slogan safely restarts on entering viewport after leaving", () => {
  assert.match(home, /<SasSloganViewportReplay \/>/);
  assert.match(replay, /IntersectionObserver/);
  assert.match(replay, /entry\.intersectionRatio >= 0\.25/);
  assert.match(replay, /!entry\.isIntersecting/);
  assert.match(replay, /setAttribute\("data-sas-slogan-waiting", "true"\)/);
  assert.match(replay, /removeAttribute\("data-sas-slogan-waiting"\)/);
  assert.match(replay, /prefers-reduced-motion: reduce/);
  assert.match(hero, /data-sas-slogan-waiting="true"/);
  assert.match(hero, /animation: none !important/);
  assert.match(hero, /@keyframes sasSloganTrace/);
  assert.match(hero, /@keyframes sasSloganFill/);
});

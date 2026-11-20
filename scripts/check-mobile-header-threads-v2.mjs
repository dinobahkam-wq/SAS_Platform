import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const css = read("src/app/mobile-polish.css");
const theme = read("src/components/theme-control.tsx");
const header = read("src/components/public-site.tsx");
const webgl = read("src/components/sas-hero-threads.tsx");
const layout = read("src/app/layout.tsx");

test("mobile header restores larger colored SAS logo while retaining approved asset", () => {
  assert.match(header, /<BrandLogo variant="color" priority \/>/);
  assert.match(css, /width: 144px;\s*height: 68px;\s*object-fit: cover/);
  assert.match(css, /width: 120px; height: 58px/);
  assert.match(css, /width: 132px;\s*height: 62px/);
});

test("search and actual theme trigger are identical 44x44 controls with keyboard focus", () => {
  assert.match(theme, /className="sas-theme-trigger"/);
  assert.match(header, /className="sas-header-search"/);
  assert.match(css, /\.site-header-actions \.sas-theme-trigger/);
  assert.match(css, /\.site-header-actions \.sas-header-search/);
  assert.match(css, /flex: 0 0 44px/);
  assert.match(css, /height: 44px/);
  assert.match(css, /border-radius: 10px/);
  assert.match(css, /focus-visible/);
  assert.match(css, /sas-theme-menu/);
});

test("Threads on phone are more visible and faster without modifying desktop motion", () => {
  assert.match(webgl, /lineCount=\{compact \? 36 : 64\}/);
  assert.match(webgl, /speed=\{compact \? 0\.18 : 0\.19\}/);
  assert.match(webgl, /opacity=\{dark \? \(compact \? 0\.46 : 0\.37\) : \(compact \? 0\.54 : 0\.44\)\}/);
  assert.match(css, /\.sas-threads-mesh \{ opacity: \.57;/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.ok(layout.includes('import "./mobile-polish.css";'));
});

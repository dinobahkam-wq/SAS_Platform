import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = path => readFileSync(path, "utf8");
const manifest = read("src/app/manifest.ts");
const worker = read("public/sw.js");
const controls = read("src/components/sas-pwa-controls.tsx");
const layout = read("src/app/layout.tsx");
const script = read("scripts/generate-pwa-icons.mjs");
const pkg = JSON.parse(read("package.json"));

test("manifest declares installed Arabic standalone SAS app", () => {
  for (const value of ['name: "منصة ساس للإعلام والدراسات"', 'lang: "ar"', 'dir: "rtl"', 'display: "standalone"', 'scope: "/"']) {
    assert.ok(manifest.includes(value), "Missing manifest value: " + value);
  }
  assert.match(manifest,/sas-pwa-192\.png/);
  assert.match(manifest,/sas-pwa-512\.png/);
  assert.match(manifest,/sas-pwa-maskable-512\.png/);
  assert.match(layout,/appleWebApp/);
});
test("brand icons generated, not redesigned, with maskable safe padding", () => {
  assert.match(script,/sas-logo-512\.png/);
  assert.match(script,/sas-pwa-apple-180\.png/);
  assert.match(script,/sas-pwa-maskable-512\.png/);
  assert.match(script,/left: 106, top: 106/);
  assert.equal(pkg.scripts.prebuild, "node scripts/generate-pwa-icons.mjs");
  assert.equal(pkg.scripts.predev, "node scripts/generate-pwa-icons.mjs");
  assert.equal(pkg.dependencies.sharp,"0.35.5");
});
test("service worker never caches private content or editorial navigations", () => {
  assert.match(worker,/request\.mode === "navigate"/);
  assert.match(worker,/try \{ return await fetch\(request\); \}/);
  assert.match(worker,/\/briefings/);
  assert.match(worker,/\?:admin\|login\|auth\|api/);
  assert.doesNotMatch(worker,/cache\.put\(request, response\.clone\(\)\)[\s\S]*request\.mode === "navigate"/);
  assert.match(worker,/MAX_IMAGES = 45/);
  assert.match(worker,/SAS_SKIP_WAITING/);
});
test("Android native install, iOS help, safe updates, no dev SW", () => {
  assert.match(controls,/beforeinstallprompt/);
  assert.match(controls,/await event\.prompt\(\)/);
  assert.match(controls,/appinstalled/);
  assert.match(controls,/إضافة إلى الشاشة الرئيسية/);
  assert.match(controls,/process\.env\.NODE_ENV !== "production"/);
  assert.match(controls,/SAS_SKIP_WAITING/);
  assert.match(controls,/sessionStorage\.getItem/);
  assert.match(layout,/<SasPwaControls \/>/);
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = file => readFileSync(file, "utf8");
const page = read("src/app/programs/page.tsx");
const catalog = read("src/components/programs-catalog.tsx");
const style = read("src/components/programs-catalog.css");
const editor = read("src/components/content-form.tsx");
const actions = read("src/app/admin/content/actions.ts");

test("program catalog displays cover-driven links directly and never embeds videos", () => {
  assert.match(page, /<ProgramsCatalog items=\{catalog\}/);
  assert.match(page, /political-minutes\/mohammed-salem-bafaqir-cover\.png\.png/);
  assert.match(page, /https:\/\/www\.facebook\.com\/share\/v\/1V4X7o4nGs\//);
  assert.match(catalog, /href=\{href\}/);
  assert.match(catalog, /target: "_blank", rel: "noopener noreferrer"/);
  assert.match(catalog, /aria-label=\{"مشاهدة: " \+ item\.title\}/);
  assert.doesNotMatch(catalog, /<iframe|<video|facebook\.com/);
  assert.match(catalog, /<Image src=\{item.cover_url\}/);
});
test("video editor stores HTTPS destination in existing structured JSON body", () => {
  assert.match(editor, /name="external_video_url"/);
  assert.match(actions, /new URL\(externalVideoUrl\)/);
  assert.match(actions, /url\.protocol !== "https:"/);
  assert.match(actions, /external_video_url: externalVideoUrl/);
  assert.match(actions, /readStructuredBody\(formData, videoFormat/);
});
test("poster keeps vertical ratio and a two-column phone grid", () => {
  assert.match(style, /aspect-ratio: 9 \/ 16/);
  assert.match(style, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(style, /focus-visible/);
  assert.match(style, /prefers-reduced-motion/);
});

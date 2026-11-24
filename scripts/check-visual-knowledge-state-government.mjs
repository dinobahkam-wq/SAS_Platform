import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { civicConcepts, civicQuestions, civicSources, governmentForms, governingSystems, stateElements } from "../src/data/visual-knowledge/state-and-government.ts";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("civic concepts and models are distinct, complete, and non-partisan", () => {
  assert.equal(civicConcepts.length, 3);
  assert.deepEqual(civicConcepts.map((item) => item.title), ["الدولة", "الحكومة", "النظام السياسي"]);
  assert.equal(stateElements.length, 4);
  assert.deepEqual(stateElements.map((item) => item.title), ["السكان", "الإقليم", "السلطة العامة", "السيادة"]);
  assert.deepEqual(governmentForms.map((item) => item.id), ["unitary", "federal"]);
  assert.deepEqual(governingSystems.map((item) => item.id), ["parliamentary", "presidential", "semi"]);
  assert.match(governmentForms[0].distinction, /ليست بالضرورة مركزية/);
  assert.match(governmentForms[1].description, /الدستور/);
  assert.match(governingSystems[0].relation, /ثقة البرلمان/);
  assert.match(governingSystems[2].formation, /رئيس حكومة مسؤول أمام البرلمان/);
});

test("every learning unit has a valid official or institutional source", () => {
  assert.ok(civicSources.length >= 4);
  for (const source of civicSources) {
    assert.match(source.url, /^https:\/\//);
    assert.ok(source.organization.length > 5);
    assert.ok(source.title.length > 5);
  }
  assert.ok(civicSources.some((source) => source.url.includes("idea.int")));
});

test("quiz is solvable, non-duplicated and supplies explanatory feedback", () => {
  assert.equal(civicQuestions.length, 4);
  for (const question of civicQuestions) {
    assert.ok(question.answers.length >= 2);
    assert.ok(Number.isInteger(question.correct) && question.correct >= 0 && question.correct < question.answers.length);
    assert.ok(question.explanation.length > 25);
  }
  assert.equal(new Set(civicQuestions.map((question) => question.prompt)).size, 4);
});

test("interactive civics page works as a standalone knowledge product", () => {
  const component = read("src/components/state-government-civics.tsx");
  const page = read("src/app/visual-knowledge/state-and-government/page.tsx");
  const landing = read("src/app/visual-knowledge/page.tsx");
  const home = read("src/app/page.tsx");
  assert.match(component, /useState<Section>/);
  assert.match(component, /setSection/);
  assert.match(component, /setForm/);
  assert.match(component, /setSystem/);
  assert.match(component, /setAnswers/);
  assert.match(component, /aria-pressed=/);
  assert.match(component, /role="status"/);
  assert.match(component, /civicSources\.map/);
  assert.match(component, /التثقيف السياسي/);
  assert.match(page, /notFound\(\)/);
  assert.match(landing, /<VisualKnowledgeGallery/);
  assert.match(home, /<VisualKnowledgePortal/);
});

test("visual styles preserve SAS typography and accessible responsive behavior", () => {
  const css = read("src/components/state-and-government.css");
  const cover = read("src/components/visual-knowledge-feature.css");
  assert.match(css, /Tajarib Taweel/);
  assert.match(css, /Thmanyah Sans/);
  assert.match(css, /direction:rtl/);
  assert.match(css, /focus-visible/);
  assert.match(css, /max-width:670px/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(cover, /sas-vk-civic-diagram/);
  assert.match(cover, /sas-vk-civic-grid/);
  assert.match(cover, /sas-vk-civic-hub/);
});

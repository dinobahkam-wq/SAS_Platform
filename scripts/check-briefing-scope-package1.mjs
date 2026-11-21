import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

function read(path) {
  return readFileSync(new URL("../" + path, import.meta.url), "utf8");
}

const publicEdition = read("src/app/briefings/[slug]/page.tsx");
const printEdition = read("src/app/briefings/[slug]/print/page.tsx");
const indicator = read("src/components/briefing-intelligence-panel.tsx");
const typography = read("src/components/briefing-indicator-typography.css");
const printCSS = read("src/app/briefings/[slug]/print/print.css");
const publicBriefingReader = read("src/lib/public-briefing.ts");

test("public and print editions omit Reading SAS without losing factual briefing", () => {
  for (const [label, source] of [["web", publicEdition], ["print", printEdition]]) {
    assert.doesNotMatch(source, /قراءة ساس|briefing-analysis-section|briefing-print-analysis|revision\.analysis_ar/iu, label);
    assert.match(source, /Briefing|getPublicBriefing/, label);
    assert.match(source, /developments/, label);
    assert.doesNotMatch(source, /executiveSummary/, label);
    assert.match(source, /methodology_ar/, label);
  }
  assert.match(publicEdition, /BriefingIntelligencePanel/);
  assert.match(publicEdition, /BriefingDailyOverview/);
  assert.match(printEdition, /briefing-print-indicators/);
});

test("archived analysis remains readable in underlying snapshot parser", () => {
  assert.match(publicBriefingReader, /analysis_ar: text\(revision\.analysis_ar\)/);
  assert.match(publicBriefingReader, /get_public_briefing/);
});

test("indicator typography is scoped and follows approved SAS families", () => {
  assert.match(indicator, /import "\.\/briefing-indicator-typography\.css"/);
  assert.match(typography, /\.briefing-public-site \.briefing-intelligence/);
  assert.match(typography, /"Thmanyah Sans"/);
  assert.match(typography, /"Tajarib Taweel"/);
  assert.match(typography, /\.briefing-fx-table td/);
  assert.match(typography, /\.briefing-weather-chip strong/);
  assert.match(typography, /\.briefing-market-item strong/);
  assert.match(typography, /\.briefing-overview-metric > strong/);
  assert.match(typography, /"Material Symbols Rounded"/);
  assert.doesNotMatch(typography, /font(?:-family)?:[^;]*Arial/);
  assert.match(printCSS, /Package 1: SAS-approved fonts/);
  assert.match(printCSS, /\.briefing-print-page \.briefing-print-indicators/);
});

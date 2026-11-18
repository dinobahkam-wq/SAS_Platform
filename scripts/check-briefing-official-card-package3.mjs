import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

const studio = read("src/app/admin/news-studio/page.tsx");
const styles = read("src/app/admin/news-studio/briefing-official-card.css");
const transfer = read("src/lib/briefing-studio-transfer.ts");
const routedStudio = read("src/app/admin/news-studio/briefing/[slug]/[order]/page.tsx");
const publicPage = read("src/app/briefings/[slug]/page.tsx");
const ledger = read("src/components/briefing-edition-body.tsx");

test("official canvas template adds visible edition metadata, attribution and brand logo", () => {
  assert.match(studio, /cfg\.briefingOrigin\?'الإحاطة اليومية':modes\[cfg\.mode\]/);
  assert.match(studio, /'الإحاطة اليومية · العدد '\+String\(origin\.editionNo\)/);
  assert.match(studio, /' · التطور '\+String\(origin\.developmentOrder\+1\)/);
  assert.match(studio, /checkLabels|const labels:Record<string,string>/);
  assert.match(studio, /'منسوب إلى مصدر'/);
  assert.match(studio, /'متنازع عليه'/);
  assert.match(studio, /'لم يتحقق مستقلًا'/);
  assert.match(studio, /getLogo\(logoVariant\)/);
  assert.match(studio, /ctx\.drawImage\(cfg\.logo/);
});

test("square and portrait cards are switchable without losing uploaded image", () => {
  assert.match(studio, /setShowCardPhoto\(false\)/);
  assert.match(studio, /setShowCardPhoto\(true\)/);
  assert.match(studio, /newsImage:briefingOrigin&&!showCardPhoto\?null:newsImage/);
  assert.match(studio, /setPhotoPosition\('top'\)/);
  assert.match(studio, /setFormat\('square'\)/);
  assert.match(studio, /setFormat\('portrait'\)/);
  assert.match(studio, /1080 × 1080/);
  assert.match(studio, /1080 × 1350/);
  assert.match(studio, /image\/png,image\/jpeg,image\/webp/);
  assert.match(studio, /file\.size>5\*1024\*1024/);
  assert.match(studio, /setPhotoZoom/);
  assert.match(studio, /setPhotoPanX/);
  assert.match(studio, /setPhotoPanY/);
});

test("PNG download uses actual canvas size and refuses missing brand or source", () => {
  assert.match(studio, /canvas\.width=w;canvas\.height=h/);
  assert.match(studio, /temp\.toBlob\(resolve,'image\/png'\)/);
  assert.match(studio, /document\.fonts\.ready/);
  assert.match(studio, /document\.fonts\.load\('700 86px "Tajarib Taweel"'\)/);
  assert.match(studio, /document\.fonts\.load\('400 43px "Thmanyah Sans"'\)/);
  assert.match(studio, /if\(!logo\)/);
  assert.match(studio, /briefingOrigin&&!sourceName\.trim\(\)/);
  assert.match(studio, /SAS-Briefing-/);
  assert.match(studio, /if\(first\.error\)/);
  assert.match(studio, /if\(result\.error\)/);
});

test("template stays inside authorized News Studio route and no public export endpoint is added", () => {
  assert.match(routedStudio, /await requireAdmin\(\)/);
  assert.match(routedStudio, /createBriefingStudioTransfer/);
  assert.match(transfer, /verificationStatus/);
  assert.match(publicPage, /canUseNewsStudio\(\)/);
  assert.match(ledger, /studioEdition \?/);
  assert.match(styles, /\.studio-official-card/);
  assert.match(styles, /prefers-reduced-motion|focus-visible|\.studio-official-card-options/);
  assert.doesNotMatch(studio, /fetch\(\s*['"]\/api\/public\/studio/);
});

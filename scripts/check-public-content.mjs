/**
 * Release smoke test for public editorial URLs.
 * Requires local dev server or a deployed preview at BASE_URL.
 * Usage: node scripts/check-public-content.mjs
 */
const base = process.env.BASE_URL || "http://localhost:3000";
const publishedSlug = process.env.SAS_TEST_PUBLISHED_SLUG ||
  "تحولات-الصراع-في-اليمن-من-جغرافيا-الساحل-إلى-معركة-الدولة";
const archivedSlug = process.env.SAS_TEST_ARCHIVED_SLUG ||
  "sas-analysis-yemen-economy-two-monetary-zones-2026";

const tests = [
  { path: "/", expectedStatus: 200, label: "homepage" },
  { path: "/research", expectedStatus: 200, label: "research index" },
  { path: "/news", expectedStatus: 200, label: "news index" },
  { path: "/content/" + encodeURIComponent(publishedSlug), expectedStatus: 200, label: "published Arabic slug" },
  { path: "/content/" + encodeURIComponent(archivedSlug), expectedStatus: 404, label: "archived content" },
  { path: "/content/nonexistent-sas-smoke-test", expectedStatus: 404, label: "invalid content" },
];

let failed = 0;
for (const test of tests) {
  try {
    const response = await fetch(new URL(test.path, base), { redirect: "manual", cache: "no-store" });
    const html = await response.text();
    // Next.js may return 200 for streamed notFound pages; require the expected Arabic UI and noindex.
    const unavailable = test.expectedStatus === 404;
    const statusOk = unavailable ? [200, 404].includes(response.status) : response.status === test.expectedStatus;
    const bodyOk = !unavailable || (html.includes("هذه المادة غير متاحة للنشر") &&
      (response.status === 404 || /name=["\x27]robots["\x27][^>]*noindex|noindex[^>]*name=["\x27]robots["\x27]/i.test(html)));
    const good = statusOk && bodyOk;
    console.log((good ? "PASS" : "FAIL") + " " + test.label + ": HTTP " + response.status +
      (bodyOk ? "" : " (missing Arabic 404 copy)"));
    if (!good) failed += 1;
  } catch (error) {
    console.error("FAIL " + test.label, error?.message || error);
    failed += 1;
  }
}
if (failed) {
  console.error(failed + " public-route check(s) failed");
  process.exitCode = 1;
} else {
  console.log("Public-route regression checks passed.");
}

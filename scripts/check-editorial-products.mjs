/**
 * Check the public four-product navigation against a running local server.
 * Usage: node scripts/check-editorial-products.mjs
 */
const base = process.env.BASE_URL || "http://localhost:3000";
const checks = [
  { path: "/", status: 200, required: ["الإحاطة اليومية", "التحليل والدراسات", "المعرفة البصرية", "الفيديو والبرامج"] },
  { path: "/briefings", status: 200, required: ["الإحاطة اليومية"] },
  { path: "/insights", status: 200, required: ["التحليل والدراسات"] },
  { path: "/visual-knowledge", status: 200, required: ["المعرفة البصرية"] },
  { path: "/programs", status: 200, required: ["الفيديو والبرامج"] },
  { path: "/news", status: 307, location: "/briefings" },
  { path: "/media", status: 307, location: "/programs" },
];

let failures = 0;
for (const check of checks) {
  try {
    const res = await fetch(new URL(check.path, base), { redirect: "manual", cache: "no-store" });
    const html = check.required ? await res.text() : "";
    const statusOk = check.location ? [307, 308].includes(res.status) : res.status === check.status;
    const urlOk = !check.location || new URL(res.headers.get("location") || "/", base).pathname === check.location;
    const textOk = (check.required ?? []).every(word => html.includes(word));
    const pass = statusOk && urlOk && textOk;
    console.log((pass ? "PASS" : "FAIL") + " " + check.path + " => " + res.status);
    if (!pass) failures++;
  } catch (error) {
    console.error("FAIL " + check.path + ": " + error.message);
    failures++;
  }
}
if (failures) process.exitCode = 1;
else console.log("All public editorial product routes passed.");

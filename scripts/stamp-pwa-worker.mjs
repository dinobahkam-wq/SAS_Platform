import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

let sha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || "";
if (!sha) {
  try { sha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(); }
  catch { sha = "local-preview"; }
}
const version = sha.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 16);
const input = await readFile("public/sw-template.js", "utf8");
if (!input.includes("__SAS_PWA_VERSION__")) throw new Error("PWA service worker version placeholder missing");
await writeFile("public/sw.js", input.replaceAll("__SAS_PWA_VERSION__", version), "utf8");
console.log("SAS PWA service worker stamped: " + version);

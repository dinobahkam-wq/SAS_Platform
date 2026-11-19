import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { suggestLegacyType } from "../src/lib/legacy-wordpress-export.ts";

const read = (name) => readFileSync(new URL("../" + name, import.meta.url), "utf8");
const action = read("src/app/admin/legacy-import/actions.ts");
const parser = read("src/lib/legacy-wordpress-export.ts");
const ui = read("src/components/legacy-wordpress-importer.tsx");
const page = read("src/app/admin/legacy-import/page.tsx");
const sidebar = read("src/components/admin-shell.tsx");

test("priority classification selects analysis, opinion, podcast and excludes daily news", () => {
  assert.equal(suggestLegacyType("قراءة سياسية في الأزمة", []), "analysis");
  assert.equal(suggestLegacyType("مقال حول حضرموت", []), "opinion");
  assert.equal(suggestLegacyType("حلقة من بودكاست ساس", []), "podcast");
  assert.equal(suggestLegacyType("قرار جمهوري", ["اخبار محلية"]), "skip");
  assert.equal(suggestLegacyType("تطور إقليمي", []), "skip");
});

test("WXR parsing uses original WordPress metadata and skips unpublished records", () => {
  assert.match(parser, /application\/xml/);
  assert.match(parser, /directText\(item, "post_id", XMLNS_WP\)/);
  assert.match(parser, /directText\(item, "post_date", XMLNS_WP\)/);
  assert.match(parser, /directText\(item, "creator", XMLNS_DC\)/);
  assert.match(parser, /directText\(item, "encoded", XMLNS_CONTENT\)/);
  assert.match(parser, /postType !== "post" \|\| status !== "publish"/);
  assert.match(parser, /isLegacyUrl\(originalUrl\)/);
  assert.match(parser, /blocks, mediaLinks/);
});

test("admin migration creates only drafts and does not attribute uploader as writer", () => {
  assert.match(page, /await requireAdmin\(\)/);
  assert.match(action, /await requireAdmin\(\)/);
  assert.match(action, /status:"draft"/);
  assert.doesNotMatch(action, /status:"published"/);
  assert.match(action, /sas-legacy-wp-/);
  assert.match(action, /\.eq\("slug",item\.slug\)/);
  assert.match(action, /source_role:"reference"/);
  assert.match(action, /original_date/);
  assert.match(action, /account_uploader_not_verified_author/);
  assert.doesNotMatch(action, /\.from\("content_authors"\)\.insert/);
});

test("migration UI requires file and explicitly collects manual editorial approvals", () => {
  assert.match(sidebar, /\/admin\/legacy-import/);
  assert.match(ui, /type="file"/);
  assert.match(ui, /parseWordPressExport/);
  assert.match(ui, /importLegacyDrafts/);
  assert.match(ui, /مراجعة المسودة/);
  assert.match(ui, /selected\.slice\(0,10\)/);
  assert.match(ui, /aria-label=\{"اختيار "\+item\.title\}/);
});

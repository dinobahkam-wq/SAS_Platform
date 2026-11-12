# SAS — Legacy article preview tool (Package 02)

This is **not** an importer. It makes an offline, inspectable **draft preview** from a reviewed JSON export. It neither sends network requests nor reads environment variables nor inserts rows into Supabase.

## Usage (Node 22+)

```bash
node --test tests/legacy-preview.test.mjs
node scripts/legacy-preview.mjs reviewed-legacy-articles.json local-draft-preview.json
```

The output file must not already exist; use a new file to prevent accidental overwrites. Review the preview locally. Do not commit original article bodies or personal/secret data into this public repository.

## Required source fields

Input object `{"articles":[...]}`; each article needs:

- `legacy_id` (source numeric ID) and `legacy_url` (exact original HTTPS link under `www.sas-media.net/post/{id}`).
- `title`, `section` and compatible `format`.
- `disposition: "candidate"`, `editorial_review: "approved_for_draft"`.
- `published_at` in ISO 8601 **with timezone**, e.g. `2026-11-02T10:45:00+03:00`.
- `body_text` as manually checked **full plain text**; no raw HTML or fabricated snippets. The tool deliberately rejects obvious HTML.
- News articles also require `source_name` and `source_url`.

Optional: `excerpt`, `author`, `cover_url`, `cover_rights`. No media files are copied by this script.

The output keeps the historical publication time in `legacy.original_published_at` but sets draft `published_at` to null; publication should be a separate reviewed action. Source metadata is attached for **manual review only**, not inserted as a trusted CMS reference automatically.

### Why input must be reviewed

The legacy site exposes indexed articles at `/post/{id}`, but current WordPress connector posts API returned HTTP 404; origin and complete export are not yet authenticated. Search snippets and page previews **do not** count as full-text exports.

### Operational gates

1. Confirm actual CMS origin and export path.
2. Prepare complete and verified articles in a local private JSON export.
3. Preview and review: blocked rows, duplicates, Arabic text structure, author/source labels, dates, and image licenses.
4. Then design an idempotent importer with explicit credentials and user approval. Do not import data from this preliminary preview as-is.

## Windows acceptance evidence — 2026-11-11

Operator-tested on `C:\SAS-PLATFORM-DEV` after checking out `dev/legacy-draft-preview-v1`, tracking `origin/feat/legacy-draft-preview-v1`:

- `node --test tests/legacy-preview.test.mjs`: **5 passed / 0 failed**.
- `npm run typecheck`: **passed**.
- `npm run build`: **passed**, including all seven static prerendered routes; public content routes remained dynamic.
- Two locally modified generated/dependency files were observed: `next-env.d.ts` and `package-lock.json`; do not overwrite these without reviewing them.
- These checks validate code and build only. **No end-to-end legacy extraction, import or publish has occurred.**

The implementation may proceed to an authenticated export of complete source articles and a dry-run preview, with database writes still blocked pending review.

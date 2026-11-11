# SAS: public WordPress REST inventory — diagnostic and local export

The operator's 2026-11-11 probe returned HTTP 200 JSON from both `/wp-json/` and `/wp-json/wp/v2/posts?per_page=1` on `sas-media.net` and `www.sas-media.net`. This establishes availability, **not** yet equality with legacy URLs at `/post/{id}`.

## Run on Windows (Node.js 22+)

```powershell
cd C:\SAS-PLATFORM-DEV
node --test tests/legacy-rest-inventory.test.mjs
node scripts/legacy-rest-inventory.mjs "$env:USERPROFILE\Documents\sas-legacy-private.json"
```

This script uses **public read-only GET requests** to the canonical host, with the date range September 11–November 11, 2026 inclusive, 100 posts per page, maximum 20 pages. It does not log in, delete, import or publish. A large site may hit the page cap and must then be split into narrower date windows; an incomplete result is **not** a full census.

**Privacy and rights:** the local output contains source article bodies in untrusted HTML. Keep it private; do not upload to the public GitHub repository or paste it into chats. Article bodies are preserved for editorial review, not executed or rendered. The source text may contain third-party material and images whose reuse rights require checking.

Inspect only the JSON **summary** printed in PowerShell:
- `count` and `total_reported` describe content inside the requested REST range.
- `id_matches` tests whether known site article numeric IDs (5816, 5762, 5788, 5599) appear in the REST result.
- No matches means the WordPress endpoint might not be the actual source of those published pages, or the posts use different identifiers or post types. Investigate before mapping IDs or exporting images.
- If `id_matches` are present, compare `legacy_url`, title and publication date before trusting the mapping.

The export is raw inventory only. To use `legacy-preview.mjs`, first produce a *separately reviewed plain-text JSON* with source and rights fields. Do not feed untrusted HTML from this inventory directly to the draft preview.

The script never calls Supabase. Its output should remain outside the repository and no real content is published.

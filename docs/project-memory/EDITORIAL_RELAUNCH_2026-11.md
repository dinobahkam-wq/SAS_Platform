# SAS Platform — Editorial Visual Relaunch & Content Migration Study

**Date:** 2026-11-11  
**Status:** Research and proposed implementation plan — **not approved for data migration or production deployment**.  
**Repository:** `dinobahkam-wq/SAS_Platform`  
**Implementation branch currently verified:** `fix/public-editorial-stability-v1`, PR #7, head `519637934f658a81ca3de9352dc6e12e465d32d2`.

## A. Evidence and limitations

1. The operator's Windows output on 2026-11-11 confirms successful `npm run typecheck`, successful optimized `npm run build`, and local HTTP 200 for `/`, `/login`, and `/admin` after moving back to `C:\SAS-PLATFORM-DEV`. It is **not** evidence of functioning login/authorization; repeated `signIn` actions returned HTTP 200 and require a separate authenticated-user functional test.
2. The operator's desktop screenshot shows the actual System B homepage with a large editorial hero, a small header logo, navigation, four sections, and large empty-state panels. There is no published sample content with which to evaluate real card layouts.
3. Research on `https://imtedad.net/` was based on the site's indexed homepage and publicly available article pages. Automated direct rendered visual capture did **not** succeed; do not misrepresent this as a pixel-perfect visual audit.
4. WordPress connection lists `sas-media.net` as a connected Jetpack site, but its site-scoped posts-list endpoint returned HTTP 404/non-JSON in this session (both site ID and domain). The public `www.sas-media.net` pages are indexed with posts through Nov 2026. The source's live CMS/API identity and export mechanism must therefore be verified before migration; do not assume WP REST is functional or that `www` and bare domains resolve identically.
5. Retrieved publication examples: `https://www.sas-media.net/`, `https://www.sas-media.net/post/5773` (2026-11-01), `https://www.sas-media.net/post/5834` (2026-11-08).
6. No content was imported, no Supabase data changed, and no production deployment was performed for this study.

## B. Benchmark findings

### Imtedad — identity-led cultural storytelling

Source `https://imtedad.net/`; sample pages:
- `https://imtedad.net/article/aljulab-jamwn/`
- `https://imtedad.net/article/albu-n-alhmady-fy-wady-blabl/`

Strengths inferred from the published content structure:
- Clear editorial families such as **مدى، أثر، خطوط، فضاء**; strong art-and-history subject-matter specificity.
- Lead/featured stories, curated selections, author attribution and distinct editorial series.
- In-article photography, section subheadings and cultural imagery establish a Yemeni sense of place.

Do **not** copy directly: its cultural-magazine taxonomy, density, or visual artwork into a public affairs, policy analysis, and research product. SAS should adopt **local visual authorship and expressive feature layouts**, not imitate a literary magazine.

### International benchmarks — different jobs

- `https://www.reuters.com/graphics/`: data-led storytelling, charts, maps and coherent visual evidence. News Design award: `https://snd.org/the-new-york-times-die-zeit-and-reuters-named-worlds-best-designed-in-digital-and-print-news-design-competitions/`
- `https://www.ft.com/`: editorial hierarchy, serious typography, high-density scanability. Avoid overloading SAS with market-style widgets.
- `https://www.chathamhouse.org/publications/research-publications`: clear distinction of research paper, policy paper and report, evidence-led presentation and publication metadata.
- `https://carnegieendowment.org/sada/about-sada`: Arabic analytical rigor and authorship.

Use as **principles**, not as code/image/brand assets to copy.

## C. Creative direction: a Yemeni / Hadrami identity without tourist cliché

**Product identity:** Strategic news + research institution, rooted in Yemen and anchored in Hadramawt.

Create an **art-directed asset kit**:
1. **Photographic collection:** Mukalla waterfront/port/urban life; Shibam towers and Wadi Hadramawt earthen architecture; Seiyun; Yemeni landscapes; document scenes and civic/public institutions from across Yemen. For every asset record creator, license, subject, location, capture date, caption and credit. Never use a generic landscape as if it depicts a specific news event.
2. **Abstract design language:** derive restrained architectural linework and negative-space geometry from Hadrami windows, stepped skylines, narrow alley forms, building materials and map contours. Do not paste ornate patterns over body text.
3. **Materials/palette:** retain approved SAS green, monochrome editorial base and typography System B. Add a limited *secondary* warm-clay/sand accent as a feature-level token only after visual testing; no wholesale brand recoloring.
4. **Editorial art direction:** a feature-level image treatment, archival-document framing, footnotes and reference index; custom article covers only where asset rights and relevance are documented.
5. **Accessibility:** semantic text/alt-text, WCAG contrast, RTL, responsive crops, and no visual artwork that hides a title.

Principle: **Yemeni roots in photographs, place and editorial evidence; Hadrami emphasis as an origin, not an exclusionary frame.**

## D. Motion / interaction specification

- 120–220ms micro-interactions for hover, focus and menus; restrained opacity/transform, not aggressive parallax.
- Header transition and section anchor navigation should avoid layout shift.
- Mobile menu must be keyboard navigable, focus-managed and escapable.
- Article-card focus/hover states should convey interactiveness; no movement of reading text when hovering.
- Use skeleton/transition states **only** where actual data latency warrants it; never delay content for aesthetics.
- Respect `prefers-reduced-motion: reduce`; no autoplay animations obscuring news content.
- Measure LCP, CLS, INP and low-power mobile behavior; treat performance as a release gate.

## E. Content migration recommendation

**Decision proposal:** Seed the new platform with real, verified, rights-cleared SAS articles from approximately **2026-09-11 through 2026-11-11**, and use them to test actual designs **before** the major visual redesign. Avoid mass publication until a review sample passes.

Suggested two-stage process:
1. **Read-only source inventory**: content ID, original URL, publication/update timestamps, headline, sanitized body, excerpt, category, author, original image URLs + ownership/rights, source attribution, links and slug.
2. **Source access verification**: resolve `sas-media.net` vs `www.sas-media.net`; test authenticated WordPress/Jetpack API, native CMS export, or an authorized structured export. Public scraping is only a possible fallback after technical and rights review.
3. **Mapping**: original categories → one of `news` / `analysis` / `research` / `media`; formats; migrate only relevant items. Keep `legacy_id`, `legacy_url`, `source_system`, `original_published_at`, import job/version and media attribution in a reversible import manifest or reviewed schema extension as needed.
4. **Media plan**: acquire authorized assets, verify reuse rights, de-duplicate files, preserve meaningful captions/alt text, and store at reviewed sizes in Supabase Storage or an approved external image service.
5. **Dry-run**: 8–12 representative items across sections, first into an isolated environment or draft-only import; inspect rendered body including quotes, lists, RTL, images, article bylines and dates.
6. **Approval**: editorial verification, historical date preservation, link redirects, URL collision and duplicate resolution. Do not replace source articles or mark all posts published automatically.
7. **Batch import**: controlled, idempotent and restartable; produce per-item success/failure report with rollback strategy and post-import checks.
8. **Cutover**: only after stable pages, redirects, proper canonical/SEO handling and backups; avoid switching the live domain prematurely.

### Structural limitations to solve

- Existing `content_items` stores one `section` and one `format` and requires valid non-empty publication body and `published_at`.
- Some SAS news needs attributable source links before publish.
- Current public list reads only a limited number of recent records and is not yet a complete archive; implement pagination or incremental loading before a large import.
- Current body display assumes a JSONB `blocks` representation; create a converter for source HTML, with safety/cleaning and block validation.
- Use a migration manifest to avoid duplication and preserve legacy links.
- Do not import outside-owned photos merely because they appeared on the old site.

## F. Proposed engineering waves — separate PRs, GitHub first

### Package 02 — Source inventory and readiness
**Deliverables:** CMS origin/API diagnosis, read-only export manifest for last 60 days, category/media count and licensing review, 8–12 candidate articles, migration mapping specification. **Gate:** no production writes.

### Package 03 — Controlled import & editorial verification
**Deliverables:** idempotent importer and dry-run, RLS-safe insertion strategy, draft-first content, images with licenses and citations, editorial approval and selected publication. **Gate:** user's authorization for target database and publication.

### Package 04 — Real-content visual editorial redesign
**Deliverables:** responsive navigation, hero + genuine featured material, news compact cards versus research visual covers, refined empty states and author/source cards, art-directed Yemeni/Hadrami asset components. **Gate:** review with real material on desktop/mobile.

### Package 05 — Motion and accessibility
**Deliverables:** subtle interactive movement, reduced-motion compliance, semantic landmarks, keyboard navigation, performance budgets, mobile checks.

### Package 06 — Content depth, SEO and launch readiness
**Deliverables:** historical archives/pagination, 301 redirects and canonical tags, OpenGraph, sitemap, schema.org and launch checklist; verify font commercial usage/license before going live.

## G. Specific local risks

- GitHub `main` has the new Project Memory docs (PR #8 merged); UI feature series remains **unmerged** and active on PR #7.
- Latest operator-local build on active UI branch **passed**. This does **not** verify editor session functionality or end-to-end publication.
- Local `C:\SAS-PLATFORM-DEV` has been switched to `dev/public-editorial-stability-v1`; legacy local modifications were stashed by the operator. Do not drop or pop that stash without review.
- `C:\SAS-PLATFORM-DEV-REVIEW` remains a secondary worktree with local changes, so never reset it casually.

## H. Approval / next step

Start with **Package 02: a non-destructive inventory of the legacy source and mapping report**, then prepare a small draft-only test batch. This sequencing gives redesigners real content without risking large-scale bad imports. Full public migration and larger visual redesign follow once the data and rights are verified.

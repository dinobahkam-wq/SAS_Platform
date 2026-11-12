# Public Homepage Editorial v2 — implementation record

**Date:** 12 November 2026  
**Branch:** `feat/public-homepage-editorial-v2`  
**Base:** `feat/editorial-studio-v2-foundation` (PR #17 head)

## Purpose

Improve the public homepage as an editorial front door for a political and political-knowledge platform. This package changes presentation and content hierarchy only; it does not change the editorial database, published records, storage assets, authentication, CMS workflow, or production deployment.

## Implementation

1. Replaced the homepage's single latest-news ticker-first hierarchy with a dedicated lead-story composition.
2. Selects the lead from published news only: an explicitly featured published item takes precedence; otherwise the newest published news item is used.
3. Shows up to two additional published news items beside the lead, with their actual cover image, format, section, publication date, excerpt, and linked source attribution when available.
4. Removes the lead and supporting items from the subsequent news rails to avoid repeating the same stories in adjacent homepage modules.
5. Keeps remaining news grouped by the existing formats (reports, briefs, official statements), and retains separate analysis, research, and media sections.
6. Adds responsive layouts: a two-column editorial lead on desktop, a stacked lead and compact supporting cards on mobile, with restrained hover motion and reduced-motion support.
7. Preserves the existing Tajarib Taweel + Thmanyah Sans typography decision and the current Supabase published-only read path.

## Files

- `src/app/page.tsx`
- `src/components/homepage-lead.tsx` (new)
- `src/app/globals.css`

## Data and safety boundaries

- No Supabase schema, query policy, RLS, or data mutation.
- No content item was created, edited, published, unpublished, or deleted.
- The homepage continues to read only records whose status is `published`.
- Lead selection uses the existing `is_featured` flag only within the already-filtered published-news collection.
- Source names are displayed only when a linked source exists; otherwise the byline falls back to the platform name.
- No fictional news, fabricated urgency, or invented source attribution is introduced.

## Local verification required

On `C:\\SAS-PLATFORM-DEV` after synchronizing this branch:

```powershell
git fetch origin
git switch feat/public-homepage-editorial-v2
git pull --ff-only
npm run typecheck
npm run build
npm run dev
```

Review the homepage at 1440px, 1024px, 768px, 390px, and 360px. Confirm that:
- the featured item is selected from published news only;
- the lead and supporting stories do not reappear in the following news rails;
- images retain the intended crop and do not distort;
- long Arabic titles wrap without overflow;
- all section links and content permalinks work;
- empty analysis, research, and media states remain clear;
- mobile layout has no horizontal page overflow;
- reduced-motion preferences are respected.

**Status:** implementation committed to the feature branch; local Windows typecheck/build and browser review are pending. Do not merge or deploy until those checks pass and the visual result is reviewed.

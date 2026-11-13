# SAS Daily Briefing — PDF Export V1

**Implemented branch:** `feat/daily-briefing-pdf-export-v1`
**Base:** `feat/daily-briefing-exchange-rates-v5` (PR #38).
**Status:** GitHub implementation ready for local compilation and browser/PDF inspection. No merge, Vercel deployment, or Supabase mutation.

## Product requirement

The public edition reader shows a **تصدير PDF** action beside its edition metadata. It opens a dedicated print-optimized route:

`/briefings/[slug]/print`

The print view provides **طباعة / حفظ PDF**. This invokes the browser's native print dialog. The reader chooses **Save as PDF / حفظ بتنسيق PDF**, A4 portrait, all pages. This is not a server-side binary PDF endpoint or silent automatic download; PDF generation uses Chromium/Edge's print engine to preserve Arabic shaping, typography and clickable links.

## Print output contents

- SAS institutional masthead, edition number/date/revision, title and subtitle.
- Dated historical commodity and USD/SAR exchange-rate metrics (if saved for that edition), with links to original sources. **Live weather is deliberately omitted** from the historical PDF to avoid inserting today's temperature into an old edition.
- Full executive summary printed as prose, regardless of the collapsed state on the public reader.
- **All published developments** in stable order, independent of whichever interactive category tab happens to be selected on the public page.
- Source attribution underneath every development, with printable, clickable original-source links and available publication dates. No popovers needed.
- Published methodology, coverage limits, optional SAS analysis, and correction reason if the edition is a correction.
- A4 page margins, page-number footer in supported Chromium browsers, break controls for events/tables, RTL and the established SAS typography.

## Security and provenance

- Print route reads only the existing public read RPC `get_public_briefing` and the approved local date-keyed context.
- No direct access to draft tables, no write API, no privileged key, and no preview of unpublished drafts.
- Link sanitation is inherited from `src/lib/public-briefing.ts` (HTTP/HTTPS only).
- No references are omitted from the print edition.
- Each PDF is generated from the published edition at the moment the print view loads; filename is selected in the operating system's print dialog.

## Files

- `src/components/briefing-print-action.tsx` — client button invoking `window.print()`.
- `src/app/briefings/[slug]/print/page.tsx` — complete print-oriented public edition.
- `src/app/briefings/[slug]/print/print.css` — print A4, pagination and source styling.
- `src/app/briefings/[slug]/page.tsx` — public PDF export link.
- `src/app/globals.css` — button styling only.

## Acceptance checklist

1. Windows: `npm run typecheck` and `npm run build`.
2. Browse `/briefings/daily-briefing-2026-11-12` and click **تصدير PDF**.
3. Print route opens in new tab; click **طباعة / حفظ PDF**.
4. In Chrome/Edge select **Save as PDF**, size **A4**, all pages, margins default or none according to browser print CSS handling, and enable background graphics if necessary.
5. Review resulting PDF: headline/number, dated indicators, complete summary, **24 unique developments**, each with source attribution links, methodology, no web navigation/menu/UI filters.
6. Check Arabic shaping, page breaks, that no event is unintentionally clipped, and hyperlinks work in a PDF reader.
7. Check print page with no context snapshot: headings and items still render without blank or fabricated figures.
8. Check that the source PDF does not silently display today's weather as historical weather.

## Technical limitation

This uses the native browser PDF print workflow, not a one-click server-generated PDF file. A server-side endpoint with predictable downloads/filenames and archival signed artifacts would be a separate package requiring a PDF rendering engine, CPU/memory sizing, and archive governance.

## Non-action

No Vercel deployment, migration, or merge was performed in this package. No browser PDF was actually produced from the local Windows project by the assistant.

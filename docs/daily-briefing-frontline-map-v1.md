# SAS Daily Briefing — Frontline Map V1 (12 November 2026)

**Status:** GitHub code implemented; Windows typecheck/build and responsive browser review pending.
**Base:** `feat/daily-briefing-compact-intelligence-v4` (PR #36).
**Scope:** visual changes and dated, file-backed frontend context; no database writes, no production deployment.

## Improvements

- Dollar sign rendered before both market quotes using an explicit LTR amount to prevent RTL reordering.
- Executive summary arrow changed from a text glyph to the existing Google Material Symbols Rounded chevron, with rotation on expansion.
- Frontline SVG now has an actual three-state legend: government-associated movement in green, Houthi-associated movement in red, unresolved activity in gray.
- Precise distinction between **day-of-edition activity** (12 November, five fronts, no confirmed territorial change) and **earlier published movement reports** (dated 11 and 9 November, drawn as dashed outlined markers).
- Each earlier report carries its own date, location precision, description, and link to source. No false arrows/lengths or fabricated geographic boundaries.
- Responsive expanded map includes a concise chronological movement list with linked source evidence.

## Important editorial safeguards

- "Published report of a gain" means that the event was reported by a named outlet; it is not evidence that an independently mapped border changed.
- Green/red apply only to dated earlier reports. No front on 12 November is assigned a new verified gain or loss without sufficient geographic and temporal evidence.
- Front markers represent approximate locations at administrative-area scale; the current SVG outline is **illustrative, not a GIS geometry of Yemen**. Replace with licensed/validated GeoJSON when developing the proper GIS map.
- The reporting on 12 November confirms activity in Marib, Jawf, Taiz, Lahj and mentions Bayda, but does not provide an independently checked new boundary.
- Prior government movement in eastern Jawf is from an 11 November report, and a prior Houthi seizure report in Lahj from 9 November. Their reporting dates are visible in the expanded panel.
- The source links remain accessible for reader verification even though source brands are not emphasized as part of the top-level narrative.

## Data and files

- `src/data/briefings/2026-11-12.context.json`: five 12 November front records plus two dated earlier movement reports.
- `src/lib/briefing-dated-context.ts`: extends schema with `HistoricFrontMovement` and attribution.
- `src/components/briefing-intelligence-panel.tsx`: colored reported-movement markers, legend, dated movement detail, dollar prefix.
- `src/components/briefing-edition-body.tsx`: Material chevron for executive summary.
- `src/app/globals.css`: styles for compact map and movement lists.
- CURRENT_STATE and CHANGELOG updated.

## Verification gate

- `npm run typecheck`
- `npm run build`
- Local preview at `/briefings/daily-briefing-2026-11-12` on phone (360, 390, 430px), desktop and keyboard.
- Test source URLs and ensure visible dates are not confused with the edition date.
- Inspect map labels for overlap and verify consistent grayscale/green/red contrast.

No migration, PR merge or Vercel deployment performed.

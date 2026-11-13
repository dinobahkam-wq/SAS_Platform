# SAS Daily Briefing — Compact Intelligence V4

**Status:** GitHub implementation prepared; local build and browser inspection pending.
**Base:** `feat/daily-briefing-monochrome-context-v3` (PR #35).
**Scope:** Reader header and supporting dated context data only. No Supabase writes, migration, PR merges or Vercel deployment.

## Decisions

1. **Edition-dated market observations** replace live oil/gold API quotes in the archived edition. Values are recorded by edition date in a reviewable, versioned repository file, not silently replaced by today's market price.
2. **Weather is separate and tiny:** 3-city strip (Mukalla, Sana'a, Aden); explicitly marked as the latest live reading, not the historical temperature on 12 November. Open-Meteo licensing review remains required before commercial/public production deployment. Missing readings show em dash.
3. **Frontline signal:** each of Marib, Al-Jawf, Taiz and Al-Bayda shows the reported activity and status **غير محسوم**. A military statement reporting operations does not demonstrate an actual gain/loss of territory. The status model allows `advance`, `retreat`, `stable_verified` and `unverified`, but only the last is used without independent source evidence.
4. **Schematic map:** map is collapsed by default and shows approximate governorate/area positions only. It is *not* a drawn frontline, battle map, control polygon or verified movement of forces.
5. **Header:** remove duplicate pre-title edition number; retain edition number in breadcrumb, date and revision below headline; reduce excessive whitespace.
6. **Visual system:** black/white/grayscale, compressed cells, Google Material Symbols Rounded for purpose-specific icons. If font CDN unavailable, fallback should be evaluated during browser QA.

## Snapshot for 12 November 2026

- Brent ICE/FT historical futures daily close: **USD 95.82/barrel**, `https://markets.ft.markitdigital.com/data/commodities/tearsheet/historical?c=Brent+Crude+Oil`. Reuters corroborates the closing price.
- Gold XAU/USD spot exchange-rate historical close: **USD 3,876.75/troy ounce**, `https://www.investing.com/currencies/xau-usd-historical-data`. This is a spot currency quote and must not be conflated with the futures COMEX gold settlement.
- Historical snapshot file: `src/data/briefings/2026-11-12.context.json`.
- Locations/front reports: Marib, Jawf, Taiz and Bayda, as attributed to a government military spokesman report cited in the edition. No verified change to lines of control recorded.

## Structure

- `src/lib/briefing-dated-context.ts`: loads approved, date-keyed context records; returns null for dates without an approved snapshot. No fallback to current market prices.
- `src/lib/briefing-indicators.ts`: new `getBriefingWeatherIndicators()` calls only three weather endpoints and leaves the older live-commodity helper unused by this reader.
- `src/components/briefing-intelligence-panel.tsx`: condensed historic market strip, separate compact current-weather strip and attributed front change/uncertainty record, plus collapsed schematic map.
- `src/app/briefings/[slug]/page.tsx`: removes redundant number and swaps V3 live table for V4 dated panel; loads Material Symbols Rounded from Google stylesheet.
- `src/app/globals.css`: scoped monochrome compact styling.

## Editorial integrity requirements

- Store the reference date, exact financial instrument, source name, URL and value for all market observations.
- Distinguish historical editions from fresh live observations at every render.
- `غير محسوم` or `غير متحقق` means evidence is insufficient to determine territorial movement, **not** that forces did not advance/retreat.
- A source may be cited for a report of operations without verifying the military account's contents independently.
- No invented historic temperatures, exchange rates, frontline distances or change-of-control geometries.
- Date-specific GitHub JSON is an interim publication approach. For a scaled editorial service, propose a Supabase `briefing_context_observations` and `briefing_front_reports` migration with RLS, human approval and revision history; do not apply without user consent.
- Review provider licensing, particularly Open-Meteo usage terms, before public production rollout.

## Local verification

```powershell
cd C:\SAS-PLATFORM-DEV
git status --short --branch
git fetch origin
git switch feat/daily-briefing-compact-intelligence-v4
git pull --ff-only
npm run typecheck
npm run build
npm run dev
```

Open `http://localhost:3000/briefings/daily-briefing-2026-11-12`, confirm the five items (2 historic market values + 3 current temperatures), that front positions are explicitly not control lines, and that reference links work. Test phone widths 360/390/430px. No build has yet been executed or claimed.

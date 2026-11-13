# SAS Daily Briefing V5 — Dated USD/SAR Rates for Sana'a and Aden

**Scope:** Replace the frontline panel with compact historical USD/SAR buy/sell rates. No frontend map, fronts, or territorial claims. Preserve oil/gold dated snapshots, concise live weather, monochrome identity, $ prefix and modern Material Symbols disclosure chevron.

## Edition dated data (2026-11-12)
All values are YER per 1 unit of foreign currency:

| Market | Currency | Buy | Sell |
|---|---|---:|---:|
| صنعاء | USD | 530 | 533 |
| صنعاء | SAR | 139.50 | 140.20 |
| عدن | USD | 1,568 | 1,579 |
| عدن | SAR | 410 | 413 |

Primary archived rate list: https://boqash.com/price-currency/
Corroborating same-date market board: https://yemen-currency.iwatheq.com/

These are market quotations, not official national or central-bank exchange rates. Figures are tied to the edition date, not refreshed automatically in previously published editions. Prices may differ within a city and across reporting times; an attribution and disclosure of quote scope remain visible.

## Files
- `src/data/briefings/2026-11-12.context.json` — dated rate snapshot; front records and historic front reports removed from edition context.
- `src/lib/briefing-dated-context.ts` — `HistoricExchangeRates` and `HistoricExchangeRate` types; old fronts no longer part of the edition context schema.
- `src/components/briefing-intelligence-panel.tsx` — two city tables with USD/SAR buy/sell rates, existing oil/gold and weather, no frontline map.
- `src/app/globals.css` — condensed two-column responsive styling (stacks at exceptionally narrow widths).
- `docs/project-memory/CURRENT_STATE.md`, `CHANGELOG.md`.

## Editorial and technical notes
- Historical rates remain reviewable in versioned GitHub data; no direct migration or mutation of Supabase production was performed.
- Links to original rate sources remain visible, rather than hiding attribution.
- The historical frontline work is retained in earlier Git branches/PRs for future specialist-map development; the current reader does not render it.
- Legacy unused CSS from earlier map experiments may be removed as part of a future CSS consolidation, not a functional blocker.
- Dynamic weather continues to be labeled as current, not historical, and the provider's licensing must be reviewed before public production rollout.
- No merge or Vercel deploy. Local `npm run typecheck`, `npm run build`, and mobile visual verification remain required.

## Windows checks
```powershell
cd C:\SAS-PLATFORM-DEV
git status --short --branch
git fetch origin
git switch feat/daily-briefing-exchange-rates-v5
git pull --ff-only
npm run typecheck
npm run build
npm run dev
```

Check `/briefings/daily-briefing-2026-11-12` for 2 market prices, 4 exchange-rate rows in 2 city panels, 3 weather readings, and absence of the frontline map. Ensure no horizontal overflow at 360/390/430px.

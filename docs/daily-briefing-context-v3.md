# SAS Daily Briefing — Visual V3 + Context Indicators

**Status:** Implemented on feature branch, pending local typecheck/build/browser tests.
**Base branch:** `feat/daily-briefing-mobile-visual-v2` (PR #34).
**No changes to public Supabase records, editorial snapshots, migrations or deployed Vercel site.**

## Visual decisions
- Institutional identity **black, white, and grayscale**. Scope is limited to the public briefing reader; shared site-wide CSS and existing brand assets remain untouched.
- Hierarchical headline splits existing `revision.title_ar` into large product name and smaller descriptive subtitle; date stays in the edition metadata.
- Removes the 4-cell coverage window/checked/published metadata card from the article header. These values remain in the immutable editorial snapshot and can be inspected in back-office data.
- Executive summary becomes a **collapsed-by-default HTML details panel**. References in that summary are omitted to avoid duplicate citations; the development register still carries the original source popovers.
- Subtle icons (oil, gold, weather, summary) and a monochrome category palette. Information classification still appears explicitly in words.

## Context indicators table
- 5 rows: **Brent crude per barrel (USD), gold per troy ounce (USD), current temperature (°C) for Mukalla, Sana'a, Aden**.
- Values are independent of the publication date of the current briefing. The label explicitly says `قراءات راهنة مستقلة عن تاريخ هذا العدد`; values must not be construed as readings for the archived date.
- Displays the source and actual observation/update timestamp per row, with link.
- **Gold:** `https://api.gold-api.com/price/XAU` with validation of positive numeric price and parsed source timestamp. Fails to `غير متاح` if invalid/unavailable.
- **Weather:** `https://api.open-meteo.com/v1/forecast` with `current=temperature_2m`, timezone Asia/Aden, three fixed city-center locations. Readings are **model-derived**, not independently measured by local stations. Source attribution via a link in each row.
- **Brent:** `https://api.oilpriceapi.com/v1/prices/latest?by_code=BRENT_CRUDE_USD`. Requires an optional server-only `OILPRICEAPI_KEY`; never expose key to the client. Without a configured key or a validated fresh quote, show `غير متاح` and do not invent prices. Validate observed/updated timestamp and `data_status != stale`.
- Individual requests catch errors, time out after 5 seconds, cache with 30-minute revalidation; one failure must not break the whole reader.

## Provider licensing and future production launch
- Open-Meteo free forecast API is licensed for **noncommercial** use with attribution under CC BY 4.0. Verify SAS's permitted use; purchase a suitable commercial plan if necessary.
- OilPriceAPI standard API plans have **public display/redistribution restrictions**. A key alone is not sufficient authorization to republish Brent quotes. Confirm display rights before setting `OILPRICEAPI_KEY` in the live Vercel environment.
- Review Gold API terms for public redistribution at the product scale. A free API endpoint does not automatically confer rights to resell or republish its data without restrictions.
- No API key is added or committed. No values are written to Supabase.

## Implementation paths
- `src/lib/briefing-indicators.ts` — server-side data providers, parsing, time validation, graceful failure.
- `src/components/briefing-context-indicators.tsx` — accessible 3-column, 5-row table with source links and iconography.
- `src/app/briefings/[slug]/page.tsx` — title hierarchy and indicator placement.
- `src/components/briefing-edition-body.tsx` — collapsed executive summary, no summary citation buttons.
- `src/app/globals.css` — scoped monochrome reader styles and responsive treatment.

## Local acceptance tests
1. `npm run typecheck` and `npm run build`.
2. Main title is dominant and subtitle smaller. No four-cell coverage-window card remains.
3. Five indicator rows visible; source links and readings/timestamps correct where available, otherwise `غير متاح`.
4. All 24 published developments remain unchanged and citations appear inside each event.
5. Summary expands/collapses and contains no duplicate citation buttons.
6. On phone 360/390/430px, no horizontal overflow or clipped table content.
7. Archive and navigation remain unaffected. No silent bad numbers when a provider fails.
8. Verify public-data licensing before deploying live data providers.

## Suggestions for a later phase
- Exchange rates **YER/USD split between Aden and Sana'a** with distinct providers and source timestamps; do not treat either market as the official national rate.
- Red Sea/Bab al-Mandab maritime security and shipping disruption indicators based on verified notices, not an invented risk score.
- Replace non-essential metrics with editorially important indicator modules when data coverage supports them; require explicit source, unit and time for every value.

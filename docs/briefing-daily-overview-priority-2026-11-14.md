# SAS Daily Briefing — Overview & Geographic Priority (Package 2)
**14 November 2026 — review branch only:** `feat/briefing-daily-overview-priority-v1`, stacked above `feat/briefing-dense-evidence-layout-v1` (PR #56). No merge to `main`, no database migration or production deployment.

## Product intent
A compact daily political information summary for readers, using only facts already preserved in the published edition. Prioritize Yemen, then regional developments, then international developments relevant to Yemen. Keep source links discreet but accessible. Do not invent deadlines, documents, comparisons, or predictions to populate a visual module.

## Delivered on branch
- `src/lib/briefing-view.ts`: stable, presentation-only geographical priority (local/national → regional → international), and evidence-derived edition counts.
- `src/components/briefing-daily-overview.tsx` and stylesheet: compact total, Yemen, regional, international and recorded positions; explicit statement when no structured change comparisons exist.
- `src/app/briefings/[slug]/page.tsx`: overview immediately below the edition title, ahead of market/FX indicators.
- `src/components/briefing-edition-body.tsx`: priority ordering in the public ledger and display numbering (source snapshot remains unchanged); preserve order within each geography.
- `scripts/check-briefing-overview.mjs`: tests priority, immutability and counts.

## Semantics and limits
- Counting `information_class=position` is **not** synonymous with counting official statements; label accordingly.
- A `what_changed_ar` field counts as a documented editorial comparison only when nonempty. A zero count never implies no political change occurred.
- No political trend scores or artificial calendar/events; dedicated agenda and document indexes require a separate editorial/data package.
- The **published snapshot**, source registry, security permissions and PDF layout are untouched. Web presentation order can therefore differ from the existing print representation until print parity is deliberately approved.
- The old executive summary is a frozen editorial text; it is intentionally not rewritten by the new geographic sorting.

## Acceptance checks (pending)
1. `node --test scripts/check-briefing-overview.mjs`
2. `npm run typecheck`, `npm run build`, `npm run dev`.
3. Open an already-published edition; check the metric counts are computed from its actual developments, and that a zero-change edition says no structured comparison exists.
4. On the All tab, verify Yemen-first order and continuous visible numbering; tabs still filter as before and sources still open.
5. Review light/dark modes, phone layout, print route and archived edition integrity.
6. Merge only after user approval and after PR #56 is accepted/merged, updating the stacked PR base to `main` after that merge.

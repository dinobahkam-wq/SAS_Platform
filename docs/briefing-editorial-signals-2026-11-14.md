# SAS — Package 3: Editorial signals within Daily Briefing

**14 November 2026. Review-only branch:** `feat/briefing-editorial-signals-v1`, stacked above PR #57, which is stacked above PR #56. No production change, database write, migration, merge or deployment.

## Purpose
Increase **information per screen** without extra news links, repeating the full ledger or fabricating tomorrow's political agenda. A dense overview now surfaces selected `position` records and explicit `what_changed_ar` records from the published edition. This is extraction, not new AI-generated political analysis.

## Implementation
- `src/lib/briefing-view.ts`: deterministic, Yemen-first selection of up to three position headlines and three recorded changes. Original data and snapshot are not mutated; missing values are not inferred. More positions are preserved in the full ledger.
- `src/components/briefing-daily-overview.tsx`: compact "مواقف مسجلة في العدد" and conditional "تغيرات موثقة في العدد". No extra public source links, because citations remain accessible in the original development cards.
- `src/components/briefing-daily-overview.css`: minimal responsive hierarchy, small line lengths, typography with existing theme variables.
- `src/components/briefing-intelligence-panel.tsx`: fixes **hardcoded exchange-rate date** ("12 نوفمبر 2026") by reading the dated context; no invented daily rate.
- `scripts/check-briefing-overview.mjs`: deterministic signal selection, absence/limit, untouched input verification.

## Editorial constraints
- A `position` is **a recorded position**, not necessarily a government statement. No implied classification of political actor intentions.
- A `what_changed_ar` is editorially supplied, not automatically calculated. Its source validation is inherited from the published edition and must be reviewed by the editor before publication.
- The default overview is a concise excerpt; the full ledger, verification tags and all public citations are preserved.
- No prospective calendar dates or inferred political trend indicators are generated.
- The changes do not alter the print route or the published snapshot. Print parity and introducing an actual agenda are separate packages.

## Acceptance gate
1. `node --test scripts/check-briefing-overview.mjs`
2. `npm run typecheck`; `npm run build`; `npm run dev`.
3. Verify edition 12 November: recorded positions appear in the overview, and missing documented changes produce no fabricated descriptions.
4. Test mobile / RTL / dark theme; link and popover for each original development; print route; exchange-rate date display on a different published edition if available.
5. Confirm Vercel separately, after PR review and approval. Do not merge stacked PRs automatically.

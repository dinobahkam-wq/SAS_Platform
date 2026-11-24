# SAS Platform — Release handoff and integration record, 24 November 2026

## Status and scope

- Source of truth: `dinobahkam-wq/SAS_Platform`; integration source: `feat/briefing-image-enrichment-webp-v1`; target: `main`.
- Scope: public-site UI refinement, homepage flagship briefing, audio companion, editorial media enrichment, mobile and identity improvements, visual knowledge, and editorial tests.
- **Do not conflate GitHub merge with deployment.** No production Vercel release follows automatically from this handoff.
- No historical briefing snapshot should be edited to attach images/audio. The published source and edition revision remain authoritative.

## Approved editorial product structure

1. الإحاطة اليومية
2. التحليل والدراسات
3. المعرفة البصرية
4. الفيديو والبرامج

Brand tagline: «مِن الخَبر، إِلى المعرِفَة». Arabic first; Latin numerals; typography Tajarib Taweel for editorial display and Thmanyah Sans for body.

## Homepage flagship briefing — final agreed presentation

- Latest *published* briefing selected by the existing public briefing archive and current revision RPC.
- Actual issue data, real source-backed development records, edition date, full report link, photo evidence only when published and attributed.
- Three-column flagship with local Mukalla image and three key developments, plus full-width **«أهم الأنباء»** strip spanning the card's full grid below those columns.
- Headline strip reads the full titles of *all* published developments for the displayed issue, not static marketing copy or fabricated breaking news.
- A fixed dark teal label and an adaptive pale turquoise capsule. No truncation or ellipses. Arabic wraps naturally; capsule animates **both width and height** using measured text dimensions (CSS transitions). Long headlines receive longer reading windows; hover/focus pauses rotation; reduced-motion preferences respected.
- Links open the corresponding development in the public edition.

Main implementation: `src/components/home-briefing-showcase.tsx`, `.css`, `home-briefing-rotating-copy.tsx`, `.css`; test `scripts/check-home-briefing-rotating-copy-v1.mjs`.

## Audio companion — published edition only

- User supplies human-reviewed Arabic radio-style audio from NotebookLM in genuine M4A/AAC; sound is generated **outside** the site and not synthesized by a public-facing AI widget.
- Audio player has the bespoke SVG AI waveform/sparkle icon (not ♫), true SVG play/pause, seek/progress, volume, playback speed, download, RTL and mobile-aware styling. It does not autoplay.
- Player is conditional on a **published asset for the exact current revision**, both in the homepage briefing feature and edition page; do not use audio from another edition/revision.
- Admin workspace: `/admin/briefings/audio/[slug]` for upload as draft, preview, explicit approval and publication. An admin-only protected flow.
- Supabase: `sas-briefing-audio` storage bucket; `briefing_audio_assets` table with RLS; public `get_public_briefing_audio(p_slug)` RPC returns only published audio for current published revision without exposing protected editorial tables.
- Migrations `20261124111500_briefing_audio_companion_v1.sql` and `20261124112700_public_briefing_audio_rpc_v1.sql` were already applied to the connected Supabase project **budsfbyrdpjkobqstpyr** and verified. **Do not re-apply manually without inspecting the migration history.**
- Audio source files live in Supabase Storage, not the Git repository. The fact a user uploaded a file and published it earlier must be checked against live DB, not inferred from code.

Main implementation: `src/components/briefing-audio-player.tsx` / `.css`, `src/lib/briefing-audio.ts`, `src/app/admin/briefings/audio/`, `src/types/database.types.ts`; test `scripts/check-briefing-audio-v1.mjs`.

## Other work included in integration branch

- User-facing sitewide scroll reveal via IntersectionObserver + Web Animations, preserving SSR visibility, reduced-motion compliance; admin excluded.
- Header's SasPillNav navigation and consistent filters; brand logo interactive metallic-style CSS treatment; slogan stroke reveal; media/content card refinements.
- Visual-knowledge pages, timeline, civic state/government reference, editorial visual layouts.
- Optional rights-checked WebP image enrichment tied to briefing revisions; separate from immutable snapshot; secure storage and metadata controls.
- Historical source-backed edition exported as Markdown to `docs/briefings/SAS_DAILY_BRIEFING_2026-11-21_MARKDOWN_EXPORT.md`.

## Security and editorial constraints

- Official editorial doctrine is recorded in `docs/SAS_DAILY_BRIEFING_EDITORIAL_STANDARD_CURRENT.md` and accompanying project document; facts/attributions must remain distinguishable from interpretation.
- Do not manufacture current events, audio facts, source imagery or timestamps.
- No public anonymous insert into briefing image/audio metadata; public audio metadata via limited RPC only.
- User-facing audio must be explicitly approved; audio generated with AI should be labelled appropriately, consistent with existing player copy.

## Integration quality gate

1. Compare both directions `main...feat/briefing-image-enrichment-webp-v1`: `main` may contain commits absent from development. Never force-push or replace `main`.
2. Open PR with `main` as base and current feature branch as head.
3. Wait for CI **node tests, TypeScript and production build** to pass on the PR merge ref. Inspect conflicts/check failures before merge.
4. Merge using GitHub PR only after success; verify the resulting `main` SHA and that PR is merged.
5. Do not delete unreviewed historical branches. Old branch names are archive, not a reason to delete. After merge, begin future work from `origin/main`.
6. Production Vercel deployment has not been requested here; record it as a separate release step.

## Work preferences and handoff to next conversation

- Respond in Arabic, direct, concise but technically precise; challenge weak architecture/assumptions.
- Prefer changing code on GitHub directly, then a single PowerShell block for local sync and checks.
- Preserve RTL, Arabic, Latin numerals, fonts and accessible responsive design.
- Do not merge/deploy without explicit user consent; **this user's request authorizes merge into main**, not Vercel deployment.
- Next conversation should verify latest GitHub main commit and PR CI and then work on requested incremental product changes from a fresh branch.

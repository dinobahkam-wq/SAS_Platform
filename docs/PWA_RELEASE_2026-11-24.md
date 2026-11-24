# SAS PWA v1 — implementation and acceptance

Status: review branch `feat/sas-pwa-install-and-performance-v1` branching from unmerged PR #90 (`feat/unified-glass-header-nav-v1`). **Do not merge to main or deploy to Vercel without user authorization.**

## Implemented
- Next App Router `src/app/manifest.ts`: Arabic, RTL, standalone, canonical identity and brand colors.
- From approved `public/brand/icons/sas-logo-512.png`, `scripts/generate-pwa-icons.mjs` creates standard 192/512, 180 Apple icon, and maskable 512 with safe padding. Runs via `prebuild` and `predev` to avoid binary duplication.
- `SasPwaControls`: Android native `beforeinstallprompt` triggered synchronously by a user click when available; iOS Safari instructions, explicit in-app-browser guidance, installed-state detection and session dismiss, with no auto prompt.
- `public/sw.js`: production-only registration, no HTML/page/API/briefings/admin/login/auth caching, static branded assets cache-first, bounded same-origin image caching; offline generic document fallback. No push notifications or automatic downloads.
- `SAS_SKIP_WAITING` only after explicit update action; avoids surprise reloads.
- New regression checks in GitHub CI.

## Acceptance before merge
- CI (regressions/typecheck/build) passes on latest SHA.
- Install assets available at `/brand/icons/sas-pwa-{192,512}.png`, `/brand/icons/sas-pwa-maskable-512.png`, `/brand/icons/sas-pwa-apple-180.png` after `npm run build`.
- Production-mode local preview: `npm run build; npm run start` on localhost. On Android Chrome, when eligible, button triggers real prompt. iPhone Safari guidance accurate; installed mode hides offer.
- Verify `/manifest.webmanifest`, inspect DevTools Application > Service Workers, offline message, re-online fresh daily briefing and no private cached responses.
- Lighthouse mobile audit and iPhone/Android real-device validation remain required.
- Security: no source files or public iframe/full video downloads; responsive dark/light focus rings.

## Important boundaries
- On iOS, no website may invoke the native install sheet directly. On unsupported Android/browser environments the native install event might not fire.
- Manifest/service worker alone cannot guarantee installation until the served site is HTTPS and device browser deems it eligible.
- PWA source is not published on Vercel by this branch. Only `main` deployment after explicit authorization.

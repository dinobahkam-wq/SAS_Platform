# Application foundation

## Current stack

- Next.js 16.4.5 (App Router)
- React 19.3.1
- TypeScript
- Tailwind CSS 4.3.3

## Initial UI constraints

- Arabic-first interface with RTL document direction.
- Keep interface text Arabic; use Latin digits for numeric presentation.
- The initial public site has four content areas:
  1. News and current affairs
  2. Analysis and opinion
  3. Studies and research
  4. Programs and multimedia
- The knowledge-base / issues / files system is intentionally out of scope for this initial release.
- Do not add brand fonts or logo files until the supplied assets and their web-use licenses are verified.
- The current wordmark in the page is a temporary text placeholder, not the approved logo.

## Commands

- `npm install`
- `npm run dev`
- `npm run typecheck`
- `npm run build`

## Environment

Copy `.env.example` to `.env.local` locally. Never commit `.env.local`.

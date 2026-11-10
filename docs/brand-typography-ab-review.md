# SAS Platform — Editorial Typography Comparison A/B

## Purpose

This is an internal visual comparison between two editorial typography systems. It does not change the production typography tokens or the public site typography.

## Shared controls

Both specimens use the same Arabic content, layout, spacing, font sizes, and body typography. The primary headline is deliberately identical in both systems and uses Tajarib Taweel Black (900). Body copy, summaries, metadata, and interface labels use Thmanyah Sans.

## System A — Tajarib-led

- Primary editorial headline: Tajarib Taweel, 900.
- Article and research titles: Tajarib Taweel, 700.
- Main subheadings: Tajarib Taweel, 500.
- Secondary subheadings: Tajarib Taweel, 400.
- Body copy: Thmanyah Sans, 400.
- The specimen displays the five Tajarib weights (300, 400, 500, 700, 900).

## System B — Dual display

- Primary editorial headline: Tajarib Taweel, 900.
- Article and research titles: Thmanyah Serif Display, 700.
- Main subheadings: Thmanyah Serif Display, 500.
- Secondary subheadings: Thmanyah Serif Display, 400.
- Body copy: Thmanyah Sans, 400.
- The specimen displays the five Thmanyah Serif Display weights (300, 400, 500, 700, 900).

## Review route

`/brand-preview/editorial-ab`

The existing `/brand-preview/editorial` route remains available as the standalone System A editorial specimen. The comparison page is internal-only and sets `robots: noindex, nofollow`.

## Decision status

A/B comparison only. No final selection between A and B is implied by this implementation. Keep the current production typography tokens unchanged until the visual review is completed.

## Font asset and licensing note

The specimen references the font files already present under `public/fonts/`. Before public production deployment, confirm that the applicable font licence permits serving these files from the platform's public asset directory and obtain any required written permission from the rights holder.

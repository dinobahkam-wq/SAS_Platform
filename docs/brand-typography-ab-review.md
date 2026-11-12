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


## Decision update — 10 November 2026

The comparison has now concluded: **System B is selected for gradual adoption on the public interface**.

The initial B specimen mapping above was refined during the later product test. The canonical production mapping is:

- Primary urgent/editorial headline: Tajarib Taweel 900.
- Article title: Thmanyah Serif Display 700.
- Main internal heading: Thmanyah Serif Display 500.
- Secondary internal heading: Tajarib Taweel 500.
- Strategic report cover title: Tajarib Taweel 900.
- Body copy, summaries, metadata, and interface labels: Thmanyah Sans 400.

The later product specimen at `/brand-preview/products-b` is the visual reference for this refinement. This historical comparison document records the original A/B test; the canonical adoption specification is [brand-system-b-adoption-v1.md](brand-system-b-adoption-v1.md).

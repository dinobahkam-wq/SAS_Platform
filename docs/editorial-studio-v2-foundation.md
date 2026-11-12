# SAS Editorial Studio v2 — Foundation

**Status:** Implementation branch; local validation required before merge  
**Branch:** `feat/editorial-studio-v2-foundation`  
**Scope:** Structured editorial authoring without database migration

## Delivered in this increment

- Replaced the plain-text body textarea with a structured block editor.
- Supported block types: paragraph, main heading, secondary heading, quotation, and list.
- Added block ordering controls, deletion, and list-item editing.
- Added an optional live preview of the article body.
- Stores the body as versioned JSONB using the existing `{ version: 1, blocks: [...] }` shape.
- Server-side validation allowlists block types, caps the number of blocks, trims empty values, and rejects empty article bodies.
- Existing records stored as paragraph blocks remain editable. The server action retains a plain-text fallback for older form submissions.
- No database migration, service-role credential, or new dependency is introduced.

## Data contract

```json
{
  "version": 1,
  "blocks": [
    { "type": "heading", "text": "عنوان رئيسي" },
    { "type": "paragraph", "text": "نص الفقرة..." },
    { "type": "quote", "text": "نص الاقتباس..." },
    { "type": "list", "items": ["عنصر أول", "عنصر ثان"] }
  ]
}
```

The public renderer already supports paragraph, heading, subheading, quote, and list blocks. This increment uses that existing contract and does not introduce arbitrary HTML.

## Not included yet

- Inline image insertion inside the article body.
- Author and tag management screens.
- Rich inline formatting (bold, italic, links).
- Editorial revision history or collaboration.
- A separate preview route with the complete public page shell.

These are follow-on increments. Cover image selection, source linking, categories, and publication status remain in the existing workflow.

## Local verification checklist

1. `npm install --no-audit --no-fund`
2. `npm run typecheck`
3. `npm run build`
4. Create a draft with paragraphs, headings, a quote, and a list.
5. Save, reopen, reorder blocks, edit, and save again.
6. Preview a draft and verify that it remains inaccessible to anonymous visitors.
7. Publish a news item only after linking at least one attributable source.
8. Verify that the public article page renders each block in the saved order.
9. Verify 360px, 390px, tablet, and desktop layouts.

No production deployment or merge to `main` is implied by this branch.

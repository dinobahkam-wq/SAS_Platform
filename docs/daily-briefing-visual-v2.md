# SAS Daily Briefing — Mobile-first Visual Upgrade V2

**Status:** Implemented on branch; local build and browser verification still required.  
**Base:** `feat/daily-briefing-public-experience-v1` (PR #33).  
**Scope:** Public read-only UI. No content or schema mutations.

## Approved improvements

1. **Compact source buttons:** One small button per development, displaying a source count and a source icon. Clicking opens an accessible non-modal popover with publisher, title, date, source role, original URL, reference and optional excerpt. It closes by outside pointer interaction, Escape or its close button. On small screens the popover sits near the bottom, comfortably sized for touch.
2. **Remove public verification notes:** Editorial `verification_note_ar` stays in the database, but is not rendered on the public reader. Verification class and attribution remain visible.
3. **Restrained semantic colors:** Low-saturation green/blue/amber/purple for fact/position/claim/analysis classification, plus a subtle highlight for quantitative figures. No semantic reclassification or text rewriting.
4. **Single prose executive summary:** Transform the existing summary items into one connected paragraph. Keep the existing texts and references; add brief transition phrases between items. Source citations for the five original entries appear as five compact source buttons below the paragraph.
5. **Mobile-first legibility:** Increase development titles to about 21px and body to 16px on narrow screens; increase metadata and badge sizes; set generous line-height; enlarge source button touch area to 44px. Desktop styles also increase reader text legibility.
6. **Remove duplicative bulky source index:** Replace it with a compact count of unique public sources, because sources remain available directly within their associated developments.

## Code changes

- `src/components/briefing-sources-popover.tsx` (new client-side source disclosure).
- `src/components/briefing-public.tsx` (numeric highlights preserving original text).
- `src/app/briefings/[slug]/page.tsx` (connected summary, source buttons, no verification notes, compact source count).
- `src/app/globals.css` (typography/color/popup/mobile overrides).
- Project memory and changelog updated.

## Data-integrity observations

A user-provided seven-page PDF screenshot seemed to repeat development 03 on multiple printed pages. A read-only query against the published snapshot verified 24 developments, **24 distinct headlines and 24 distinct orders**. Consequently the database does **not** contain the apparent duplicates. Investigate the browser's full-page/PDF capture process separately if the issue persists after UI changes. This UI upgrade does not touch the snapshot.

## Acceptance and validation checklist

- `npm run typecheck` passes.
- `npm run build` passes.
- `/briefings/daily-briefing-2026-11-12` loads 24 unique developments.
- Every development has a compact source trigger; details open via click/touch.
- Outside click, close button and Escape dismiss the popover; links open original source in a new tab.
- No display of `verification_note_ar`.
- Executive summary is one connected prose paragraph rather than separate cards.
- Type colors are restrained and readable (including claim/attributed distinction).
- Phone widths of 360px, 390px and 430px show readable 16px body text, no horizontal overflow, 44px touch targets.
- Source disclosures and page reading are keyboard-accessible.
- Existing archive and other pages remain unaffected.
- Re-capture a full-page/PDF screenshot to check whether apparent repeated third event occurs.

## Windows test commands

```powershell
cd C:\SAS-PLATFORM-DEV
git status --short --branch
git fetch origin
git switch feat/daily-briefing-mobile-visual-v2
git pull --ff-only
npm run typecheck
npm run build
npm run dev
```

Stop if Git reports a conflict; preserve local modifications and stashes. No Vercel deployment or PR merge without approval.


## Review PR

- https://github.com/dinobahkam-wq/SAS_Platform/pull/34
- Status: Draft, open, technically mergeable at last inspection. No actual build or mobile browser test has been executed by the agent.


## 13 نوفمبر 2026 — مراجعة V2.1 بعد صورة PDF المرفقة

اعتمد المستخدم تبسيط العرض مع الإبقاء على سجل التطورات محورًا رئيسيًا:

1. حذف الإشعار الثابت `ⓘ هذا السجل يوثق...` من صفحة العدد (مع عدم حذف بيانات المصدر أو حالة التحقق).
2. إزالة الإطار والخلفية من الملخص التنفيذي؛ يعرض نصًا متصلًا بأسلوب الوثيقة الرسمية وتبقى إحالاته المصغّرة أسفله.
3. حذف العناوين الإنجليزية الزخرفية أعلى عنوان العدد، الملخص، سجل التطورات، وأرشيف الأعداد.
4. زيادة وضوح الفاصل بين التطورات، وتحويل وصلة الأرقام الجانبية إلى سلسلة نقاط عمودية تدل على تسلسل السجل.
5. إضافة تبويبات أعلى المحتوى: `الكل` و`اليمن` و`دولي` و`بيانات رسمية` و`اقتصاد` و`رياضة` و`تغريدات رائجة`.

**دلالة التبويبات:** مرشحات داخل العدد المنشور وليست أقسامًا جديدة ذات بيانات مستقلة. `اليمن` = المحلي/الوطني؛ `دولي` = الإقليمي/الدولي؛ `اقتصاد` = تصنيف الاقتصاد؛ `بيانات رسمية` = مصادر رسمية صريحة أو مواقف صادرة عن جهات حكومية وفق البيانات المتاحة؛ `رياضة` = تصنيف الرياضة إن توفر مستقبلًا؛ `تغريدات رائجة` = مواد ذات روابط أصلية من منصة X/Twitter فقط إن توفرت. لا يوجد تصنيف تلقائي للانتشار أو قياس فعلي للرواج في V2.1؛ لذلك لا يجوز وصف هذه التبويبة بأنها رصد شامل للتغريدات الرائجة. المحتوى الفارغ يُعرض صراحة ولا تُنشأ أمثلة وهمية.

القسم `الكل` هو الافتراضي ويعرض الملخص التنفيذي وجميع التطورات. التبويبات المتخصصة تعرض التطورات المطابقة فقط مع الحفاظ على رقم التطور الأصلي. ولا تغير أي تبويبة سجل النشر أو قاعدة Supabase.

ملف المكوّن التفاعلي الجديد: `src/components/briefing-edition-body.tsx`. بقيت صفحة `src/app/briefings/[slug]/page.tsx` مسؤولة عن جلب البيانات المنشورة والترويسة والمنهجية؛ والمتصفح يدير اختيار التبويب محليًا دون RPC إضافية.

**حالة الاختبار:** مراجعة الكود ومطابقة المقاطع المنفذة فقط؛ لم تُشغّل اختبارات TypeScript والبناء أو اختبار المحمول بعد.

# المراجع وروابط التنفيذ

**اقرأ الوثيقة المرجعية من الفرع الذي يحتويها.** فروع الميزات مفتوحة فوق `main`، لذلك قد لا يتوفر كل ما يلي على `main` بعد.

## مصدر الكود والقرارات

- [المستودع الرئيسي](https://github.com/dinobahkam-wq/SAS_Platform)
- [كل طلبات الدمج](https://github.com/dinobahkam-wq/SAS_Platform/pulls)
- [آخر حزمة تثبيت PR #7](https://github.com/dinobahkam-wq/SAS_Platform/pull/7)
- [الواجهة التحريرية العامة PR #6](https://github.com/dinobahkam-wq/SAS_Platform/pull/6)
- [النظام B PR #5](https://github.com/dinobahkam-wq/SAS_Platform/pull/5)

## الوثائق الهندسية والتصميمية الموجودة في فروع التنفيذ

- `docs/editorial-database-design.md`: النموذج التحريري الموحد، جدول `content_items`، صلاحيات النشر.
- `docs/development-workflow.md`: تطوير GitHub وSupabase CLI والمراجعة.
- `docs/brand-typography-ab-review.md`: المقارنة التاريخية A/B؛ بعض النسخ السابقة لا تسجل قرار اعتماد B النهائي.
- `docs/brand-system-b-adoption-v1.md`: المرجع النهائي لاعتماد الطباعية وتوزيع الأوزان.
- `docs/public-editorial-experience-v1.md`: المسارات العامة وربطها بالمحتوى.
- `docs/public-editorial-stability-v1.md`: تفاصيل إصلاحات Package 01 والتحقق المطلوب.

## ملفات التنفيذ الأساسية

- `src/app/globals.css`: ملفات الخطوط، الدلالات الطباعية، الواجهة العامة والإدارة.
- `src/app/page.tsx`: الصفحة الرئيسية.
- `src/app/news/page.tsx`، `analysis/page.tsx`، `research/page.tsx`، `media/page.tsx`: أقسام التحرير.
- `src/app/content/[slug]/page.tsx`: صفحة المادة.
- `src/components/public-site.tsx`، `section-landing.tsx`: المكونات العامة.
- `src/lib/public-content.ts`: القراءة العامة من Supabase.
- `src/app/admin/content/actions.ts`: حفظ ونشر مواد غرفة التحرير.
- `supabase/migrations/`: ملفات مخطط قاعدة البيانات والصلاحيات.
- `public/brand/`: ملفات شعار ساس.
- `public/fonts/`: الخطوط المثبتة — **وجودها لا يثبت ترخيص استخدامها العام**.

## قاعدة الاستعادة

ابدأ بهذا الدليل، ثم افتح ملفات Github الحالية حسب روابطها، ولا تستنتج وجود الملف على `main` لمجرد وروده هنا. عند اختلاف GitHub الفعلي مع هذه الصفحات، اذكر الاختلاف وحدّث الوثائق في فرع الحزمة.


---

## تحديث المراجع — 12 نوفمبر 2026

### أحدث سلسلة واجهة ومحرر

- [PR #15 — بطاقات الأخبار والنافذة المنبثقة ورأس الهاتف](https://github.com/dinobahkam-wq/SAS_Platform/pull/15)
- [PR #16 — نظام الخطين Tajarib + Thmanyah Sans](https://github.com/dinobahkam-wq/SAS_Platform/pull/16)
- [PR #17 — غرفة التحرير البنيوية v2](https://github.com/dinobahkam-wq/SAS_Platform/pull/17)
- [PR #18 — هرم الصفحة الرئيسية التحريري v2](https://github.com/dinobahkam-wq/SAS_Platform/pull/18)
- [الفرع الحالي للصفحة الرئيسية](https://github.com/dinobahkam-wq/SAS_Platform/tree/feat/public-homepage-editorial-v2)
- [توثيق تنفيذ الصفحة الرئيسية v2 داخل فرع PR #18](https://github.com/dinobahkam-wq/SAS_Platform/blob/feat/public-homepage-editorial-v2/docs/project-memory/PUBLIC_HOMEPAGE_EDITORIAL_V2_2026-11-12.md)
- [توثيق نظام الخطين داخل سلسلة التطوير](https://github.com/dinobahkam-wq/SAS_Platform/blob/feat/public-homepage-editorial-v2/docs/project-memory/ARABIC_TWO_FONT_SYSTEM_2026-11-11.md)

### ملفات مهمة في أحدث الواجهة

- `src/app/page.tsx`: تركيب الصفحة الرئيسية واختيار الخبر الرئيسي والمواد المساندة.
- `src/components/homepage-lead.tsx`: مكون الخبر الرئيسي والمواد المساندة.
- `src/components/editorial-rail.tsx`: صفوف المواد الأفقية والنافذة التفصيلية.
- `src/app/globals.css`: قواعد الخطوط والبطاقات والصفوف والنافذة والواجهة المتجاوبة.
- `src/components/content-form.tsx` و`src/app/admin/content/actions.ts`: محرر المادة وحفظ بنية المتن.
- `docs/project-memory/HOMEPAGE_HERO_VISUAL_DIRECTION_2026-11-12.md`: مواصفات صورة الهوية الثابتة؛ التنفيذ ما زال معلقًا إلى حين التحقق من مسار الصورة.

### حالة الذاكرة بين الفروع

- ملفات الذاكرة التنفيذية الأساسية موجودة في `main` منذ PR #8، عند الرأس `c7e6a04bc5623457889cbbd9c8563ce05d900370`.
- سلسلة PR #15–#18 متتابعة فوق فروع ميزات أقدم، ولا تفترض أن كل وثائق `main` انتقلت تلقائيًا إلى فرع PR #18.
- عند بدء محادثة جديدة، اقرأ ملفات الذاكرة من `main` أو أحدث PR توثيق مدمج، ثم اقرأ وثائق التنفيذ من فرع PR #18، وتحقق من SHA الحالي مباشرة.

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

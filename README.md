> **آخر حالة (13 نوفمبر 2026):** تم توحيد كود المنصة واستوديو الأخبار والإحاطة اليومية وقارئها ونسخة PDF في `main` عبر [PR #41](https://github.com/dinobahkam-wq/SAS_Platform/pull/41). جميع أوصاف الفروع غير المدمجة في السجل أسفل هذه الملاحظة **تاريخية**؛ تشغيل Vercel ما زال غير مثبت، واختبار البناء المحلي على رأس main مطلوب.

# SAS Platform

## Project memory / الذاكرة التنفيذية

**ابدأ من هنا في كل جلسة تطوير جديدة:** [الذاكرة التنفيذية الرسمية](docs/project-memory/README.md) و[إرشادات الوكلاء](AGENTS.md).

هذا المستودع هو المصدر المعتمد للكود. تُراجع قرارات المشروع والحالة المثبتة في `docs/project-memory/`؛ وتُتحقق حالة الفروع وطلبات الدمج من GitHub مباشرة. الفروع غير المدمجة لا تُعد جزءًا من `main` تلقائيًا.


SAS Platform is the digital information and research platform for structured political knowledge, events, issues, sources, documents, maps, and editorial products.

## Planned application stack

- **Web application:** Next.js and TypeScript
- **Data platform:** Supabase (PostgreSQL, Auth, Storage, and Edge Functions when required)
- **Deployment:** Vercel
- **Version control:** GitHub

## Engineering principles

1. GitHub is the source of truth for application code and database migration files.
2. Every application database change must be represented by a reviewed, ordered SQL migration under `supabase/migrations/`.
3. The hosted Supabase project is an execution and verification target, not an undocumented schema-authoring source.
4. No migration is considered complete until its application status is reconciled with the remote Supabase migration history.
5. Never commit credentials, access tokens, database passwords, or service-role keys.
6. Keep Supabase-managed schemas (such as `auth`, `storage`, and `realtime`) separate from application-owned schema changes.

## Development workflow

- Work on a feature or maintenance branch; do not develop directly on `main`.
- Pull the branch from GitHub before local work.
- Make code and migration changes together where applicable.
- Test locally before opening a pull request.
- Review the migration files and remote migration history before merging.
- Merge only after code checks and database reconciliation pass.

See [Development Workflow](docs/development-workflow.md) for the operational rules.

## Repository status

**Current development status (12 November 2026):** `main` contains the PR #20 integration baseline and the subsequently uploaded white-background SAS logo. The active integration branch `integration/sas-mainline-2026-11-12` additionally contains the consolidated News Studio from PR #28 and the main-only logo synchronized through PR #29. The News Studio consolidation is not yet merged into `main`. The next development line is `feat/daily-briefing-v1`; it begins with product and handoff documentation only. Read `docs/project-memory/CURRENT_STATE.md` and `docs/daily-briefing-v1.md` before implementation.


## آخر تحديث للذاكرة التنفيذية — 12 نوفمبر 2026

- راجع [الحالة التنفيذية الحالية](docs/project-memory/CURRENT_STATE.md) وسلسلة PR #15–#18 قبل أي تطوير.
- راجع [تسليم استوديو الصور الإخبارية](docs/news-studio-completion-2026-11-12.md) و[مواصفات الإحاطة اليومية V1](docs/daily-briefing-v1.md) قبل بدء المرحلة الجديدة.

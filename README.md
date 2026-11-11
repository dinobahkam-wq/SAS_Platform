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

**Historical main-branch status:** this branch does not yet contain the stacked CMS and public editorial feature PRs. The editorial schema was designed and applied in the active SAS_Platform Supabase project on the development branch, with migrations documented there. For the current implementation state and verification gaps, read `docs/project-memory/CURRENT_STATE.md` and inspect open PRs. Do not mistake this main-branch snapshot for the current feature implementation.

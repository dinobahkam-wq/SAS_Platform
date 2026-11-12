# تسليم واستئناف العمل — الإحاطة اليومية V1

**آخر تحديث:** 12 نوفمبر 2026  
**المستودع:** `dinobahkam-wq/SAS_Platform`  
**المنتج:** SAS Daily Briefing  
**حالة المرحلة:** تصميم وتدقيق معماري مكتملان مبدئيًا؛ التنفيذ البرمجي لم يبدأ.

## 1. نقطة الاستئناف الدقيقة على GitHub

| العنصر | الحالة المتحققة |
|---|---|
| PR #30 — تأسيس الإحاطة اليومية | مفتوح، Draft، غير مدمج |
| فرع PR #30 | `feat/daily-briefing-v1` |
| SHA الحالي لفرع PR #30 عند التحقق | `729738eef6774ccb7d2b56d9bb6be8906287b1bc` |
| PR #31 — تجربة الإحاطة والتدقيق المعماري | مفتوح، Draft، غير مدمج |
| فرع PR #31 | `feat/daily-briefing-experience-v1` |
| SHA الحالي لرأس PR #31 عند التحقق | `5632e01eca6104483c265a6d7505ff2a3fa0d543` |
| Base فرع PR #31 | `feat/daily-briefing-v1` |
| فرع التكامل السابق | `integration/sas-mainline-2026-11-12` |
| SHA المعروف لفرع التكامل بعد PR #29 | `d06f769db0e76cecb2e315dc535c8cc1b9a4ea92` |

روابط:
- [PR #30 — Daily Briefing V1](https://github.com/dinobahkam-wq/SAS_Platform/pull/30)
- [PR #31 — Daily Briefing Experience & Architecture Audit](https://github.com/dinobahkam-wq/SAS_Platform/pull/31)
- [فرع تجربة الإحاطة](https://github.com/dinobahkam-wq/SAS_Platform/tree/feat/daily-briefing-experience-v1)

**تنبيه:** PR #31 مكدس فوق فرع PR #30، وكلاهما Draft. قيمة SHA أعلاه هي لقطة تحقق قبل آخر تحديث توثيقي؛ يجب دائمًا جلب رأس الفرع الحالي من GitHub عند بدء جلسة جديدة. في آخر تحقق كان PR #31 `mergeable=false`، ولا يزال Draft وغير مدمج؛ لا تفترض أن السبب تعارض فعلي قبل إعادة فحص تفاصيل GitHub. لا تدمج أيًا منهما ولا تغيّر قاعدة PR أو تعِد تأسيس الفروع قبل مراجعة المستخدم وفحص الحالة الحية.

## 2. ما أُنجز

في PR #31 أُضيفت:
1. `docs/daily-briefing-experience-v1.md`: مواصفة تجربة المنتج والهوية والمكونات والتفاعلات.
2. `docs/daily-briefing-architecture-audit-v1.md`: تدقيق النموذج القديم ومقارنته بمخطط SAS_Platform.
3. تحديث `docs/project-memory/CURRENT_STATE.md`.
4. تحديث `docs/project-memory/CHANGELOG.md`.

هذه الحزمة توثيقية فقط. لا يوجد تنفيذ React، ولا Migration، ولا تعديل Supabase، ولا تكامل GPT، ولا نشر.

## 3. تعريف المنتج والقرارات المعتمدة مبدئيًا

الإحاطة اليومية منتج تحريري وتحليلي دوري يركز على اليمن وما يرتبط به إقليميًا ودوليًا. ليست تجميع عناوين ولا صفحة أخبار عادية.

مكونات العدد:
- بيانات العدد ونافذة الرصد وآخر تحقق.
- موجز تنفيذي من 3–5 نقاط.
- قراءة تحليلية رئيسية مستهدفة 400–650 كلمة.
- سجل تطورات منظم حسب الموضوع أو الجغرافيا.
- مصادر أصلية مرتبطة بكل معلومة.
- منهجية الاختيار وحدود التغطية.
- أرشيف أعداد وروابط دائمة.

مبادئ التحرير:
- الفصل الصريح بين FACT وPOSITION وCLAIM وANALYSIS.
- التفريق بين وقت وقوع الحدث ووقت نشر المصدر ووقت التحقق.
- لا يتحول الادعاء إلى حقيقة لمجرد أن مصدره رسمي.
- لا تُعرض استنتاجات ساس كأنها وقائع منقولة.
- إظهار المصدر بجوار المعلومة التي يسندها.

مبادئ تجربة المستخدم:
- واجهة عامة نصية رصينة بلا صور إخبارية في V1.
- المصدر عنصر مرئي أساسي وليس حاشية في نهاية الصفحة.
- واجهة عامة للقراءة فقط، بلا محادثة GPT أو أدوات تحرير.
- غرفة تحرير خاصة ومحمية، وفيها مساعد GPT للمحرر فقط.
- مساعد GPT يقترح ويلخص ويقارن؛ لا يعتمد ولا ينشر ولا يكتب فوق النسخة المعتمدة دون مراجعة بشرية.
- العربية وRTL، خطوط Tajarib Taweel للعناوين وThmanyah Sans للمتن والواجهة، والأرقام اللاتينية.

## 4. خلاصة التدقيق المعماري

المخطط الحالي في SAS_Platform يحتوي على:
- `public.content_sources`: مكتبة مصادر موحدة.
- `public.content_source_links`: ربط المصادر بالمواد التحريرية.
- `public.content_items`: مواد منشورة أو مسودات.
- `public.user_roles`: أدوار admin/editor/author، مع سياسات RLS ووظائف صلاحيات.

التوصية المعمارية:
- إعادة استخدام `content_sources` كمكتبة المصادر المرجعية؛ لا ننشئ مكتبة مصادر موازية.
- إنشاء سجل مستقل للتطورات؛ لأن التطور قد يكون واقعة أو موقفًا أو ادعاءً أو تحديثًا، ولا يشترط أن يكون مادة منشورة في `content_items`.
- ربط التطور بمصدر أو أكثر بصورة مستقلة عن ربطه بعدد إحاطة معين.
- العدد يربط مجموعة تطورات ويضيف ترتيب العرض والسياق التحريري الخاص بذلك الإصدار.
- يجب عدم نسخ SQL أو RPCs أو أسماء الجداول من مستودع `dinobahkam-wq/SAS` القديم مباشرة؛ يستخدم كمرجع وظيفي فقط.

الكيانات المرشحة للنقاش والتصميم:
- `briefing_editions`: الأعداد.
- `briefing_developments`: سجل التطورات المستقل.
- `briefing_edition_items`: ربط العدد بالتطور وترتيبه وملاحظته التحريرية.
- `briefing_development_sources`: ربط التطور بمكتبة `content_sources`.
- سجل مراجعات/نسخ غير قابل للتعديل بعد النشر.

هذه أسماء أولية وليست قرارًا نهائيًا. يجب إعداد ERD ومراجعة القيود والفهارس والعلاقات قبل كتابة Migration.

## 5. قرارات لم تُحسم بعد — لا تفترضها

1. حقول التطور النهائية: نوع المعرفة، الحالة، التصنيف الموضوعي والجغرافي، توقيت الوقوع ودقته، درجة التحقق، وحقول الإسناد.
2. هل نضيف إلى `content_sources` حقل `published_at timestamptz` لوقت النشر الدقيق؟ لا نغيّر معنى `publication_date date` الحالي.
3. علاقة التطور بالحدث والقضية في نظام المعرفة الأوسع مستقبلًا، دون بناء نظام الملفات والقضايا الكامل في هذه الحزمة.
4. مصفوفة الأدوار: من ينشئ ويحرر ويراجع ويعتمد وينشر؟ لا تفترض أن `author` يملك الاعتماد أو النشر.
5. دورة الحالة النهائية: draft → in_review → approved → published → archived، أو تبسيطها وفق نظام الأدوار الموجود.
6. سياسة تصحيح عدد منشور: لا تعديل صامت؛ يجب حفظ النسخة السابقة وإظهار إشعار/سجل تصحيح.
7. هل القراءة العامة عبر View آمنة أم RPC عامة محدودة؟ يجب مراجعة grants وRLS وSECURITY DEFINER وsearch_path.

## 6. الخطة التنفيذية المقترحة

### Package 1 — Data Model & Security Design
- إعادة قراءة مخطط قاعدة البيانات الحالي وكل migrations وسياسات RLS ذات الصلة.
- رسم ERD وعلاقات الكيانات والقيود والفهارس.
- تحديد حالات العدد والتطور، ومصفوفة الصلاحيات.
- تصميم عمليات كتابة ذرية؛ حفظ العدد ووحداته وروابطه يجب أن يكون عملية واحدة لا عمليتين قد تتركان بيانات جزئية.
- تصميم قراءة عامة آمنة للأعداد المنشورة فقط.
- إعداد Migration للمراجعة، دون تطبيقها على Supabase البعيد.

**بوابة اعتماد:** عرض ERD وMigration وسياسات RLS ومناقشتها قبل التطبيق.

### Package 2 — Editorial Workspace Foundation
- صفحات إدارة محمية.
- قائمة الأعداد وحالاتها.
- إنشاء وتحرير مسودة عدد.
- إدارة سجل التطورات ومكتبة المصادر وربطها.
- حفظ ذري وسجل مراجعات.
- معاينة عامة مطابقة للنسخة المنشورة دون كشف المسودات.

### Package 3 — Review, Approval & Publishing
- مراجعة العدد والتحقق من اكتمال المصادر.
- اعتماد بشري صريح.
- نشر مضبوط بصلاحيات قاعدة البيانات.
- أرشفة الأعداد.
- تصحيح وإصدار نسخ دون محو الأثر السابق.
- اختبارات سلبية للصلاحيات والوصول العام.

### Package 4 — Public Briefing & Archive
- صفحة العدد.
- الموجز التنفيذي والقراءة الرئيسية وسجل التطورات.
- بطاقات المصادر وتفاصيل المصدر والمقتطفات.
- المنهجية وحدود التغطية.
- أرشيف الأعداد والروابط الدائمة.
- اختبار RTL والاستجابة على 360/390/768/1440px.

### Package 5 — Editorial GPT Assistant
- مساعد خاص بالمحرر داخل غرفة التحرير.
- تلخيص المصادر ومقارنة البيانات واستخراج الاقتباسات وتصنيف المعلومة وصياغة مسودات.
- إظهار المصدر الذي استند إليه كل اقتراح.
- لا اختلاق روابط أو اقتباسات، ولا تحويل الادعاء إلى حقيقة.
- كل مخرجاته مقترحات قابلة للقبول والرفض.
- قبل التكامل، تحديد مزود النموذج وسياسة الخصوصية وتكلفة التشغيل وحدود البيانات؛ لا إرسال مفاتيح أو أسرار أو بيانات غير لازمة.

### Package 6 — QA & Release
- TypeScript وBuild واختبارات الوظائف والصلاحيات.
- اختبار حالات المسودات والمراجعة والاعتماد والنشر والتصحيح.
- مراجعة أمنية ومرئية.
- تجربة محلية من المستخدم على Windows.
- دمج ونشر فقط بعد موافقة صريحة.

## 7. تعليمات بيئة Windows

المجلد المحلي المعروف: `C:\SAS-PLATFORM-DEV`.

قبل أي انتقال أو سحب:
```powershell
cd C:\SAS-PLATFORM-DEV
git status --short --branch
git fetch origin
```

- افحص التعديلات المحلية قبل الانتقال.
- آخر ذاكرة موثقة تشير إلى تعديل محلي في `next-env.d.ts` وStash سابق باسم `preserve next-env local change`؛ لا تحذف أو تستعد أو تدمج هذا التعديل أو أي Stash تلقائيًا.
- لا تستخدم `reset --hard` أو `clean -fd` أو إعادة تأسيس الفروع عشوائيًا.
- طابق فرع GitHub الحالي مع Worktree مراجعة آمن بعد التحقق من حالته.
- لا تضع `.env.local` أو مفاتيح Supabase أو أسرارًا في GitHub أو وثائق المشروع.
- GitHub هو مصدر الحقيقة؛ البيئة المحلية للتحقق والاختبار.

## 8. بوابات الأمان وعدم التنفيذ دون موافقة

- لا تعديل مباشر على `main`.
- لا دمج PR #30 أو #31 دون موافقة المستخدم.
- لا Migration على Supabase البعيد دون عرض وموافقة.
- لا نشر Vercel دون موافقة.
- لا نشر عدد إحاطة أو بيانات تجريبية توحي بأنها حقيقية.
- لا استخدام Service Role في المتصفح.
- لا اعتبار فحص الملفات أو وجود الكود دليلًا على نجاح الاختبارات أو النشر.

## 9. تعليمات أول رسالة في المحادثة الجديدة

ابدأ باستعادة السياق من GitHub، لا بسؤال المستخدم عن المعلومات الموجودة هنا:
1. اقرأ `AGENTS.md`.
2. اقرأ `docs/project-memory/README.md` ثم `CURRENT_STATE.md` و`DECISIONS.md` و`WORKFLOW.md` و`CHANGELOG.md`.
3. اقرأ هذه الوثيقة، و`docs/daily-briefing-v1.md`، و`docs/daily-briefing-experience-v1.md`، و`docs/daily-briefing-architecture-audit-v1.md`.
4. افحص الحالة الحية لـ PR #30 وPR #31 ورؤوس الفروع وSHA قبل أي تغيير.
5. ابدأ Package 1: Data Model & Security Design، واعرض ERD ومصفوفة الصلاحيات قبل كتابة Migration أو واجهات.

**النتيجة المطلوبة من الجلسة التالية:** تصميم بيانات وأمن مكتمل قابل للمراجعة، لا واجهة شكلية مبنية فوق نموذج غير محسوم.

---

## 10. تحديث التنفيذ — Package 1

- **فرع الحزمة:** `feat/daily-briefing-data-model-security-v1`.
- **الأصل:** رأس PR #31 المتحقق عند إنشاء الفرع: `8b0da6fb28e7e4a5ef88b0bed7c1b66f4bb6e8ef`.
- **المخرجات:** وثيقة ERD وقاموس الكيانات ومصفوفة الصلاحيات، ومسودة SQL، واستعلامات تحقق محلية.
- **التصميم:** عدد ثابت + نسخ تحريرية مستقلة + سجل تطورات مستقل + مكتبة مصادر مشتركة + Snapshots غير قابلة للتعديل بعد النشر.
- **تحسينات أمنية:** لا وصول anon مباشر للجداول، RLS، انتقالات حالة عبر RPCs، حراسة هوية العدد والنسخة، سجل تدقيق append-only، وتضييق صلاحيات TRUNCATE/REFERENCES/TRIGGER على جداول التحرير الحالية.
- **التحقق:** فحص ساكن للبنية النصية لمسودة SQL فقط؛ لم يُشغّل PostgreSQL محليًا ولم تُختبر Migration على قاعدة محلية بعد.
- **Supabase البعيد:** لا تغييرات، لا Migration مطبقة، ولا بيانات تجريبية.
- **الخطوة التالية:** مراجعة PR الخاص بالحزمة، ثم توليد اسم Migration محليًا عبر `supabase migration new daily_briefing_package1` ونقل المسودة إليه واختبار `supabase db reset` محليًا.
- **PR الحزمة:** [PR #32 — Data Model & Security Design](https://github.com/dinobahkam-wq/SAS_Platform/pull/32)، Draft، غير مدمج، base هو فرع PR #31.
- **الحالة الحية عند آخر فحص:** PR #32 mergeable=true، ahead 13 / behind 0؛ فحص Vercel أظهر failure ولم يُشخّص أو يُنشر.


---

## 12 نوفمبر 2026 — تحديث استئناف Package 1

**الحالة الأحدث:** تصميم البيانات والأمان ومسودة SQL أُعدت على فرع مستقل؛ الاختبار المحلي لم يبدأ بعد.

- **فرع الحزمة:** `feat/daily-briefing-data-model-security-v1`.
- **Base:** رأس PR #31 الذي تم التحقق منه عند إنشاء الفرع: `8b0da6fb28e7e4a5ef88b0bed7c1b66f4bb6e8ef`.
- **PR #31:** مفتوح Draft وغير مدمج؛ لا تغيّر base ولا تدمجه ضمن هذه الخطوة.
- **الملفات:**
  1. `docs/daily-briefing-data-model-security-v1.md`
  2. `docs/sql/daily_briefing_package1.draft.sql`
  3. `docs/sql/daily_briefing_package1_verification.sql`
  4. تحديثات ذاكرة المشروع.
- **قاعدة البيانات:** استعلامات فحص metadata وgrants تمت للقراءة فقط. لم يتم تشغيل `apply_migration` ولم يتم تنفيذ أي DDL/DML على المشروع البعيد.
- **فحص SQL:** توازن الاقتباسات والأقواس وعلامات dollar-quote سليم في الفحص النصي. هذا لا يعادل parser PostgreSQL.
- **الخطوة المحلية المطلوبة على Windows:**
  ```powershell
  cd C:\SAS-PLATFORM-DEV
  git status --short --branch
  git fetch origin
  git switch feat/daily-briefing-data-model-security-v1
  git pull --ff-only
  supabase migration new daily_briefing_package1
  ```
  انسخ محتوى ملف `docs/sql/daily_briefing_package1.draft.sql` إلى Migration التي أنشأها CLI، ثم شغّل `supabase start` و`supabase db reset` محليًا. لا تستخدم `--remote` أو `supabase db push`.
- بعد نجاح التطبيق المحلي، نفّذ `docs/sql/daily_briefing_package1_verification.sql` واختبارات السلوك اليدوية، ثم `npm run typecheck` و`npm run build` إذا أُضيف كود واجهة.
- **ملاحظة تقنية:** المسودة لا تزال بحاجة إلى اختبار parser فعلي. لا تعتبرها Migration مكتملة ولا تطبقها على Supabase البعيد قبل المراجعة والموافقة الصريحة.


### PR #32 — آخر نقطة تحقق

- [PR #32 — Daily Briefing Package 1: Data Model & Security](https://github.com/dinobahkam-wq/SAS_Platform/pull/32): مفتوح Draft وغير مدمج.
- Base: `feat/daily-briefing-experience-v1` (PR #31)، وHead: `feat/daily-briefing-data-model-security-v1`.
- GitHub أفاد `mergeable=true`؛ لا يعني ذلك أن SQL اختُبر أو أن PR جاهز للدمج.
- فحص Vercel فشل بسبب `build-rate-limit`، لا بسبب خطأ بناء مثبت. لا يوجد نجاح Build مثبت.
- المسودة تشمل 7 جداول و23 سياسة RLS و18 Trigger و18 دالة؛ فحص lexical ناجح فقط.
- **الخطوة الفعلية التالية:** سحب الفرع على جهاز Windows وتشغيل Migration محليًا بواسطة Supabase CLI. إذا ظهر خطأ parser أو RLS، أصلح المسودة على الفرع ثم أعد الاختبار. لا تنفذ أي Migration بعيدة أو Merge.


### مراجعة إضافية قبل إنشاء Migration نهائية

أُعيدت مطابقة مسودة SQL مع مخطط وسياسات مكتبة المصادر على Supabase:
- سياسة `content_sources_public_read` الحالية لا تجعل كل المصادر عامة؛ تقصر قراءة anon على المصدر المرتبط بمادة منشورة.
- لذلك أضيف `briefing_development_sources.display_publicly` (افتراضيًا false). Snapshot لا يعرض إلا المصادر التي اختيرت صراحة وكانت نشطة، وبوابة النشر تشترط مصدرًا عامًا صالحًا لكل تطور.
- أزيلت أوامر سحب امتيازات الجداول التحريرية الأساسية من مسودة الحزمة.
- لا تنسخ المسودة القديمة إلى Migration المحلية؛ حدّث فرع Git أولًا قبل نسخ النسخة المنقحة.


---

## 13 نوفمبر 2026 — Package 1 production checkpoint

Migration `20261112211738_daily_briefing_package1` has been applied successfully to the production Supabase project `budsfbyrdpjkobqstpyr`.

### Verified
- Seven briefing tables exist; RLS is enabled on all seven.
- 23 RLS policies are present.
- `anon` has no direct SELECT privilege on briefing tables.
- Authenticated users can SELECT audit events but cannot INSERT/UPDATE/DELETE them.
- Public archive RPC returns an empty array; unknown edition slug returns null.
- `display_publicly` defaults to false; published source snapshots only include explicitly public active sources.
- No sample/test records were inserted; briefing tables remain empty.
- Source registry rows are protected from mutation while used by revisions in review/approved.

### Advisor observations
- Two SECURITY DEFINER warnings correspond to intentional public read-only RPCs.
- Leaked password protection warning is an existing project Auth setting.
- Performance advisor reports 13 unindexed foreign keys (INFO); revisit before substantial data volume. Unused-index notices are expected before usage.

### Local repository synchronization
The developer previously generated an empty untracked migration file:
`supabase/migrations/20261112205516_daily_briefing_package1.sql`.
Keep it; move it outside `supabase/migrations` to a local backup folder before using CLI migration commands. The canonical applied migration is:
`supabase/migrations/20261112211738_daily_briefing_package1.sql`.
Do not delete local `next-env.d.ts` changes.

### Next work
Build the private editorial room against the new schema and RPCs. Test with the real signed-in admin/editor account; do not insert fictional news or publish without explicit editorial approval.


- تم تحديث `src/types/database.types.ts` من مخطط Supabase الإنتاجي بعد تطبيق Package 1. عند سحب الفرع، سيحصل التطبيق على أنواع TypeScript الجديدة لجداول الإحاطة ودوال RPC.


---

## 13 نوفمبر 2026 — Package 3: Public reader checkpoint

- User clarified the intended product: no public/editorial content engine UI is needed for the daily workflow. The user and assistant prepare and update the daily content through the conversation; the public product is a read-only briefing and archive.
- User set the editorial priority: development register first, factual reporting and official positions with source attribution; reduce SAS's own analysis and interpretation.
- Public routes implemented on `feat/daily-briefing-public-experience-v1`: `/briefings` and `/briefings/[slug]`.
- The public pages use only the existing read RPCs and do not expose draft tables or write actions.
- Production currently has no published briefing editions; empty archive response verified.
- Known schema-policy conflict: Package 1 still requires 400–650 words in `analysis_ar`. The public page makes that section collapsed and secondary, but a follow-up migration should make analysis optional or concise. Do not apply it remotely until the user approves the revised policy.
- No local typecheck/build, merge, or Vercel deployment has been performed.


### PR #33 — الواجهة العامة

- https://github.com/dinobahkam-wq/SAS_Platform/pull/33
- Draft / Open / Not merged; آخر commit للكود `a178b8a7782f67fbaa38005f8c279913ea7fce95`, base `feat/daily-briefing-data-model-security-v1`. تلت ذلك تحديثات توثيقية؛ افحص الرأس الحالي من GitHub.
- GitHub reports mergeable=true at last check.
- Vercel status is `build-rate-limit`; no GitHub Actions workflow run was reported. No local typecheck/build or manual deployment yet.

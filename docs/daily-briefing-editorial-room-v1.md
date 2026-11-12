# SAS Daily Briefing V1 — Editorial Room Package

**الحالة:** تنفيذ أولي على فرع مستقل؛ بانتظار اختبار Windows المحلي.  
**الفرع:** `feat/daily-briefing-editorial-room-v1`  
**الأساس:** `feat/daily-briefing-data-model-security-v1`  
**قاعدة البيانات:** Migration Package 1 مطبقة على Supabase الإنتاجي.

## 1. المسارات

- `/briefing-room`: سجل الأعداد التحريرية.
- `/briefing-room/new`: إنشاء عدد يومي أو خاص.
- `/briefing-room/[editionId]`: تحرير النسخة، إنشاء التطورات، إسناد المصادر، إدراج التطورات في الموجز والسجل، وحالات الإرسال/الاعتماد/النشر.
- `/briefing-room/review`: قائمة النسخ قيد المراجعة.

## 2. الوصول والصلاحيات

- أُضيف `requireBriefingStaff` لقبول admin/editor فقط.
- غرفة الإحاطة لها Layout مستقل؛ لا نوسّع `requireAdmin` ولا نخفف حماية صفحات الإدارة القائمة.
- صفحة الدخول توجه admin إلى `/admin` وeditor إلى `/briefing-room`.
- إجراءات الاعتماد والإعادة والنشر تستدعي `requireBriefingAdmin`، وتبقى محمية أيضًا على مستوى RPC/RLS.
- أضيف رابط الإحاطة إلى قائمة المدير.

## 3. مسار التحرير

1. إنشاء عدد: عنوان، تاريخ، نوع، نافذة تغطية، تحليل، منهجية وحدود تغطية.
2. إنشاء التطورات وتصنيف كل معلومة FACT/POSITION/CLAIM/ANALYSIS، وتسجيل درجة التحقق منفصلة.
3. ربط كل تطور بمصدر من مكتبة `content_sources`.
4. اختيار `display_publicly` صراحةً لكل ارتباط مصدر؛ الخيار غير محدد افتراضيًا.
5. التحقق من وجود مصدر عام نشط ذي URL أو مرجع قبل جعل التطور جاهزًا.
6. إدراج التطورات في سجل العدد أو الموجز التنفيذي مع ترتيب وصياغة موجزة.
7. حفظ المسودة ثم إرسالها للمراجعة.
8. المدير يعتمد أو يعيد بملاحظة؛ وبعد الاعتماد ينشر صراحة.
9. التصحيح بعد النشر ينشئ نسخة مستقلة عبر RPC ويحافظ على Snapshot المنشور.

## 4. الملفات الرئيسية

- `src/lib/briefing-auth.ts`
- `src/components/briefing-shell.tsx`
- `src/app/briefing-room/layout.tsx`
- `src/app/briefing-room/page.tsx`
- `src/app/briefing-room/new/page.tsx`
- `src/app/briefing-room/[editionId]/page.tsx`
- `src/app/briefing-room/review/page.tsx`
- `src/app/briefing-room/actions.ts`
- تحديثات `src/app/login` و`src/components/admin-shell.tsx` و`src/app/globals.css`.

## 5. ما لم يُنفذ في هذه الحزمة

- لا واجهة عامة لقراءة العدد أو الأرشيف؛ هذه حزمة لاحقة.
- لا مساعد GPT للمحرر.
- لا تحرير متقدم للتطور بعد تسجيله في هذه النسخة الأولية؛ يمكن ربطه لاحقًا بنموذج تحرير مخصص.
- لا أرشفة/سحب من الواجهة بعد.
- لا محتوى تجريبي ولا أخبار مختلقة.
- لم يُنفذ TypeScript/build محليًا؛ يجب التحقق على Windows قبل فتح PR أو أي نشر.

## 6. اختبار Windows المطلوب

بعد حفظ أي تغييرات محلية، انقل ملف Migration الفارغ القديم الذي أنشأه CLI خارج مجلد migrations مع الاحتفاظ به، ثم:

```powershell
cd C:\SAS-PLATFORM-DEV
git fetch origin
git switch feat/daily-briefing-editorial-room-v1
git pull --ff-only
npm run typecheck
npm run build
npm run dev
```

ثم سجّل الدخول بحساب admin حقيقي وافتح `http://localhost:3000/briefing-room`. اختبر إنشاء مسودة فعلية بمعلومات تحريرية حقيقية فقط، وإضافة تطور ومصدر، ثم إرسال ومراجعة واعتماد. لا تنشر أول عدد إلا بعد مراجعة المحتوى والمصادر. لا تستخدم بيانات وهمية.

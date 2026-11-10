import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export const metadata = {
  title: "اختبار المنتجات التحريرية | منصة ساس",
  description: "اختبار النظام الطباعي B على الخبر العاجل ومقال الرأي وغلاف الدراسة الاستراتيجية.",
  robots: { index: false, follow: false },
};

function SpecimenLabel({ children }: { children: React.ReactNode }) {
  return <div className="product-specimen-label">{children}</div>;
}

export default function EditorialProductSpecimensPage() {
  return (
    <main className="product-specimens">
      <header className="public-header">
        <div className="public-header-inner product-specimens-header">
          <Link href="/" className="public-brand" aria-label="منصة ساس">
            <BrandLogo variant="full" priority />
          </Link>
          <Link href="/brand-preview/editorial-ab" className="public-login-link">العودة إلى مقارنة النظامين</Link>
        </div>
      </header>

      <section className="product-specimens-intro">
        <span className="eyebrow">ساس · اختبار المنتجات التحريرية</span>
        <h1>اختبار النظام الثاني على المنتجات التحريرية</h1>
        <p>ثلاث بيئات استخدام مختلفة لاختبار توزيع الخطوط: خبر عاجل سريع الالتقاط، ومقال رأي طويل القراءة، وغلاف دراسة استراتيجية. هذه نماذج تصميمية داخلية.</p>
        <div className="product-specimens-legend">
          <span>العنوان الرئيسي: تجاريب طويل · 900</span>
          <span>عنوان المقال: ثمانية سيريف ديسبلاي · 700</span>
          <span>العنوان الفرعي الرئيسي: ثمانية سيريف ديسبلاي · 500</span>
          <span>العنوان الثانوي: تجاريب طويل · 500</span>
          <span>النصوص: ثمانية سانس · 400</span>
        </div>
      </section>

      <div className="product-specimens-content">
        <section className="product-specimen-block">
          <header className="product-specimen-block-head">
            <div><SpecimenLabel>01 · الخبر العاجل</SpecimenLabel><h2>الخبر العاجل</h2></div>
            <span>اختبار السرعة والوضوح وكثافة المعلومات</span>
          </header>
          <article className="breaking-news-card">
            <div className="breaking-news-topline">
              <span className="breaking-news-status"><i /> عاجل</span>
              <span>اليمن · نموذج تحريري</span><span>10 نوفمبر 2026 · 20:45</span>
            </div>
            <div className="breaking-news-body">
              <div className="breaking-news-copy">
                <span className="product-kicker">تطورات سياسية · متابعة مستمرة</span>
                <h3>اجتماع مرتقب يناقش مستجدات المسار السياسي وترتيبات المرحلة المقبلة</h3>
                <p>نموذج خبر عاجل لاختبار قراءة العنوان من النظرة الأولى، ثم الانتقال إلى خلاصة قصيرة ومعلومات المصدر والتوقيت دون ازدحام بصري.</p>
                <div className="breaking-news-meta"><span>المصدر: نموذج افتراضي</span><span>آخر تحديث: 20:45</span><span>متابعة ساس</span></div>
              </div>
              <aside className="breaking-news-side"><span className="breaking-side-index">تحديث مباشر</span><strong>تحديث مستمر</strong><p>تُضاف التطورات اللاحقة في سجل زمني مرتبط بالخبر الأصلي.</p></aside>
            </div>
            <div className="breaking-news-footer"><span>الخبر العاجل · نموذج تصميمي غير منشور</span><span>ساس / الأخبار والشؤون الجارية</span></div>
          </article>
          <p className="product-specimen-caption">ملاحظة الاختبار: تجاريب الأسود يثبت نقطة الدخول البصرية، بينما تبقى تفاصيل المصدر والتوقيت والنص التفسيري على ثمانية سانس لتسريع المسح.</p>
        </section>

        <section className="product-specimen-block">
          <header className="product-specimen-block-head">
            <div><SpecimenLabel>02 · مقال الرأي والتحليل</SpecimenLabel><h2>مقال الرأي والتحليل</h2></div>
            <span>اختبار القراءة المتواصلة والتدرج بين العناوين</span>
          </header>
          <article className="opinion-layout">
            <div className="opinion-main">
              <header className="opinion-header">
                <span className="product-kicker">تحليل ورأي · اليمن</span>
                <h3>الدولة قبل التسوية: سؤال بناء القدرة الوطنية</h3>
                <p className="opinion-deck">لا تُقاس التسوية السياسية بقدرتها على إيقاف المواجهة فحسب، بل بقدرتها على إعادة بناء المؤسسات التي تجعل الاتفاق قابلًا للتنفيذ والاستمرار.</p>
                <div className="opinion-byline"><span>منصة ساس · قسم التحليل والرأي</span><span>زمن القراءة: 6 دقائق</span><span>نموذج تحريري</span></div>
              </header>
              <div className="opinion-body">
                <p>لا تبدأ معالجة الأزمات الوطنية من لحظة توقيع الاتفاقات، بل من تحديد البنية المؤسسية القادرة على تحويل التفاهمات السياسية إلى قواعد نافذة وممارسات مستقرة. ومن دون هذه القدرة، تتحول التسوية إلى ترتيب مؤقت لإدارة التوازنات، لا إلى مدخل لاستعادة الدولة.</p>
                <h4>من الاتفاق السياسي إلى القدرة المؤسسية</h4>
                <p>يتطلب الانتقال من التسوية إلى الاستقرار وجود مؤسسات عامة موحدة، وسلسلة واضحة للمسؤولية، واحتكار قانوني ومنظم لأدوات الإكراه، إلى جانب قدرة إدارية ومالية تضمن استمرار الخدمات العامة وإنفاذ القرارات.</p>
                <h5>المؤسسات بوصفها شرطًا للاستدامة</h5>
                <p>عندما تتعدد مراكز القرار والتنفيذ، تصبح الالتزامات عرضة للتعطيل أو الانتقائية. لذلك ينبغي أن تتجه المعالجة إلى إعادة بناء الوظائف العامة وربطها بمسؤوليات محددة وآليات رقابة ومساءلة قابلة للتحقق.</p>
                <blockquote>الاختبار الحقيقي لأي تسوية ليس ما تتضمنه وثيقتها، بل ما تستطيع مؤسسات الدولة تنفيذه بعد توقيعها.</blockquote>
                <p>هذا النص نموذج لاختبار طول الفقرات وتتابع العناوين، وليس مادة منشورة أو موقفًا تحريريًا نهائيًا.</p>
              </div>
            </div>
            <aside className="opinion-aside">
              <div className="opinion-aside-card"><SpecimenLabel>بيانات المادة</SpecimenLabel><h4>بيانات المادة</h4><dl><div><dt>القسم</dt><dd>التحليل والرأي</dd></div><div><dt>الموضوع</dt><dd>بناء الدولة</dd></div><div><dt>الحالة</dt><dd>نموذج تصميمي</dd></div></dl></div>
              <div className="opinion-aside-card"><SpecimenLabel>في هذا المقال</SpecimenLabel><h4>في هذا المقال</h4><ul><li>من الاتفاق السياسي إلى القدرة المؤسسية</li><li>المؤسسات بوصفها شرطًا للاستدامة</li></ul></div>
            </aside>
          </article>
          <p className="product-specimen-caption">ملاحظة الاختبار: السيريف مخصص لعنوان المقال والعنوان الفرعي الأول، ويعود العنوان الفرعي الثاني إلى تجاريب لخلق إيقاع طباعي واضح دون إدخال عائلة ثالثة في النصوص.</p>
        </section>

        <section className="product-specimen-block">
          <header className="product-specimen-block-head">
            <div><SpecimenLabel>03 · غلاف الدراسة الاستراتيجية</SpecimenLabel><h2>غلاف الدراسة الاستراتيجية</h2></div>
            <span>اختبار الحضور المؤسسي والعنوان متعدد الأسطر</span>
          </header>
          <article className="research-cover-stage">
            <div className="research-cover-sheet">
              <div className="research-cover-top"><BrandLogo variant="full" /><span>دراسات استراتيجية · ورقة بحثية</span></div>
              <div className="research-cover-rule" />
              <div className="research-cover-content">
                <span className="research-cover-kicker">منصة ساس · الإعلام والدراسات</span>
                <h3>تحولات البيئة الإقليمية وأثرها في مسارات الأزمة اليمنية</h3>
                <p className="research-cover-summary">قراءة استراتيجية في اتجاهات التنافس الإقليمي وانعكاساتها على بنية الدولة اليمنية، ومحددات الأمن والاستقرار، ومسارات التسوية.</p>
              </div>
              <div className="research-cover-bottom">
                <div><span>إعداد</span><strong>وحدة الدراسات والأبحاث</strong></div>
                <div><span>النطاق</span><strong>اليمن والمحيط الإقليمي</strong></div>
                <div><span>التصنيف</span><strong>دراسة استراتيجية</strong></div>
                <div><span>التاريخ</span><strong>نموذج تصميمي · 2026</strong></div>
              </div>
              <div className="research-cover-footer"><span>منصة ساس للإعلام والدراسات</span><span>01</span></div>
            </div>
            <aside className="research-cover-notes">
              <SpecimenLabel>التسلسل الطباعي</SpecimenLabel><h4>توزيع الخطوط</h4>
              <ul><li><strong>عنوان الغلاف</strong><span>تجاريب طويل · 900</span></li><li><strong>العنوان التعريفي</strong><span>ثمانية سيريف ديسبلاي · 500</span></li><li><strong>الملخص والبيانات</strong><span>ثمانية سانس · 400</span></li></ul>
              <p>صُمم الغلاف ليعمل مطبوعًا ورقميًا، مع مساحة بيضاء كافية وتدرج واضح بين العنوان والبيانات المؤسسية.</p>
            </aside>
          </article>
          <p className="product-specimen-caption">ملاحظة الاختبار: العنوان البحثي الكبير يعود إلى تجاريب 900، حتى لا يفقد الغلاف صلته البصرية بهوية ساس عند استخدام السيريف في المقالات.</p>
        </section>
      </div>
      <aside className="product-specimens-note">هذه صفحة معاينة داخلية غير منشورة. جميع الأخبار والعناوين والبيانات أمثلة تصميمية، ولا تمثل وقائع أو مواد بحثية معتمدة. لم يتغير النظام الطباعي في صفحات الموقع العامة.</aside>
    </main>
  );
}

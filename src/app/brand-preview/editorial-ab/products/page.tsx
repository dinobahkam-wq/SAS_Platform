import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export const metadata = {
  title: "اختبار المنتجات التحريرية | منصة ساس",
  description: "اختبار النظام الطباعي B على الخبر العاجل والمقال التحليلي وغلاف الدراسة الاستراتيجية.",
  robots: { index: false, follow: false },
};

export default function EditorialProductsSpecimenPage() {
  return (
    <main className="products-specimen">
      <header className="public-header">
        <div className="public-header-inner products-header">
          <Link href="/" className="public-brand" aria-label="منصة ساس"><BrandLogo variant="full" priority /></Link>
          <Link href="/brand-preview/editorial-ab" className="public-login-link">العودة إلى مقارنة A وB</Link>
        </div>
      </header>
      <section className="products-intro">
        <span className="eyebrow">SAS · EDITORIAL PRODUCTS · SYSTEM B</span>
        <h1>اختبار النظام الطباعي في المنتجات التحريرية</h1>
        <p>اختبار تطبيقي لتوزيع عائلات الخطوط وأوزانها على ثلاثة منتجات مختلفة: الخبر العاجل، والمقال التحليلي، وغلاف الدراسة الاستراتيجية. ثُبّتت القواعد الطباعية في المنتجات الثلاثة لاختبار اتساق الهوية ومرونتها.</p>
        <div className="products-legend">
          <span>تجاريب طويل · 900 — العنوان الرئيسي</span><span>ثمانية Serif Display · 700 — عنوان المنتج</span><span>ثمانية Serif Display · 500 — العنوان الداخلي الرئيسي</span><span>تجاريب طويل · 500 — العنوان الداخلي الثانوي</span><span>ثمانية Sans · 400 — النصوص والبيانات</span>
        </div>
      </section>
      <div className="products-content">
        <section className="product-panel" aria-labelledby="news-specimen-title">
          <header className="product-panel-heading"><div><span className="product-index">01 / NEWS ALERT</span><h2 id="news-specimen-title">نموذج الخبر العاجل</h2></div><span className="product-type">الأخبار والشؤون الجارية</span></header>
          <article className="news-specimen">
            <div className="news-topline"><span className="news-breaking-label">عاجل</span><span>نموذج تحريري · عنوان افتراضي للاختبار</span></div>
            <div className="news-category">اليمن <span>—</span> الخدمات العامة</div>
            <h3 className="news-headline">قرار جديد يعيد ملف الخدمات إلى صدارة المشهد السياسي</h3>
            <p className="news-summary">نموذج لاختبار العنوان العاجل والمقدمة الخبرية، وقياس وضوح القراءة وسرعة التقاط المعلومة عند اختلاف طول العنوان على الشاشات.</p>
            <div className="news-source-row"><span>المصدر: اسم الجهة أو البيان الرسمي</span><span>وقت النشر: يحدد عند النشر</span><span>تحديث: نموذج تجريبي</span></div>
            <div className="news-followup"><strong>في هذا التطور</strong><p>مساحة موجزة لإضافة خلفية موثقة أو إحالة إلى التطور السابق، دون تحويل البطاقة العاجلة إلى مادة تحليلية مطولة.</p><span className="news-followup-link">متابعة التطورات المرتبطة ←</span></div>
          </article>
          <div className="product-typography-note">العنوان: تجاريب 900 · التصنيف والتوقيت والمصدر: ثمانية Sans 400</div>
        </section>
        <section className="product-panel" aria-labelledby="opinion-specimen-title">
          <header className="product-panel-heading"><div><span className="product-index">02 / OPINION ARTICLE</span><h2 id="opinion-specimen-title">نموذج المقال التحليلي</h2></div><span className="product-type">التحليل والرأي</span></header>
          <div className="opinion-layout">
            <article className="opinion-article">
              <header className="opinion-header">
                <div className="opinion-kicker">تحليل سياسي <span>·</span> اليمن</div>
                <h3 className="opinion-title">الدولة قبل التسوية: لماذا لا يكفي الاتفاق السياسي لإنهاء الأزمة؟</h3>
                <p className="opinion-deck">لا تُقاس التسوية بقدرتها على إيقاف المواجهة فحسب، بل بقدرتها على إعادة بناء المؤسسات التي تجعل الاتفاق قابلًا للتنفيذ والاستمرار.</p>
                <div className="opinion-meta"><span>قسم التحليل والرأي</span><span>زمن القراءة: 6 دقائق</span><span>مادة تجريبية</span></div>
              </header>
              <div className="opinion-body">
                <p>لا تبدأ معالجة الأزمات الوطنية من لحظة توقيع الاتفاقات، بل من تحديد البنية المؤسسية القادرة على تحويل التفاهمات السياسية إلى قواعد نافذة وممارسات مستقرة. ومن دون هذه القدرة، تتحول التسوية إلى ترتيب مؤقت لإدارة التوازنات، لا إلى مدخل لاستعادة الدولة.</p>
                <h4>من الاتفاق السياسي إلى القدرة المؤسسية</h4>
                <p>يتطلب الانتقال من التسوية إلى الاستقرار وجود مؤسسات عامة موحدة، وسلسلة واضحة للمسؤولية، واحتكار قانوني ومنظم لأدوات الإكراه، إلى جانب قدرة إدارية ومالية تضمن استمرار الخدمات العامة وإنفاذ القرارات.</p>
                <h5>اختبار القدرة على التنفيذ</h5>
                <p>لا تكفي صياغة الالتزامات السياسية ما لم ترتبط بجهات تنفيذ محددة، وموارد قابلة للتعبئة، وآليات رقابة ومساءلة تستطيع قياس التقدم وكشف التعثر.</p>
                <blockquote>الاختبار الحقيقي لأي تسوية ليس ما تتضمنه وثيقتها، بل ما تستطيع مؤسسات الدولة تنفيذه بعد توقيعها.</blockquote>
              </div>
            </article>
            <aside className="opinion-aside">
              <section className="opinion-aside-card"><span>بيانات المادة</span><strong>نوع المحتوى: مقال تحليلي</strong><strong>الموضوع: بناء الدولة</strong><strong>القسم: التحليل والرأي</strong></section>
              <section className="opinion-aside-card opinion-aside-highlight"><span>في هذا المقال</span><p>الانتقال من الاتفاق السياسي إلى القدرة المؤسسية، وشروط تحويل الالتزامات إلى نتائج قابلة للتحقق.</p></section>
            </aside>
          </div>
          <div className="product-typography-note">عنوان المقال: ثمانية Serif Display 700 · العنوان الداخلي الرئيسي: Serif 500 · الثانوي: تجاريب 500 · المتن: Sans 400</div>
        </section>
        <section className="product-panel" aria-labelledby="research-specimen-title">
          <header className="product-panel-heading"><div><span className="product-index">03 / STRATEGIC RESEARCH REPORT</span><h2 id="research-specimen-title">نموذج غلاف الدراسة الاستراتيجية</h2></div><span className="product-type">الدراسات والأبحاث</span></header>
          <div className="research-specimen">
            <div className="research-cover">
              <div className="research-cover-top"><span className="research-brand-line">منصة ساس · دراسات وأبحاث</span><span className="research-series">ورقة استراتيجية</span></div>
              <div className="research-cover-content"><span className="research-kicker">اليمن والمحيط الإقليمي</span><h3 className="research-title">تحولات البيئة الإقليمية وأثرها في مسارات الأزمة اليمنية</h3><p className="research-deck">قراءة استراتيجية في اتجاهات التنافس الإقليمي وانعكاساتها على بنية الدولة والأمن والاستقرار، والخيارات المتاحة أمام الفاعلين.</p></div>
              <div className="research-cover-meta"><div><span>نوع المنتج</span><strong>تقرير استراتيجي</strong></div><div><span>النطاق</span><strong>اليمن والمحيط الإقليمي</strong></div><div><span>الإصدار</span><strong>نموذج تصميمي</strong></div></div>
              <div className="research-cover-footer"><span>SAS MEDIA AND STUDIES PLATFORM</span><span>01 / RESEARCH SERIES</span></div>
            </div>
            <div className="research-inside">
              <section className="research-executive"><span className="research-section-label">داخل التقرير · نموذج للصفحة الافتتاحية</span><h4>الملخص التنفيذي</h4><p>يدرس التقرير أثر التحولات في البيئة الإقليمية على مسارات الأزمة اليمنية، مع التركيز على تفاعل المصالح الأمنية والسياسية وانعكاسها على مؤسسات الدولة وفرص التسوية. ويعرض المسارات المحتملة ومحددات كل مسار وتداعياته على الاستقرار.</p><h5>السؤال الاستراتيجي</h5><p>كيف تؤثر إعادة تشكيل التوازنات الإقليمية في فرص استعادة الدولة اليمنية، وما الشروط المؤسسية والسياسية اللازمة لتحويل التحولات الخارجية إلى قدرة وطنية مستدامة؟</p></section>
              <aside className="research-outline"><span className="research-section-label">بنية التقرير</span><ol><li>تحولات البيئة الإقليمية</li><li>انعكاسات التنافس على اليمن</li><li>مسارات الأزمة والسيناريوهات</li><li>الخيارات والتوصيات الاستراتيجية</li></ol></aside>
            </div>
          </div>
          <div className="product-typography-note">عنوان غلاف الدراسة: ثمانية Serif Display 700 · العناوين الداخلية: Serif 500 · العناوين الثانوية: تجاريب 500 · النصوص: Sans 400</div>
        </section>
      </div>
      <aside className="products-method-note">هذه صفحة اختبار داخلية وليست جزءًا من الموقع العام. جميع العناوين والمعلومات أمثلة تصميمية افتراضية، ولا تمثل أخبارًا أو تقارير منشورة. لم يتغير النظام الطباعي في صفحات المنصة أو لوحة الإدارة.</aside>
    </main>
  );
}

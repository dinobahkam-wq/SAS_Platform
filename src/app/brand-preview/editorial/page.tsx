import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export const metadata = {
  title: "النظام التحريري المعتمد | منصة ساس",
  description: "اختبار النظام الطباعي المعتمد على نماذج المقالات والدراسات في منصة ساس.",
  robots: { index: false, follow: false },
};

export default function EditorialTypographyPreview() {
  return (
    <main className="editorial-specimen">
      <header className="public-header">
        <div className="public-header-inner">
          <Link href="/" className="public-brand" aria-label="منصة ساس">
            <BrandLogo variant="full" priority />
          </Link>
          <Link href="/brand-preview" className="public-login-link">العودة إلى مقارنة الخطوط</Link>
        </div>
      </header>

      <section className="editorial-specimen-intro">
        <span className="eyebrow">SAS · EDITORIAL TYPOGRAPHY SYSTEM A</span>
        <h1>اختبار النظام الطباعي في القوالب التحريرية</h1>
        <p>
          نموذج تصميمي يختبر تجاريب طويل في العناوين التحريرية، وثمانية سانس
          في العناوين الوظيفية والنصوص، عبر صفحة مقال وصفحة تقرير بحثي.
        </p>
        <span className="specimen-status">النظام A · معتمد للاختبار التطبيقي</span>
      </section>

      <div className="editorial-specimen-content">
        <section className="specimen-block">
          <header className="specimen-block-heading">
            <h2>اختبار العنوان الطويل</h2>
            <span className="specimen-index">01 / LONG HEADLINE</span>
          </header>
          <div className="long-headline-stage">
            <span className="specimen-kicker">تحليل سياسي · اليمن · نموذج تجريبي</span>
            <h3 className="editorial-display-title">
              كيف أعاد التدخل السعودي تشكيل الأزمة اليمنية؟ حدود إدارة الصراع واحتمالات استعادة الدولة
            </h3>
            <p>
              اختبار عنوان ممتد على أكثر من سطر، لقياس وضوح الحروف والإيقاع البصري
              وتوازن المساحة بين العنوان والمقدمة، دون التضحية بسهولة القراءة.
            </p>
            <div className="specimen-meta-row">
              <span>منصة ساس</span>
              <span>مادة تجريبية غير منشورة</span>
              <span>عنوان تحريري · وزن 500</span>
            </div>
          </div>
        </section>

        <section className="specimen-block">
          <header className="specimen-block-heading">
            <h2>قالب المقال والتحليل</h2>
            <span className="specimen-index">02 / EDITORIAL ARTICLE</span>
          </header>
          <div className="editorial-layout">
            <article className="editorial-article">
              <header className="editorial-article-header">
                <span className="eyebrow">تحليل ورأي</span>
                <h3 className="editorial-display-title">
                  الدولة قبل التسوية: سؤال بناء القدرة الوطنية
                </h3>
                <p className="editorial-article-deck">
                  لا تُقاس التسوية السياسية بقدرتها على إيقاف المواجهة فحسب،
                  بل بقدرتها على إعادة بناء المؤسسات التي تجعل الاتفاق قابلًا
                  للتنفيذ والاستمرار.
                </p>
                <div className="specimen-meta-row">
                  <span>القسم: التحليل والرأي</span>
                  <span>الكاتب: نموذج مؤسسي</span>
                  <span>زمن القراءة: 6 دقائق</span>
                </div>
              </header>

              <div className="editorial-article-body">
                <p>
                  لا تبدأ معالجة الأزمات الوطنية من لحظة توقيع الاتفاقات، بل من
                  تحديد البنية المؤسسية القادرة على تحويل التفاهمات السياسية إلى
                  قواعد نافذة وممارسات مستقرة. ومن دون هذه القدرة، تتحول التسوية
                  إلى ترتيب مؤقت لإدارة التوازنات، لا إلى مدخل لاستعادة الدولة.
                </p>
                <h4>من الاتفاق السياسي إلى القدرة المؤسسية</h4>
                <p>
                  يتطلب الانتقال من التسوية إلى الاستقرار وجود مؤسسات عامة
                  موحدة، وسلسلة واضحة للمسؤولية، واحتكار قانوني ومنظم لأدوات
                  الإكراه، إلى جانب قدرة إدارية ومالية تضمن استمرار الخدمات
                  العامة وإنفاذ القرارات.
                </p>
                <blockquote>
                  الاختبار الحقيقي لأي تسوية ليس ما تتضمنه وثيقتها، بل ما تستطيع
                  مؤسسات الدولة تنفيذه بعد توقيعها.
                </blockquote>
                <h4>المؤسسات بوصفها شرطًا للاستدامة</h4>
                <p>
                  عندما تتعدد مراكز القرار والتنفيذ، تصبح الالتزامات عرضة
                  للتعطيل أو الانتقائية. لذلك ينبغي أن تتجه المعالجة إلى إعادة
                  بناء الوظائف العامة وربطها بمسؤوليات محددة وآليات رقابة
                  ومساءلة قابلة للتحقق.
                </p>
                <p>
                  هذا النص تجريبي لاختبار طول الفقرة، والمسافة بين الفقرات،
                  ووضوح العناوين الفرعية، وأداء الخط في القراءة المتواصلة.
                </p>
              </div>
            </article>

            <aside className="editorial-article-aside">
              <section className="editorial-aside-card">
                <h4>بيانات المادة</h4>
                <p>نوع المحتوى: تحليل سياسي</p>
                <p>الموضوع: بناء الدولة</p>
                <p>الحالة: نموذج تصميمي</p>
              </section>
              <section className="editorial-aside-card">
                <h4>في هذا المقال</h4>
                <ul>
                  <li>من الاتفاق السياسي إلى القدرة المؤسسية</li>
                  <li>المؤسسات بوصفها شرطًا للاستدامة</li>
                </ul>
              </section>
            </aside>
          </div>
        </section>

        <section className="specimen-block">
          <header className="specimen-block-heading">
            <h2>قالب الدراسة والتقرير البحثي</h2>
            <span className="specimen-index">03 / RESEARCH REPORT</span>
          </header>
          <div className="report-specimen">
            <div className="report-cover">
              <span className="report-cover-kicker">منصة ساس · دراسات وأبحاث</span>
              <h3 className="research-cover-title">
                تحولات البيئة الإقليمية وأثرها في مسارات الأزمة اليمنية
              </h3>
              <p>
                نموذج غلاف وملخص تنفيذي لتقرير بحثي؛ يختبر العنوان الممتد،
                والبيانات التعريفية، والملخص، والنتائج، وبنية المحتويات.
              </p>
              <div className="report-meta-grid">
                <div className="report-meta-item">
                  <span className="report-meta-label">نوع المنتج</span>
                  <strong>تقرير بحثي</strong>
                </div>
                <div className="report-meta-item">
                  <span className="report-meta-label">النطاق</span>
                  <strong>اليمن والمحيط الإقليمي</strong>
                </div>
                <div className="report-meta-item">
                  <span className="report-meta-label">الحالة</span>
                  <strong>نموذج تصميمي</strong>
                </div>
              </div>
            </div>

            <div className="report-content-grid">
              <section className="report-abstract">
                <h4>الملخص التنفيذي</h4>
                <p>
                  يدرس هذا النموذج أثر التحولات في البيئة الإقليمية على مسارات
                  الأزمة اليمنية، مع التركيز على تفاعل المصالح الأمنية
                  والسياسية، وانعكاسها على مؤسسات الدولة وفرص التسوية. صُممت
                  هذه الفقرة لاختبار النصوص البحثية الطويلة وعرضها ضمن مساحة
                  مريحة ومتوازنة.
                </p>
              </section>
              <section className="report-findings">
                <h4>محاور التقرير</h4>
                <ul>
                  <li>تحولات البيئة الاستراتيجية الإقليمية.</li>
                  <li>تأثير التنافس على بنية الأزمة اليمنية.</li>
                  <li>انعكاسات التحولات على فرص استعادة الدولة.</li>
                </ul>
              </section>
            </div>

            <div className="report-table-wrap">
              <table className="report-table">
                <thead>
                  <tr><th>المحور</th><th>موضوع المعالجة</th><th>طبيعة القسم</th></tr>
                </thead>
                <tbody>
                  <tr><td>01</td><td>البيئة الإقليمية</td><td>تحليل سياقي</td></tr>
                  <tr><td>02</td><td>تفاعلات الأزمة</td><td>تحليل بنيوي</td></tr>
                  <tr><td>03</td><td>مسارات الاستجابة</td><td>تقدير استراتيجي</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <aside className="editorial-specimen-note">
        جميع النصوص الواردة في هذه الصفحة أمثلة تصميمية لا تمثل مواد منشورة أو نتائج بحثية معتمدة.
        الغرض هو اختبار النظام الطباعي وقوالب المحتوى قبل تعميمها على المنصة.
      </aside>
    </main>
  );
}

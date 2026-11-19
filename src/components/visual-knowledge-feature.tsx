import Link from "next/link";
import "./visual-knowledge-feature.css";

export function VisualKnowledgeFeature({ compact = false }: { compact?: boolean }) {
  return (
    <article className={"sas-visual-feature" + (compact ? " sas-visual-feature--compact" : "")}>
      <div className="sas-visual-feature-content">
        <div className="sas-visual-feature-label"><span className="sas-visual-feature-dot" aria-hidden="true" /> إصدار معرفي تفاعلي · 01</div>
        <p className="sas-visual-feature-type">خط زمني موثق</p>
        <h3>اليمن: محطات أعادت تشكيل الأزمة</h3>
        <p>من السيطرة على صنعاء إلى الهدنة وتشكيل مجلس القيادة الرئاسي. استكشف ثماني محطات، وما تغيّر بعدها، مع المصادر الأصلية.</p>
        <div className="sas-visual-feature-meta"><span>2014—2022</span><span>8 محطات</span><span>4 مجالات</span></div>
        <Link href="/visual-knowledge/yemen-crisis-timeline">استكشاف المادة <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m16 17-9-9M7 8v7M7 8h7"/></svg></Link>
      </div>
      <div className="sas-visual-feature-graphic" aria-hidden="true">
        <div className="sas-visual-feature-graphic-title">مراحل التحول</div>
        <div className="sas-visual-feature-years">
          <span>2014</span><span>2015</span><span>2016</span><span>2017</span><span>2018</span><span>2019</span><span>2022</span>
        </div>
        <div className="sas-visual-feature-graph-line"><i/><i/><i/><i/><i/><i/><i/></div>
        <span className="sas-visual-feature-graphic-foot">سياسي · عسكري · مؤسسي · دبلوماسي</span>
      </div>
    </article>
  );
}

export function CivicKnowledgeFeature({ compact = false }: { compact?: boolean }) {
  return (
    <article className={"sas-visual-feature sas-visual-feature--civics" + (compact ? " sas-visual-feature--compact" : "")}>
      <div className="sas-visual-feature-content">
        <div className="sas-visual-feature-label"><span className="sas-visual-feature-dot" aria-hidden="true" /> التثقيف السياسي · الإصدار 02</div>
        <p className="sas-visual-feature-type">دليل تفاعلي للمفاهيم والمؤسسات</p>
        <h3>ما الدولة؟ وكيف تعمل أنظمة الحكم؟</h3>
        <p>تعرّف إلى أركان الدولة والفرق بينها وبين الحكومة، وقارن بين شكل الدولة والنظام الرئاسي والبرلماني وشبه الرئاسي.</p>
        <div className="sas-visual-feature-meta"><span>5 وحدات</span><span>3 أنظمة</span><span>اختبار فهم</span></div>
        <Link href="/visual-knowledge/state-and-government">استكشف الدليل <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m16 17-9-9M7 8v7M7 8h7"/></svg></Link>
      </div>
      <div className="sas-visual-feature-graphic sas-visual-feature-graphic--civics" aria-hidden="true">
        <span className="sas-visual-feature-graphic-title">فهم الدولة ومؤسساتها</span>
        <div className="sas-civics-map">
          <div className="sas-civics-map-core">الدولة</div>
          <div className="sas-civics-map-stems"><span/><span/><span/></div>
          <div className="sas-civics-map-nodes"><span>الحكومة</span><span>الدستور</span><span>المؤسسات</span></div>
        </div>
        <span className="sas-visual-feature-graphic-foot">مفاهيم · أنظمة حكم · مبادئ دستورية</span>
      </div>
    </article>
  );
}

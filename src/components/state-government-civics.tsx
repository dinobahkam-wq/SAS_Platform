"use client";

import { useState } from "react";
import {
  civicConcepts, civicQuestions, civicSources, governmentForms,
  governingSystems, stateElements,
} from "@/data/visual-knowledge/state-and-government";
import "./state-and-government.css";

type Section = "concept" | "elements" | "form" | "system" | "test";
const sections: { id: Section; name: string; summary: string }[] = [
  { id: "concept", name: "الدولة والحكومة", summary: "المفاهيم الأساسية" },
  { id: "elements", name: "أركان الدولة", summary: "ممّ تتكوّن؟" },
  { id: "form", name: "شكل الدولة", summary: "موحدة أم اتحادية؟" },
  { id: "system", name: "نظام الحكم", summary: "كيف تُدار السلطة؟" },
  { id: "test", name: "اختبر فهمك", summary: "تطبيق معرفي" },
];

function CivicIcon({ name, size = 18 }: { name: string; size?: number }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.65, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  switch (name) {
    case "building": return <svg {...props}><path d="m3 9 9-6 9 6M5 10h14M6 10v9M10 10v9M14 10v9M18 10v9M3 21h18"/></svg>;
    case "people": return <svg {...props}><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1"/></svg>;
    case "map": return <svg {...props}><path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5ZM9 3v16M15 5v16"/></svg>;
    case "shield": return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>;
    case "layers": return <svg {...props}><path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/></svg>;
    case "link": return <svg {...props}><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1"/></svg>;
    case "arrow": return <svg {...props}><path d="m16 17-9-9M7 8v7M7 8h7"/></svg>;
    case "check": return <svg {...props}><path d="m4 12 5 5 11-11"/></svg>;
    case "branch": return <svg {...props}><circle cx="6" cy="5" r="2"/><circle cx="18" cy="7" r="2"/><circle cx="18" cy="18" r="2"/><path d="M6 7v8a3 3 0 0 0 3 3h7M6 9a3 3 0 0 0 3-2h7"/></svg>;
    default: return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 17h.01"/></svg>;
  }
}

export function StateGovernmentCivics() {
  const [section, setSection] = useState<Section>("concept");
  const [form, setForm] = useState<(typeof governmentForms)[number]["id"]>("unitary");
  const [system, setSystem] = useState<(typeof governingSystems)[number]["id"]>("parliamentary");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const activeForm = governmentForms.find((entry) => entry.id === form) ?? governmentForms[0];
  const activeSystem = governingSystems.find((entry) => entry.id === system) ?? governingSystems[0];
  const question = civicQuestions[questionIndex];
  const answered = answers[questionIndex];
  const score = civicQuestions.filter((item, i) => answers[i] === item.correct).length;
  const selectedSection = sections.findIndex((entry) => entry.id === section);

  function changeSection(next: Section) { setSection(next); }
  function move(delta: number) {
    const pos = Math.max(0, Math.min(sections.length - 1, selectedSection + delta));
    setSection(sections[pos].id);
  }

  return (
    <article className="sascivic">
      <header className="sascivic-hero">
        <div className="sascivic-top"><span><CivicIcon name="building" size={18}/> ساس / المعرفة البصرية</span><span>التثقيف السياسي · الملف 02</span></div>
        <div className="sascivic-hero-main">
          <div>
            <p className="sascivic-overline">من المفهوم إلى المؤسسة</p>
            <h1>ما الدولة؟ وكيف تعمل أنظمة الحكم؟</h1>
            <p>دليل بصري تفاعلي يُوضّح الفرق بين الدولة والحكومة والنظام السياسي، ثم يشرح أركان الدولة وأشكالها وكيفية تنظيم السلطة فيها.</p>
          </div>
          <div className="sascivic-hero-side" aria-hidden="true">
            <div className="sascivic-seal"><CivicIcon name="building" size={33}/><strong>الدولة</strong></div>
            <div className="sascivic-seal-branches"><span>المؤسسات</span><span>الحقوق</span><span>القانون</span></div>
          </div>
        </div>
        <div className="sascivic-hero-bottom"><span><CivicIcon name="layers"/> 5 وحدات تعليمية</span><span><CivicIcon name="branch"/> 3 نظم حكم</span><span><CivicIcon name="check"/> اختبار قصير</span></div>
      </header>

      <div className="sascivic-workspace">
        <nav className="sascivic-sidebar" aria-label="أقسام الدليل التفاعلي">
          <div className="sascivic-sidebar-label">مسار التعلّم</div>
          {sections.map((item, i) => (
            <button key={item.id} type="button" onClick={() => changeSection(item.id)} aria-current={section === item.id ? "step" : undefined} className={"sascivic-step" + (section === item.id ? " is-current" : "")}>
              <span className="sascivic-step-number">{String(i + 1).padStart(2, "0")}</span>
              <span><strong>{item.name}</strong><small>{item.summary}</small></span>
              <CivicIcon name="arrow" size={15}/>
            </button>
          ))}
          <div className="sascivic-sidebar-foot">المحتوى تعليمي مقارن؛ لا يفترض أن شكلًا واحدًا للدولة أو الحكم هو الأفضل في جميع المجتمعات.</div>
        </nav>

        <section className="sascivic-panel" aria-live="polite" aria-atomic="false">
          <div className="sascivic-panel-bar"><span>الوحدة {String(selectedSection + 1).padStart(2, "0")} / 05</span><span>العلوم السياسية المبسّطة</span></div>

          {section === "concept" && <div className="sascivic-unit">
            <p className="sascivic-kicker">ابدأ من التمييز المفاهيمي</p>
            <h2>الدولة ليست الحكومة</h2>
            <p className="sascivic-unit-intro">قد تتغير الحكومة، وربما يتغير النظام السياسي أيضًا، بينما تستمر الدولة بمؤسساتها وشخصيتها القانونية.</p>
            <div className="sascivic-concepts">
              {civicConcepts.map((item, i) => <div key={item.title} className={"sascivic-concept sascivic-concept-"+i}>
                <div className="sascivic-concept-top"><span>{String(i + 1).padStart(2, "0")}</span><strong>{item.title}</strong></div>
                <p>{item.description}</p>
                <small>{item.accent}</small>
              </div>)}
            </div>
            <div className="sascivic-distinction"><CivicIcon name="check" size={22}/><div><strong>القاعدة الأساسية</strong><p>تغيير الوزراء أو رئيس الحكومة لا يعني إنشاء دولة جديدة. والديمقراطية أو السلطوية تصفان كيفية ممارسة السلطة، لا مجرد اسم المؤسسة.</p></div></div>
          </div>}

          {section === "elements" && <div className="sascivic-unit">
            <p className="sascivic-kicker">أركان الكيان السياسي</p>
            <h2>أربعة عناصر لفهم الدولة</h2>
            <p className="sascivic-unit-intro">يوضح النموذج التعليمي العناصر الأساسية المتداولة في الفقه السياسي والقانوني، مع التمييز بين وجود الدولة وبين جودة أدائها.</p>
            <div className="sascivic-elements">
              {stateElements.map((item) => <div className="sascivic-element" key={item.id}>
                <div className="sascivic-element-icon"><CivicIcon name={item.symbol} size={25}/></div>
                <span>{item.no}</span><h3>{item.title}</h3><p>{item.text}</p>
              </div>)}
            </div>
            <div className="sascivic-distinction"><CivicIcon name="check" size={22}/><div><strong>وجود الدولة ≠ كفاءة الدولة</strong><p>قد تتوافر مقومات الدولة مع ضعف الخدمات أو مؤسسات الرقابة؛ وتُقاس جودة الحكم بمعايير إضافية كالمساءلة والفاعلية وسيادة القانون.</p></div></div>
          </div>}

          {section === "form" && <div className="sascivic-unit">
            <p className="sascivic-kicker">السؤال: أين تُوزّع الصلاحيات إقليميًا؟</p>
            <h2>شكل الدولة: موحّدة أم اتحادية؟</h2>
            <p className="sascivic-unit-intro">هذا التصنيف يخص العلاقة الدستورية بين المستوى الوطني والوحدات الإقليمية، ولا يحدد وحده إذا كان الحكم رئاسيًا أو برلمانيًا.</p>
            <div className="sascivic-choices" role="group" aria-label="اختر شكل الدولة">
              {governmentForms.map((item) => <button type="button" key={item.id} aria-pressed={form === item.id} className={form === item.id ? "is-selected" : ""} onClick={() => setForm(item.id)}>{item.title}</button>)}
            </div>
            <div className="sascivic-structure">
              <div className="sascivic-structure-main"><CivicIcon name="building" size={25}/><strong>{activeForm.structure[0]}</strong></div>
              <div className="sascivic-structure-connector" aria-hidden="true"><span/><span/></div>
              <div className="sascivic-structure-branch"><CivicIcon name="branch" size={21}/><strong>{activeForm.structure[1]}</strong></div>
            </div>
            <div className="sascivic-definition"><span>{activeForm.label}</span><p>{activeForm.description}</p></div>
            <div className="sascivic-distinction"><CivicIcon name="check" size={21}/><div><strong>تفصيل يزيل الالتباس</strong><p>{activeForm.distinction}</p></div></div>
          </div>}

          {section === "system" && <div className="sascivic-unit">
            <p className="sascivic-kicker">السؤال: من يقود السلطة التنفيذية؟ ومن يحاسبه؟</p>
            <h2>ثلاثة نماذج لتنظيم الحكم</h2>
            <p className="sascivic-unit-intro">تتحدد الفروق الرئيسية وفق طريقة تشكيل السلطة التنفيذية، وعلاقتها بالبرلمان، وآليات استمرار الحكومة أو إقالتها.</p>
            <div className="sascivic-choices" role="group" aria-label="اختر نظام الحكم">
              {governingSystems.map((item) => <button type="button" key={item.id} aria-pressed={system === item.id} className={system === item.id ? "is-selected" : ""} onClick={() => setSystem(item.id)}>{item.title}</button>)}
            </div>
            <div className="sascivic-system-title"><CivicIcon name="layers" size={22}/><div><strong>النظام {activeSystem.title}</strong><span>{activeSystem.tagline}</span></div></div>
            <div className="sascivic-system-grid">
              <div><small>تشكيل السلطة التنفيذية</small><p>{activeSystem.formation}</p></div>
              <div><small>العلاقة مع البرلمان</small><p>{activeSystem.relation}</p></div>
              <div><small>رئيس الدولة والحكومة</small><p>{activeSystem.executive}</p></div>
            </div>
            <div className="sascivic-distinction"><CivicIcon name="check" size={21}/><div><strong>لا تستنتج طبيعة النظام من اسمه فقط</strong><p>{activeSystem.caution}</p></div></div>
          </div>}

          {section === "test" && <div className="sascivic-unit">
            <p className="sascivic-kicker">اختبار قصير · بلا حساب أو تسجيل</p>
            <h2>هل اتضحت الصورة؟</h2>
            <p className="sascivic-unit-intro">أربع حالات عملية تراجع المفاهيم دون إصدار حكم على تفضيلاتك السياسية.</p>
            <div className="sascivic-quiz-header"><strong>السؤال {questionIndex+1} من {civicQuestions.length}</strong><span>الإجابات الصحيحة: {score}</span></div>
            <div className="sascivic-quiz-progress">{civicQuestions.map((_,i)=><span key={i} className={i===questionIndex?"is-active":answers[i]!==undefined?"is-done":""}/>)}</div>
            <fieldset className="sascivic-quiz"><legend>{question.prompt}</legend>
              {question.answers.map((answer, i) => <button type="button" key={answer} onClick={() => setAnswers((existing)=>({...existing,[questionIndex]:i}))}
                aria-pressed={answered===i} className={answered===i ? "is-selected" : ""}>
                <span className="sascivic-answer-symbol">{["أ","ب","ج"][i]}</span>{answer}
              </button>)}
            </fieldset>
            {answered !== undefined && <div className={"sascivic-feedback "+(answered===question.correct?"is-correct":"is-incorrect")} role="status"><strong>{answered===question.correct?"إجابة صحيحة":"الإجابة الأدق مختلفة"}</strong><p>{question.explanation}</p></div>}
            <div className="sascivic-quiz-nav">
              <button type="button" disabled={questionIndex===0} onClick={()=>setQuestionIndex(i=>Math.max(0,i-1))}>السابق</button>
              {questionIndex<civicQuestions.length-1
                ? <button type="button" onClick={()=>setQuestionIndex(i=>Math.min(civicQuestions.length-1,i+1))}>السؤال التالي</button>
                : <button type="button" onClick={()=>{setQuestionIndex(0);setAnswers({})}}>إعادة الاختبار</button>}
            </div>
          </div>}

          <div className="sascivic-page-nav">
            <button type="button" disabled={selectedSection===0} onClick={()=>move(-1)}>الوحدة السابقة</button>
            <span>{selectedSection+1} / {sections.length}</span>
            <button type="button" disabled={selectedSection===sections.length-1} onClick={()=>move(1)}>الوحدة التالية ←</button>
          </div>
        </section>
      </div>

      <section className="sascivic-sources">
        <div className="sascivic-sources-head"><CivicIcon name="link" size={20}/><div><h2>المراجع والمنهجية</h2><p>تعريفات ومقارنات تعليمية مستندة إلى أدبيات بناء الدساتير والعلوم السياسية.</p></div></div>
        <div className="sascivic-sources-list">{civicSources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer"><strong>{source.title}</strong><span>{source.organization}</span><CivicIcon name="arrow" size={16}/></a>)}</div>
        <p className="sascivic-method">تُعرض النماذج لتوضيح التصنيفات الدستورية، لا لتوصية سياسية بعينها. تتوقف النتائج الواقعية على التفاصيل الدستورية وتطبيق القانون وتوازن المؤسسات، وليس على الاسم الرسمي للنظام وحده.</p>
      </section>
    </article>
  );
}

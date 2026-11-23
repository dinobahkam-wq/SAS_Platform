import Link from "next/link";
import "./visual-knowledge-portal.css";

/** Gallery entrance, not a preview of individual unpublished or published products. */
export function VisualKnowledgePortal() {
  return (
    <div className="sas-vkp">
      <div className="sas-vkp-copy">
        <span className="sas-vkp-eyebrow">الأطلس البصري · منصة ساس</span>
        <h3>المعرفة البصرية</h3>
        <p>خرائط وإنفوغراف وبطاقات معرفية تختصر الوقائع والعلاقات والتحولات في مساحة يمكن استكشافها بصريًا.</p>
        <div className="sas-vkp-actions">
          <Link className="sas-vkp-cta sas-cta sas-cta--primary" href="/visual-knowledge">
            استكشف المعرض <span aria-hidden="true">↗</span>
          </Link>
          <span className="sas-vkp-formats">خرائط · مخططات · بطاقات · إنفوغراف</span>
        </div>
      </div>
      <div className="sas-vkp-illustration" aria-hidden="true">
        <div className="sas-vkp-map-contours" />
        <div className="sas-vkp-illustration-card sas-vkp-illustration-card--chart">
          <svg viewBox="0 0 180 112" fill="none" aria-hidden="true">
            <path d="M15 95H165 M15 95V18" stroke="currentColor" strokeOpacity=".28" strokeWidth="2"/>
            <path d="M17 82 52 68 78 74 106 41 142 51 164 22" stroke="#bd9551" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            {[ [17,82],[52,68],[78,74],[106,41],[142,51],[164,22] ].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="5" fill="#bd9551" stroke="#faf8f1" strokeWidth="2"/>)}
          </svg>
          <span>المخططات</span>
        </div>
        <div className="sas-vkp-illustration-card sas-vkp-illustration-card--map">
          <svg viewBox="0 0 180 120" fill="none" aria-hidden="true">
            <path d="M15 40 47 14 79 24 105 10 143 32 166 23 158 61 139 92 103 107 66 92 31 104 12 72Z" fill="#9ccdc5" stroke="#488e86" strokeWidth="2"/>
            <path d="M48 14 53 48 31 104 M79 24 82 59 66 92 M105 10 115 51 103 107 M143 32 115 51 158 61 M53 48 82 59 115 51 139 92" stroke="#fff" strokeOpacity=".84" strokeWidth="2"/>
            <path d="M76 50c0-17 28-17 28 0 0 10-14 25-14 25S76 60 76 50Z" fill="#075e58"/>
            <circle cx="90" cy="50" r="5" fill="#fff"/>
          </svg>
          <span>الخرائط</span>
        </div>
        <div className="sas-vkp-illustration-card sas-vkp-illustration-card--note">
          <span className="sas-vkp-note-tag">ساس / معرفة بصرية</span>
          <div className="sas-vkp-note-lines"><i/><i/><i/></div>
          <span>البطاقات المعرفية</span>
        </div>
      </div>
    </div>
  );
}

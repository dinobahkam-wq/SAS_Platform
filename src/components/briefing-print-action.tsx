"use client";

export function BriefingPrintAction() {
  return (
    <button type="button" className="briefing-print-action" onClick={() => window.print()}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
        <path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M7 14h10v7H7v-7Z" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17.5 11.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      طباعة / حفظ PDF
    </button>
  );
}

"use client";

import { useMemo, useState } from "react";

type BlockType = "paragraph" | "heading" | "subheading" | "quote" | "list";
type EditorBlock = { id: string; type: BlockType; text: string; items?: string[] };

type StoredBody = { version?: number; blocks?: Array<{ type?: string; text?: string; items?: unknown[] }> };

const labels: Record<BlockType, string> = {
  paragraph: "فقرة",
  heading: "عنوان رئيسي",
  subheading: "عنوان فرعي",
  quote: "اقتباس",
  list: "قائمة",
};

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function parseInitial(value?: string): EditorBlock[] {
  if (!value) return [{ id: makeId(), type: "paragraph", text: "" }];
  try {
    const parsed = JSON.parse(value) as StoredBody;
    if (Array.isArray(parsed.blocks)) {
      const blocks = parsed.blocks.flatMap((block): EditorBlock[] => {
        const type = block.type as BlockType;
        if (!["paragraph", "heading", "subheading", "quote", "list"].includes(type)) return [];
        if (type === "list") {
          const items = Array.isArray(block.items) ? block.items.filter((item): item is string => typeof item === "string") : [];
          return [{ id: makeId(), type, text: "", items }];
        }
        return [{ id: makeId(), type, text: typeof block.text === "string" ? block.text : "" }];
      });
      return blocks.length ? blocks : [{ id: makeId(), type: "paragraph", text: "" }];
    }
  } catch {
    // Older records may arrive as plain text.
  }
  return value.split(/\n\s*\n/g).map((text) => ({ id: makeId(), type: "paragraph" as const, text }));
}

export function StructuredContentEditor({ initialBody }: { initialBody?: string }) {
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => parseInitial(initialBody));
  const [showPreview, setShowPreview] = useState(false);
  const serialized = useMemo(() => JSON.stringify({
    version: 1,
    blocks: blocks.map((block) => block.type === "list"
      ? { type: "list", items: (block.items ?? []).map((item) => item.trim()).filter(Boolean) }
      : { type: block.type, text: block.text.trim() }).filter((block) =>
        "items" in block ? block.items.length > 0 : block.text.length > 0),
  }), [blocks]);

  function addBlock(type: BlockType) {
    setBlocks((current) => [...current, { id: makeId(), type, text: "", ...(type === "list" ? { items: [""] } : {}) }]);
  }

  function updateBlock(id: string, patch: Partial<EditorBlock>) {
    setBlocks((current) => current.map((block) => block.id === id ? { ...block, ...patch } : block));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setBlocks((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <section className="sas-editor" aria-label="محرر متن المادة">
      <input type="hidden" name="body_json" value={serialized} />
      <div className="sas-editor-toolbar">
        <div><strong>محرر المادة</strong><span>{blocks.length} عناصر تحريرية</span></div>
        <div className="sas-editor-tools" aria-label="إضافة عنصر">
          {(["paragraph", "heading", "subheading", "quote", "list"] as BlockType[]).map((type) => (
            <button key={type} type="button" onClick={() => addBlock(type)}>＋ {labels[type]}</button>
          ))}
        </div>
      </div>
      <div className="sas-editor-blocks">
        {blocks.map((block, index) => (
          <article className="sas-editor-block" key={block.id}>
            <div className="sas-editor-block-head">
              <span>{String(index + 1).padStart(2, "0")} / {labels[block.type]}</span>
              <div>
                <button type="button" onClick={() => moveBlock(index, -1)} disabled={index === 0} aria-label="تحريك العنصر للأعلى">↑</button>
                <button type="button" onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1} aria-label="تحريك العنصر للأسفل">↓</button>
                <button type="button" onClick={() => setBlocks((current) => current.filter((item) => item.id !== block.id))} disabled={blocks.length === 1}>حذف</button>
              </div>
            </div>
            {block.type === "list" ? (
              <div className="sas-editor-list">
                {(block.items ?? []).map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <span>•</span>
                    <input value={item} onChange={(event) => updateBlock(block.id, { items: (block.items ?? []).map((entry, i) => i === itemIndex ? event.target.value : entry) })} placeholder="عنصر القائمة" />
                    <button type="button" onClick={() => updateBlock(block.id, { items: (block.items ?? []).filter((_, i) => i !== itemIndex) })} aria-label="حذف عنصر القائمة">×</button>
                  </div>
                ))}
                <button type="button" className="sas-editor-add-item" onClick={() => updateBlock(block.id, { items: [...(block.items ?? []), ""] })}>＋ إضافة عنصر</button>
              </div>
            ) : (
              <textarea
                value={block.text}
                onChange={(event) => updateBlock(block.id, { text: event.target.value })}
                rows={block.type === "paragraph" ? 5 : block.type === "quote" ? 3 : 2}
                placeholder={block.type === "paragraph" ? "اكتب الفقرة هنا..." : block.type === "quote" ? "اكتب الاقتباس..." : "اكتب العنوان..."}
                className={"sas-editor-input sas-editor-input--" + block.type}
              />
            )}
          </article>
        ))}
      </div>
      <div className="sas-editor-preview">
        <div><strong>معاينة المادة</strong><p>عرض تقريبي لترتيب العناوين والفقرات والاقتباسات والقوائم كما ستظهر في صفحة القراءة.</p></div>
        <button type="button" onClick={() => setShowPreview((value) => !value)}>{showPreview ? "إخفاء المعاينة" : "عرض المعاينة"}</button>
      </div>
      {showPreview ? (
        <div className="sas-editor-live-preview" dir="rtl">
          {blocks.map((block) => {
            if (block.type === "heading") return <h2 key={block.id}>{block.text || "عنوان رئيسي"}</h2>;
            if (block.type === "subheading") return <h3 key={block.id}>{block.text || "عنوان فرعي"}</h3>;
            if (block.type === "quote") return <blockquote key={block.id}>{block.text || "نص الاقتباس"}</blockquote>;
            if (block.type === "list") return <ul key={block.id}>{(block.items ?? []).filter(Boolean).map((item, index) => <li key={index}>{item}</li>)}</ul>;
            return <p key={block.id}>{block.text || "ستظهر الفقرة هنا بعد إدخال النص."}</p>;
          })}
        </div>
      ) : null}
    </section>
  );
}

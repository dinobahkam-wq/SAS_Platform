import "./home-briefing-rotating-copy.css";

/**
 * Compact editorial descriptors, not live news or unverified claims.
 * Whole Arabic sentences move as single units to preserve joining/diacritics.
 * The first sentence is retained as static screen-reader copy.
 */
const phrases = [
  "رصد يومي للتطورات",
  "وقائع موثقة بمصادرها",
  "قراءة للسياق والتحولات",
  "اليمن أولًا ومحيطه",
] as const;

export function HomeBriefingRotatingCopy() {
  return (
    <div className="sas-home-briefing-rotating-copy" aria-label="رصد يومي للتطورات، بمصادر موثقة وقراءة للسياق اليمني والإقليمي">
      <span className="sas-home-briefing-rotating-prefix" aria-hidden="true">في كل عدد</span>
      <span className="sas-home-briefing-rotating-stage" aria-hidden="true">
        {phrases.map((phrase, index) => (
          <span key={phrase} className="sas-home-briefing-rotating-phrase"
            style={{ animationDelay: `${index * 4}s` }}>{phrase}</span>
        ))}
      </span>
    </div>
  );
}

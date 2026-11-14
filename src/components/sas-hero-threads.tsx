"use client";

import { useEffect, useState } from "react";
import Threads from "@/components/threads";

/**
 * Brand-aware React Bits background; keeps rendering decorative and outside
 * the headline's interactive layer. The original WebGL component stops its
 * RAF when hidden and respects prefers-reduced-motion.
 */
export function SasHeroThreads() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      setDark(root.dataset.theme === "dark" ||
        (!root.dataset.theme && window.matchMedia("(prefers-color-scheme: dark)").matches));
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="sas-threads-background" aria-hidden="true">
      <div className="sas-threads-mesh">
        <Threads
          color={dark ? [95 / 255, 208 / 255, 201 / 255] : [0, 126 / 255, 128 / 255]}
          accentColor={dark ? [92 / 255, 140 / 255, 146 / 255] : [155 / 255, 184 / 255, 186 / 255]}
          lineCount={72}
          thickness={0.48}
          softness={1.45}
          amplitude={0.85}
          distance={0.54}
          waves={0.9}
          speed={0.22}
          split={0.07}
          fray={0.48}
          angle={18}
          taper={0.9}
          brightness={1.3}
          parting={0}
          enableMouseInteraction={false}
          fade={0.13}
          opacity={dark ? 0.48 : 0.56}
          seed={4}
        />
      </div>
    </div>
  );
}

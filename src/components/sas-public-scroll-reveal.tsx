"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Lightweight adaptation of AnimatedContent for SAS public surfaces.
 *
 * Using native IntersectionObserver + Web Animations prevents a sitewide GSAP
 * dependency and avoids hiding server-rendered political content before JS.
 * Only selected reading landmarks animate; interactive controls and CMS do not.
 */
const ROOT_SELECTOR = ".public-site, .briefing-public-site";
const REVEAL_SELECTORS = [
  ".home-brand-hero",
  ".home-section",
  ".home-section .site-section-heading",
  ".sas-home-briefing-feature",
  ".sas-home-briefing-archive",
  ".sas-insight-feature",
  ".sas-insight-small",
  ".sas-vkp",
  ".section-landing-intro",
  ".sas-visual-atlas-intro",
  ".sas-vkg-tools",
  ".sas-vkg-card",
  ".knowledge-card",
  ".editorial-rail-card",
  ".briefing-archive-intro",
  ".briefing-archive-toolbar",
  ".briefing-latest-edition",
  ".briefing-archive-card",
  ".briefing-edition-header",
  ".sas-fixed-reference-panel",
  ".briefing-developments-heading",
  ".briefing-event",
  ".briefing-development",
  ".article-header",
  ".research-public-cover",
  ".article-cover-image",
  ".article-content-layout",
  ".sas-search-heading",
  ".sas-search-form",
  ".sas-search-result",
  ".sas-search-empty",
  ".sas-visual-atlas-content",
  ".sas-home-insights",
  ".sas-home-insights-secondary",
  ".home-media-section",
  ".site-section-heading",
].join(", ");

const SKIP_SELECTOR = [
  "[data-sas-no-reveal]",
  "[hidden]",
  "[inert]",
  "[aria-hidden='true']",
  ".site-header",
  ".site-footer",
  ".site-nav",
  ".briefing-topic-tabs",
  ".sas-pill-nav",
  ".sas-vkg-artwork",
  ".sas-threads-background--sitewide",
  ".sas-mukalla-hero .sas-hero-rotator",
].join(", ");

function canAnimate() {
  return typeof window !== "undefined"
    && typeof IntersectionObserver !== "undefined"
    && typeof Element.prototype.animate === "function"
    && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    && !window.matchMedia("print").matches;
}

/** Attach once at the document root; the selectors deliberately exclude /admin. */
export function SasPublicScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (!canAnimate()) return;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let scanFrame = 0;
    const seen = new WeakSet<Element>();
    const observers = new Set<IntersectionObserver>();
    const animated = new Set<Animation>();

    const observer = new IntersectionObserver((entries, instance) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        instance.unobserve(element);
        if (disposed || !element.isConnected || motionPreference.matches) continue;
        // Ensure reveal never controls display/visibility: content remains readable
        // if JavaScript, animations or accessibility settings interrupt it.
        const delay = Math.min(Number(element.dataset.sasRevealDelay || 0), 180);
        const animation = element.animate(
          [
            { opacity: 0.45, transform: "translate3d(0, 15px, 0)", filter: "blur(2px)" },
            { opacity: 1, transform: "translate3d(0, 0, 0)", filter: "blur(0)" },
          ],
          { duration: 610, delay, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "none" },
        );
        animated.add(animation);
        animation.addEventListener("finish", () => animated.delete(animation), { once: true });
        animation.addEventListener("cancel", () => animated.delete(animation), { once: true });
      }
    }, { root: null, rootMargin: "0px 0px -4% 0px", threshold: 0.08 });
    observers.add(observer);

    const scan = () => {
      scanFrame = 0;
      if (disposed) return;
      document.querySelectorAll<HTMLElement>(ROOT_SELECTOR).forEach(root => {
        // Admin and login/auth pages are not wrapped in either public class.
        const elements = root.querySelectorAll<HTMLElement>(REVEAL_SELECTORS);
        let registered = 0;
        for (const element of elements) {
          if (registered >= 120) break;
          if (seen.has(element) || element.matches(SKIP_SELECTOR)) continue;
          if (element.closest("[data-sas-no-reveal], [hidden], [inert]")) continue;
          // Do not animate a container and all of its descendants simultaneously.
          if (element.parentElement?.closest("[data-sas-reveal-registered]")) continue;
          if (element.getBoundingClientRect().height < 14) continue;
          seen.add(element);
          element.dataset.sasRevealRegistered = "true";
          observer.observe(element);
          registered++;
        }
      });
    };

    const scheduleScan = () => {
      if (disposed || scanFrame) return;
      scanFrame = requestAnimationFrame(scan);
    };
    scan();
    // App Router streaming, late-fetched content, and filter-driven cards.
    const mutationObserver = new MutationObserver(scheduleScan);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    const deactivate = () => {
      if (!motionPreference.matches) return;
      observer.disconnect();
      animated.forEach(animation => animation.cancel());
      animated.clear();
    };
    motionPreference.addEventListener("change", deactivate);
    return () => {
      disposed = true;
      if (scanFrame) cancelAnimationFrame(scanFrame);
      mutationObserver.disconnect();
      observers.forEach(instance => instance.disconnect());
      motionPreference.removeEventListener("change", deactivate);
      animated.forEach(animation => animation.cancel());
      animated.clear();
    };
  }, [pathname]);

  return null;
}

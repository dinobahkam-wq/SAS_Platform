"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import "./sas-pwa-controls.css";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
type Platform = "none" | "android" | "ios" | "ios-inapp";

function isStandalone(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}
function identifyPlatform(): Platform {
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (ios) return /FBAN|FBAV|Instagram|Messenger|GSA/i.test(ua) ? "ios-inapp" : "ios";
  return /Android/i.test(ua) ? "android" : "none";
}

export function SasPwaControls() {
  const [platform, setPlatform] = useState<Platform>("none");
  const [secureOrigin, setSecureOrigin] = useState(false);
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [workerWaiting, setWorkerWaiting] = useState<ServiceWorker | null>(null);
  const userRequestedUpdate = useRef(false);
  const pathname = usePathname();
  const privatePath = /^\/(?:admin|login|auth)(?:\/|$)/.test(pathname);

  useEffect(() => {
    setPlatform(identifyPlatform());
    setSecureOrigin(window.isSecureContext);
    setInstalled(isStandalone());
    try { setDismissed(sessionStorage.getItem("sas-pwa-dismissed") === "1"); }
    catch { /* Storage might be restricted in private browsing. */ }
    const offer = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
      setShowGuide(false);
    };
    window.addEventListener("beforeinstallprompt", offer);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", offer);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
    let cancelled = false;
    let registration: ServiceWorkerRegistration | undefined;
    const onChange = () => {
      if (!userRequestedUpdate.current) return;
      userRequestedUpdate.current = false;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onChange);
    const watch = (r: ServiceWorkerRegistration) => {
      if (r.waiting && navigator.serviceWorker.controller) setWorkerWaiting(r.waiting);
      r.addEventListener("updatefound", () => {
        const incoming = r.installing;
        incoming?.addEventListener("statechange", () => {
          if (incoming.state === "installed" && navigator.serviceWorker.controller) {
            setWorkerWaiting(incoming);
          }
        });
      });
    };
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then(r => {
        if (cancelled) return;
        registration = r;
        watch(r);
        // Update opportunistically; never force a reload while a reader is active.
        void r.update().catch(() => {});
      }).catch(() => {/* PWA remains readable if SW registration fails. */});
    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener("controllerchange", onChange);
      void registration; // registration persists by design
    };
  }, []);

  async function install() {
    if (platform === "android" && installEvent) {
      const event = installEvent;
      setInstallEvent(null);
      try {
        await event.prompt();
        const result = await event.userChoice;
        if (result.outcome !== "accepted") setShowGuide(true);
      } catch {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  }
  function dismiss() {
    setDismissed(true);
    try { sessionStorage.setItem("sas-pwa-dismissed", "1"); } catch { /* optional */ }
  }
  function updateApp() {
    if (!workerWaiting) return;
    setUpdating(true);
    userRequestedUpdate.current = true;
    workerWaiting.postMessage({ type: "SAS_SKIP_WAITING" });
  }

  const eligible = secureOrigin && !privatePath && !installed && !dismissed &&
    (platform === "ios" || platform === "ios-inapp" || platform === "android");
  if (!eligible && !workerWaiting) return null;

  return (
    <>
      {workerWaiting ? (
        <aside className="sas-pwa-banner" aria-label="تحديث منصة ساس">
          <span>يتوفر تحديث جديد لتطبيق ساس.</span>
          <button type="button" onClick={updateApp} disabled={updating}>
            {updating ? "جارٍ التحديث…" : "تحديث الآن"}
          </button>
        </aside>
      ) : eligible ? (
        <aside className="sas-pwa-banner" aria-label="تثبيت منصة ساس">
          <button type="button" className="sas-pwa-banner__install" onClick={install}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12m-4-4 4 4 4-4M4 17v3h16v-3"/>
            </svg>
            {platform === "android" && !installEvent ? "إرشادات تثبيت ساس" : "تثبيت ساس"}
          </button>
          <button type="button" className="sas-pwa-banner__close" aria-label="إخفاء عرض التثبيت"
            onClick={dismiss}>×</button>
        </aside>
      ) : null}

      {showGuide && (
        <div className="sas-pwa-guide-backdrop" onClick={e => {
          if (e.target === e.currentTarget) setShowGuide(false);
        }}>
          <section className="sas-pwa-guide" role="dialog" aria-modal="true"
            aria-labelledby="sas-pwa-guide-title" dir="rtl">
            <button type="button" className="sas-pwa-guide__close" aria-label="إغلاق"
              onClick={() => setShowGuide(false)}>×</button>
            <h2 id="sas-pwa-guide-title">تثبيت منصة ساس</h2>
            {platform === "ios-inapp" ? (
              <p>افتح هذه الصفحة في Safari أولًا من قائمة المتصفح الداخلي، ثم اتبع خطوات الإضافة إلى الشاشة الرئيسية.</p>
            ) : platform === "ios" ? (
              <ol>
                <li>اضغط زر المشاركة في المتصفح.</li>
                <li>اختر «إضافة إلى الشاشة الرئيسية».</li>
                <li>اختر «إضافة» وافتح ساس من شاشة الهاتف.</li>
              </ol>
            ) : (
              <p>يمكنك تثبيت ساس من خيارات المتصفح ثم «إضافة إلى الشاشة الرئيسية» عندما يكون التثبيت المباشر غير متاح.</p>
            )}
            <button type="button" className="sas-pwa-guide__done" onClick={() => {
              setShowGuide(false);
              dismiss();
            }}>فهمت</button>
          </section>
        </div>
      )}
    </>
  );
}

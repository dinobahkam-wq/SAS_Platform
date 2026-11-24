"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import "./sas-pwa-controls.css";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
type Platform = "none" | "android" | "ios" | "ios-inapp" | "android-inapp";
type UpdateStage = "idle" | "activating" | "reloading" | "error";

function isStandalone(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}
function identifyPlatform(): Platform {
  const ua = navigator.userAgent;
  const inApp = /FBAN|FBAV|Instagram|Messenger|Line\/|TikTok/i.test(ua);
  const ios = /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (ios) return inApp ? "ios-inapp" : "ios";
  if (/Android/i.test(ua)) return inApp ? "android-inapp" : "android";
  return "none";
}

export function SasPwaControls() {
  const pathname = usePathname();
  const privatePath = /^\/(?:admin|login|auth)(?:\/|$)/.test(pathname);
  const [platform, setPlatform] = useState<Platform>("none");
  const [secureOrigin, setSecureOrigin] = useState(false);
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installBusy, setInstallBusy] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [workerWaiting, setWorkerWaiting] = useState<ServiceWorker | null>(null);
  const [updateStage, setUpdateStage] = useState<UpdateStage>("idle");
  const userRequestedUpdate = useRef(false);
  const updateTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPlatform(identifyPlatform());
    setSecureOrigin(window.isSecureContext);
    setInstalled(isStandalone());
    try { setDismissed(sessionStorage.getItem("sas-pwa-dismissed") === "1"); }
    catch { /* storage may be blocked */ }

    const offer = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
      setInstallBusy(false);
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
    let registration: ServiceWorkerRegistration | null = null;

    const controllerChanged = () => {
      if (!userRequestedUpdate.current) return;
      userRequestedUpdate.current = false;
      if (updateTimeout.current) clearTimeout(updateTimeout.current);
      setUpdateStage("reloading");
      // The activating worker now controls this document: reload once.
      window.location.reload();
    };
    const checkForUpdate = () => {
      if (document.visibilityState !== "visible") return;
      void registration?.update().catch(() => {});
    };
    const watch = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting && navigator.serviceWorker.controller) {
        setWorkerWaiting(reg.waiting);
      }
      reg.addEventListener("updatefound", () => {
        const candidate = reg.installing;
        candidate?.addEventListener("statechange", () => {
          if (candidate.state === "installed" && navigator.serviceWorker.controller) {
            setWorkerWaiting(candidate);
          }
        });
      });
    };

    navigator.serviceWorker.addEventListener("controllerchange", controllerChanged);
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then(reg => {
        if (cancelled) return;
        registration = reg;
        watch(reg);
        checkForUpdate();
      }).catch(() => { /* An offline/error page must never crash the site. */ });

    const interval = window.setInterval(checkForUpdate, 60 * 60 * 1000);
    window.addEventListener("focus", checkForUpdate);
    document.addEventListener("visibilitychange", checkForUpdate);
    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener("controllerchange", controllerChanged);
      window.removeEventListener("focus", checkForUpdate);
      document.removeEventListener("visibilitychange", checkForUpdate);
      window.clearInterval(interval);
      if (updateTimeout.current) clearTimeout(updateTimeout.current);
    };
  }, []);

  async function install() {
    // Call prompt synchronously from the click gesture; NEVER await another task first.
    const event = installEvent;
    if (!event || installBusy) return;
    setInstallBusy(true);
    setInstallEvent(null); // event can only be used once
    try {
      await event.prompt();
      const choice = await event.userChoice;
      if (choice.outcome !== "accepted") {
        setInstallBusy(false);
        // Chrome may issue a fresh beforeinstallprompt later; do not show
        // misleading manual-install instructions after a cancellation.
      }
    } catch {
      setInstallBusy(false);
    }
  }

  function dismiss() {
    setDismissed(true);
    try { sessionStorage.setItem("sas-pwa-dismissed", "1"); } catch { /* optional */ }
  }

  const updateApp = useCallback(() => {
    if (!workerWaiting || updateStage === "activating" || updateStage === "reloading") return;
    userRequestedUpdate.current = true;
    setUpdateStage("activating");
    updateTimeout.current = setTimeout(() => {
      userRequestedUpdate.current = false;
      setUpdateStage("error");
    }, 15000);
    workerWaiting.postMessage({ type: "SAS_SKIP_WAITING" });
  }, [workerWaiting, updateStage]);

  const onAndroid = platform === "android" || platform === "android-inapp";
  const directInstallAvailable = onAndroid && Boolean(installEvent);
  const canGuide = platform === "ios" || platform === "ios-inapp" ||
    platform === "android-inapp";
  const eligible = secureOrigin && !privatePath && !installed && !dismissed &&
    (directInstallAvailable || canGuide);
  if (!eligible && !workerWaiting && updateStage === "idle") return null;

  return (
    <>
      {workerWaiting && updateStage === "idle" ? (
        <aside className="sas-pwa-banner" aria-label="تحديث منصة ساس">
          <span>إصدار جديد من ساس متاح.</span>
          <button type="button" onClick={updateApp}>تحديث الآن</button>
        </aside>
      ) : eligible && updateStage === "idle" ? (
        <aside className="sas-pwa-banner" aria-label="تثبيت منصة ساس">
          {directInstallAvailable ? (
            <button type="button" className="sas-pwa-banner__install"
              disabled={installBusy} onClick={install}>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12m-4-4 4 4 4-4M4 17v3h16v-3"/>
              </svg>
              تثبيت ساس
            </button>
          ) : (
            <button type="button" className="sas-pwa-banner__install"
              onClick={() => setShowGuide(true)}>إضافة ساس إلى الهاتف</button>
          )}
          <button type="button" className="sas-pwa-banner__close"
            aria-label="إخفاء عرض التثبيت" onClick={dismiss}>×</button>
        </aside>
      ) : null}

      {updateStage !== "idle" && (
        <div className="sas-pwa-guide-backdrop">
          <section className="sas-pwa-guide sas-pwa-updating" role="dialog"
            aria-modal="true" aria-labelledby="sas-pwa-update-title" dir="rtl"
            aria-busy={updateStage !== "error"}>
            {updateStage !== "error" && <span className="sas-pwa-spinner" aria-hidden="true" />}
            <h2 id="sas-pwa-update-title">
              {updateStage === "error" ? "تعذّر إكمال التحديث" : "جارٍ تحديث تطبيق ساس"}
            </h2>
            <p aria-live="polite">
              {updateStage === "activating"
                ? "يجري تفعيل الإصدار الجديد…"
                : updateStage === "reloading"
                  ? "تم تفعيل الإصدار. يجري فتح النسخة الجديدة…"
                  : "لم يصل تأكيد التفعيل. يمكنك إعادة المحاولة دون فقدان المحتوى."}
            </p>
            {updateStage === "error" && (
              <div className="sas-pwa-update-actions">
                <button type="button" className="sas-pwa-guide__done"
                  onClick={updateApp}>إعادة المحاولة</button>
                <button type="button" className="sas-pwa-guide__secondary"
                  onClick={() => setUpdateStage("idle")}>لاحقًا</button>
              </div>
            )}
          </section>
        </div>
      )}

      {showGuide && updateStage === "idle" && (
        <div className="sas-pwa-guide-backdrop" onClick={e => {
          if (e.target === e.currentTarget) setShowGuide(false);
        }}>
          <section className="sas-pwa-guide" role="dialog" aria-modal="true"
            aria-labelledby="sas-pwa-guide-title" dir="rtl">
            <button type="button" className="sas-pwa-guide__close" aria-label="إغلاق"
              onClick={() => setShowGuide(false)}>×</button>
            <h2 id="sas-pwa-guide-title">إضافة ساس إلى هاتفك</h2>
            {platform === "ios-inapp" ? (
              <p>افتح الصفحة في Safari من خيارات المتصفح الداخلي، ثم اختر المشاركة وإضافة إلى الشاشة الرئيسية.</p>
            ) : platform === "ios" ? (
              <ol>
                <li>اضغط زر المشاركة في المتصفح.</li>
                <li>اختر «إضافة إلى الشاشة الرئيسية».</li>
                <li>اختر «إضافة»، ثم افتح ساس من شاشة الهاتف.</li>
              </ol>
            ) : (
              <p>افتح الصفحة في Chrome أو متصفح Android مناسب، ثم استخدم زر التثبيت عندما يصبح التطبيق مؤهلًا.</p>
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

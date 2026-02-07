"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSession, onAuthStateChange, signInWithGoogle, signOut } from "@/lib/supabase/auth";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";
import { t, tWithParams } from "@/lib/i18n";
import { getPreferredBrowserLabel, isInAppBrowser } from "@/lib/inapp";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const [inAppBrowser, setInAppBrowser] = useState(false);
  const [browserLabel, setBrowserLabel] = useState<string>("your browser");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = window.navigator.userAgent;
    setInAppBrowser(isInAppBrowser(ua));
    setBrowserLabel(getPreferredBrowserLabel(ua));
    setCurrentUrl(window.location.href);
  }, []);

  useEffect(() => {
    let mounted = true;

    getSession()
      .then((current) => {
        if (mounted) {
          setSession(current);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    const { data } = onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
        <div className="text-lg font-medium">{t(language, "loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
        <div className="max-w-md rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-semibold">{t(language, "errorTitle")}</p>
          <p className="mt-2 text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">{t(language, "signInTitle")}</h1>
          <p className="mt-2 text-secondary">
            {t(language, "signInBody")}
          </p>
          {inAppBrowser && (
            <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-secondary text-amber-900">
              {tWithParams(language, "inAppWarning", { browser: browserLabel })}
            </div>
          )}
          <button
            className="mt-6 w-full rounded-full bg-slate-900 px-6 py-3 text-lg font-semibold text-white hover:bg-slate-800"
            onClick={() => signInWithGoogle()}
          >
            {t(language, "signInButton")}
          </button>
          {inAppBrowser && (
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <button
                className="w-full rounded-full border border-slate-300 px-4 py-2 text-base font-semibold text-slate-700 hover:bg-slate-100"
                onClick={() => {
                  setActionMessage(null);
                  const opened = window.open(window.location.href, "_blank", "noopener,noreferrer");
                  if (!opened) {
                    setActionMessage(t(language, "openFailed"));
                  }
                }}
              >
                {t(language, "openInBrowser")}
              </button>
              <button
                className="w-full rounded-full border border-slate-200 px-4 py-2 text-base font-semibold text-slate-700 hover:bg-slate-50"
                onClick={async () => {
                  setActionMessage(null);
                  try {
                    if (navigator.share) {
                      await navigator.share({ url: currentUrl });
                      setActionMessage(t(language, "linkCopied"));
                      return;
                    }
                    if (navigator.clipboard?.writeText) {
                      await navigator.clipboard.writeText(currentUrl);
                      setActionMessage(t(language, "linkCopied"));
                      return;
                    }
                    throw new Error("Clipboard not available");
                  } catch {
                    setActionMessage(t(language, "linkCopyFailed"));
                  }
                }}
              >
                {t(language, "copyLink")}
              </button>
              {actionMessage && (
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-secondary text-slate-700">
                  {actionMessage}
                </div>
              )}
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left">
                <p className="text-secondary">{t(language, "linkHelp")}</p>
                <input
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  value={currentUrl}
                  readOnly
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-6">
        <LanguageToggle />
        <button
          className="rounded-full border border-slate-300 px-4 py-2 text-base font-semibold text-slate-700 hover:bg-slate-100"
          onClick={() => signOut()}
        >
          {t(language, "signOut")}
        </button>
      </div>
      {children}
    </div>
  );
}

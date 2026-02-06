"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSession, onAuthStateChange, signInWithGoogle, signOut } from "@/lib/supabase/auth";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

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
          <button
            className="mt-6 w-full rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white hover:bg-slate-800"
            onClick={() => signInWithGoogle()}
          >
            {t(language, "signInButton")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-6">
        <LanguageToggle />
        <button
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          onClick={() => signOut()}
        >
          {t(language, "signOut")}
        </button>
      </div>
      {children}
    </div>
  );
}

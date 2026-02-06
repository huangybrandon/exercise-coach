"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { SupportedLanguage } from "@/lib/types";
import { getSession } from "@/lib/supabase/auth";
import { getProfile, updateProfileLanguage } from "@/lib/data/profile";

type LanguageContextValue = {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  loading: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const session = await getSession();
        const id = session?.user?.id ?? null;
        if (!mounted) return;
        setUserId(id);

        if (!id) {
          setLoading(false);
          return;
        }

        const profile = await getProfile(id);
        if (!mounted) return;

        if (profile?.language) {
          setLanguageState(profile.language);
        }
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const setLanguage = async (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (!userId) return;
    await updateProfileLanguage({ userId, language: lang });
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      loading,
    }),
    [language, loading]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

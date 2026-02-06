"use client";

import { useLanguage } from "@/components/LanguageProvider";
import type { SupportedLanguage } from "@/lib/types";

const OPTIONS: { label: string; value: SupportedLanguage }[] = [
  { label: "EN", value: "en" },
  { label: "中文", value: "zh-TW" },
];

export default function LanguageToggle() {
  const { language, setLanguage, loading } = useLanguage();

  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 shadow-sm">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={loading}
          onClick={() => setLanguage(option.value)}
          className={`rounded-full px-3 py-1 transition ${
            language === option.value
              ? "bg-emerald-700 text-white"
              : "text-slate-600 hover:bg-slate-100"
          } ${loading ? "opacity-60" : ""}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

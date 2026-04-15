"use client";

import { useLocale } from "@/lib/use-locale";
import { setLocale } from "@/lib/i18n";

export default function LocaleToggle() {
  const locale = useLocale();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "zh" : "en")}
      className="text-xs text-neutral-400 hover:text-neutral-600 px-2 py-1 rounded-md border border-neutral-200"
    >
      {locale === "en" ? "中文" : "EN"}
    </button>
  );
}

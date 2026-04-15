"use client";

import { useSyncExternalStore } from "react";
import { getLocale, subscribeLocale, Locale } from "./i18n";

export function useLocale(): Locale {
  return useSyncExternalStore(subscribeLocale, getLocale, () => "en" as Locale);
}

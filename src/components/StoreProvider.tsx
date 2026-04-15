"use client";

import { useEffect } from "react";
import { initStore } from "@/lib/store";
import { useStore } from "@/lib/use-store";
import { t } from "@/lib/i18n";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    initStore();
  }, []);

  const store = useStore();

  if (!store.loaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-neutral-400 text-sm">{t("misc.loading")}</p>
      </div>
    );
  }

  return <>{children}</>;
}

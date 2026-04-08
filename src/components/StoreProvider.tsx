"use client";

import { useEffect } from "react";
import { initStore } from "@/lib/store";
import { useStore } from "@/lib/use-store";

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
        <p className="text-stone-400 text-sm">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createGroup, joinGroup } from "@/lib/store";
import { useStore } from "@/lib/use-store";
import { t } from "@/lib/i18n";
import { useLocale } from "@/lib/use-locale";
import LocaleToggle from "@/components/LocaleToggle";

export default function LandingPage() {
  const router = useRouter();
  const store = useStore();
  const locale = useLocale(); // triggers re-render on locale change
  const [mode, setMode] = useState<"choice" | "create" | "join">("choice");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (store.currentGroupId && store.currentMemberId) {
      router.push("/home");
    }
  }, [store.currentGroupId, store.currentMemberId, router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !nickname.trim()) return;
    const result = await createGroup(name.trim(), nickname.trim());
    if (result) router.push("/home");
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteCode.trim() || !nickname.trim()) return;
    const result = await joinGroup(inviteCode.trim(), nickname.trim());
    if (!result) {
      setError(t("landing.invalidCode"));
      return;
    }
    router.push("/home");
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-xs">
        <div className="text-center mb-12">
          <div className="flex justify-end mb-4">
            <LocaleToggle />
          </div>
          <h1 className="text-2xl font-light tracking-wide text-neutral-800">
            {t("app.name")}
          </h1>
          <p className="text-neutral-400 mt-1.5 text-xs tracking-wide">
            {t("app.tagline")}
          </p>
        </div>

        {mode === "choice" && (
          <div className="space-y-2.5">
            <button
              onClick={() => setMode("create")}
              className="w-full py-2.5 px-4 text-[#2d5a3f] rounded-md font-normal border border-[#2d5a3f]/30 hover:bg-[#2d5a3f]/5 text-sm"
            >
              {t("landing.create")}
            </button>
            <button
              onClick={() => setMode("join")}
              className="w-full py-2.5 px-4 text-neutral-500 rounded-md font-normal border border-neutral-200 hover:border-neutral-300 text-sm"
            >
              {t("landing.join")}
            </button>
          </div>
        )}

        {mode === "create" && (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5 tracking-wide">
                {t("landing.groupName")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sophie's China Trips"
                className="w-full px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#2d5a3f]/50 placeholder:text-neutral-300"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5 tracking-wide">
                Your nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Sophie"
                className="w-full px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#2d5a3f]/50 placeholder:text-neutral-300"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMode("choice")}
                className="flex-1 py-2 px-4 text-neutral-400 rounded-md text-sm hover:text-neutral-600"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!name.trim() || !nickname.trim()}
                className="flex-1 py-2 px-4 text-[#2d5a3f] rounded-md text-sm border border-[#2d5a3f]/30 hover:bg-[#2d5a3f]/5 disabled:opacity-30"
              >
                Create
              </button>
            </div>
          </form>
        )}

        {mode === "join" && (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5 tracking-wide">
                Invite code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value.toUpperCase());
                  setError("");
                }}
                placeholder="e.g. X7K2M9"
                maxLength={6}
                className="w-full px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm font-mono text-center tracking-[0.3em] uppercase focus:outline-none focus:border-[#2d5a3f]/50 placeholder:text-neutral-300"
                autoFocus
              />
              {error && (
                <p className="text-red-400 text-xs mt-1.5">{error}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5 tracking-wide">
                Your nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#2d5a3f]/50 placeholder:text-neutral-300"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setMode("choice"); setError(""); }}
                className="flex-1 py-2 px-4 text-neutral-400 rounded-md text-sm hover:text-neutral-600"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={inviteCode.length < 6 || !nickname.trim()}
                className="flex-1 py-2 px-4 text-[#2d5a3f] rounded-md text-sm border border-[#2d5a3f]/30 hover:bg-[#2d5a3f]/5 disabled:opacity-30"
              >
                Join
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

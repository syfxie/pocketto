"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createGroup, joinGroup } from "@/lib/store";
import { useStore } from "@/lib/use-store";

export default function LandingPage() {
  const router = useRouter();
  const store = useStore();
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
      setError("Invalid invite code. Check and try again.");
      return;
    }
    router.push("/home");
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">Pocketto</h1>
          <p className="text-stone-500 mt-2 text-sm">
            Your pocket-sized trip planner
          </p>
        </div>

        {mode === "choice" && (
          <div className="space-y-3">
            <button
              onClick={() => setMode("create")}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 active:scale-[0.98]"
            >
              Create a new group
            </button>
            <button
              onClick={() => setMode("join")}
              className="w-full py-3 px-4 bg-white text-stone-700 rounded-lg font-medium border border-stone-200 hover:bg-stone-50 active:scale-[0.98]"
            >
              Join with invite code
            </button>
          </div>
        )}

        {mode === "create" && (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">
                Group name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sophie's China Trips"
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">
                Your nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Sophie"
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setMode("choice")}
                className="flex-1 py-2.5 px-4 text-stone-600 rounded-lg font-medium border border-stone-200 hover:bg-stone-50 text-sm"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!name.trim() || !nickname.trim()}
                className="flex-1 py-2.5 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                Create
              </button>
            </div>
          </form>
        )}

        {mode === "join" && (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">
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
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-sm font-mono text-center tracking-[0.3em] uppercase focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                autoFocus
              />
              {error && (
                <p className="text-red-500 text-xs mt-1.5">{error}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">
                Your nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setMode("choice"); setError(""); }}
                className="flex-1 py-2.5 px-4 text-stone-600 rounded-lg font-medium border border-stone-200 hover:bg-stone-50 text-sm"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={inviteCode.length < 6 || !nickname.trim()}
                className="flex-1 py-2.5 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
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

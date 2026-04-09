"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCity, usePlaces, useCurrentGroup } from "@/lib/use-store";
import { createPlace, createSource } from "@/lib/store";
import { parseSourceUrl } from "@/lib/url-parser";
import { CATEGORY_CONFIG, PLATFORM_CONFIG, VIBE_CONFIG } from "@/lib/constants";
import { Category, RatingVibe } from "@/lib/types";
import { showToast } from "@/components/Toast";

interface ImportItem {
  id: string;
  url: string;
  platform: string;
  author: string | null;
  // Assignment
  mode: "new" | "existing";
  placeName: string;
  existingPlaceId: string | null;
  category: Category;
  keyTakeaway: string;
  ratingVibe: RatingVibe;
  // State
  saved: boolean;
}

function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"')\]]+/g;
  const matches = text.match(urlRegex) || [];
  // Deduplicate
  return [...new Set(matches)];
}

export default function ImportPage() {
  const params = useParams();
  const router = useRouter();
  const cityId = params.id as string;
  const city = useCity(cityId);
  const places = usePlaces(cityId);
  const { member } = useCurrentGroup();

  const [rawText, setRawText] = useState("");
  const [items, setItems] = useState<ImportItem[]>([]);
  const [step, setStep] = useState<"paste" | "assign">("paste");
  const [saving, setSaving] = useState(false);

  if (!city || !member) return null;

  function handleExtract() {
    const urls = extractUrls(rawText);
    if (urls.length === 0) {
      showToast("No URLs found");
      return;
    }
    const newItems: ImportItem[] = urls.map((url) => {
      const parsed = parseSourceUrl(url);
      return {
        id: crypto.randomUUID(),
        url,
        platform: parsed.platform,
        author: parsed.author,
        mode: "new",
        placeName: "",
        existingPlaceId: null,
        category: "dinner" as Category,
        keyTakeaway: "",
        ratingVibe: "recommended" as RatingVibe,
        saved: false,
      };
    });
    setItems(newItems);
    setStep("assign");
  }

  function updateItem(id: string, updates: Partial<ImportItem>) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleSaveAll() {
    setSaving(true);
    let count = 0;

    for (const item of items) {
      if (item.saved) continue;

      let placeId: string | null = null;

      if (item.mode === "existing" && item.existingPlaceId) {
        placeId = item.existingPlaceId;
      } else if (item.mode === "new" && item.placeName.trim()) {
        const place = await createPlace(cityId, member!.id, {
          name: item.placeName.trim(),
          category: item.category,
          priority: "want_to",
        });
        if (place) placeId = place.id;
      }

      if (placeId) {
        await createSource(placeId, member!.id, {
          platform: item.platform as any,
          url: item.url,
          author: item.author,
          key_takeaway: item.keyTakeaway.trim() || null,
          rating_vibe: item.ratingVibe,
        });
        updateItem(item.id, { saved: true });
        count++;
      }
    }

    setSaving(false);
    showToast(`Saved ${count} ${count === 1 ? "source" : "sources"}`);
  }

  const unsavedCount = items.filter((i) => !i.saved).length;
  const readyCount = items.filter(
    (i) =>
      !i.saved &&
      ((i.mode === "new" && i.placeName.trim()) ||
        (i.mode === "existing" && i.existingPlaceId))
  ).length;

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-neutral-100 bg-white px-6 py-4">
        <button
          onClick={() => router.push(`/city/${cityId}`)}
          className="text-neutral-400 hover:text-neutral-600 text-sm mb-1"
        >
          &larr; {city.name}
        </button>
        <h1 className="text-lg font-medium">Bulk Import</h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Paste links or text containing URLs
        </p>
      </header>

      {step === "paste" && (
        <div className="max-w-2xl mx-auto w-full px-6 py-8">
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={"Paste URLs here (one per line), or paste text with links embedded...\n\nhttps://www.xiaohongshu.com/explore/...\nhttps://www.tiktok.com/@user/video/...\nhttps://www.instagram.com/p/..."}
            className="w-full px-4 py-3 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50 placeholder:text-neutral-300 min-h-[200px] resize-y font-mono"
            autoFocus
          />
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-neutral-400">
              {extractUrls(rawText).length} URLs detected
            </span>
            <button
              onClick={handleExtract}
              disabled={extractUrls(rawText).length === 0}
              className="text-sm px-4 py-2 text-[#2d5a3f] border border-[#2d5a3f]/30 rounded-md hover:bg-[#2d5a3f]/5 disabled:opacity-30"
            >
              Extract &amp; assign
            </button>
          </div>
        </div>
      )}

      {step === "assign" && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto w-full px-6 py-6">
            {/* Summary bar */}
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#fafafa] py-2 z-10">
              <span className="text-xs text-neutral-500">
                {items.length} links · {readyCount} ready · {items.filter((i) => i.saved).length} saved
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setStep("paste"); setItems([]); }}
                  className="text-xs text-neutral-400 hover:text-neutral-600 px-3 py-1.5"
                >
                  Start over
                </button>
                <button
                  onClick={handleSaveAll}
                  disabled={readyCount === 0 || saving}
                  className="text-sm px-4 py-1.5 text-[#2d5a3f] border border-[#2d5a3f]/30 rounded-md hover:bg-[#2d5a3f]/5 disabled:opacity-30"
                >
                  {saving ? "Saving..." : `Save ${readyCount}`}
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-md p-4 ${
                    item.saved
                      ? "border-[#2d5a3f]/20 bg-[#f2f7f4] opacity-60"
                      : "border-neutral-200 bg-white"
                  }`}
                >
                  {/* URL + platform */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        PLATFORM_CONFIG[item.platform as keyof typeof PLATFORM_CONFIG]?.color || "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {PLATFORM_CONFIG[item.platform as keyof typeof PLATFORM_CONFIG]?.icon}{" "}
                      {PLATFORM_CONFIG[item.platform as keyof typeof PLATFORM_CONFIG]?.label || "Link"}
                    </span>
                    {item.author && (
                      <span className="text-xs text-neutral-400">{item.author}</span>
                    )}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-neutral-300 hover:text-neutral-500 truncate ml-auto"
                    >
                      {item.url}
                    </a>
                    {!item.saved && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-neutral-300 hover:text-red-400 text-xs ml-1"
                      >
                        &times;
                      </button>
                    )}
                  </div>

                  {item.saved ? (
                    <p className="text-xs text-[#2d5a3f]">Saved</p>
                  ) : (
                    <div className="space-y-2">
                      {/* Mode toggle */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateItem(item.id, { mode: "new", existingPlaceId: null })}
                          className={`text-xs px-2.5 py-1 rounded-full border ${
                            item.mode === "new"
                              ? "border-[#2d5a3f]/40 bg-[#2d5a3f]/10 text-[#2d5a3f]"
                              : "border-neutral-200 text-neutral-400"
                          }`}
                        >
                          New place
                        </button>
                        <button
                          onClick={() => updateItem(item.id, { mode: "existing" })}
                          className={`text-xs px-2.5 py-1 rounded-full border ${
                            item.mode === "existing"
                              ? "border-[#2d5a3f]/40 bg-[#2d5a3f]/10 text-[#2d5a3f]"
                              : "border-neutral-200 text-neutral-400"
                          }`}
                        >
                          Existing
                        </button>
                      </div>

                      {item.mode === "new" ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={item.placeName}
                            onChange={(e) => updateItem(item.id, { placeName: e.target.value })}
                            placeholder="Place name"
                            className="flex-1 px-2.5 py-1.5 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50 placeholder:text-neutral-300"
                          />
                          <select
                            value={item.category}
                            onChange={(e) => updateItem(item.id, { category: e.target.value as Category })}
                            className="text-xs text-neutral-500 border border-neutral-200 rounded-md px-2 focus:outline-none"
                          >
                            {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => (
                              <option key={cat} value={cat}>
                                {CATEGORY_CONFIG[cat].emoji} {CATEGORY_CONFIG[cat].label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <select
                          value={item.existingPlaceId || ""}
                          onChange={(e) => updateItem(item.id, { existingPlaceId: e.target.value || null })}
                          className="w-full text-sm border border-neutral-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#2d5a3f]/50"
                        >
                          <option value="">Select a place...</option>
                          {places.map((p) => (
                            <option key={p.id} value={p.id}>
                              {CATEGORY_CONFIG[p.category]?.emoji} {p.name}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Takeaway + vibe */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={item.keyTakeaway}
                          onChange={(e) => updateItem(item.id, { keyTakeaway: e.target.value })}
                          placeholder="Key takeaway (optional)"
                          className="flex-1 px-2.5 py-1.5 rounded-md border border-neutral-200 text-xs focus:outline-none focus:border-[#2d5a3f]/50 placeholder:text-neutral-300"
                        />
                        <select
                          value={item.ratingVibe}
                          onChange={(e) => updateItem(item.id, { ratingVibe: e.target.value as RatingVibe })}
                          className="text-xs text-neutral-500 border border-neutral-200 rounded-md px-2 focus:outline-none"
                        >
                          {(Object.keys(VIBE_CONFIG) as RatingVibe[]).map((v) => (
                            <option key={v} value={v}>
                              {VIBE_CONFIG[v].emoji} {VIBE_CONFIG[v].label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

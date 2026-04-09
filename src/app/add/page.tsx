"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useStore, useCurrentGroup } from "@/lib/use-store";
import { createPlace, createSource } from "@/lib/store";
import { parseSourceUrl } from "@/lib/url-parser";
import { CATEGORY_CONFIG, PRIORITY_CONFIG, VIBE_CONFIG } from "@/lib/constants";
import { Category, Priority, RatingVibe, Platform } from "@/lib/types";
import { showToast } from "@/components/Toast";

export default function QuickAddPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const store = useStore();
  const { group, member } = useCurrentGroup();

  // Pre-fill from URL params (from share target or manual link)
  const sharedUrl = searchParams.get("url") || searchParams.get("text") || "";
  const sharedTitle = searchParams.get("title") || "";

  // Parse shared URL
  const parsed = useMemo(
    () => (sharedUrl ? parseSourceUrl(sharedUrl) : null),
    [sharedUrl]
  );

  const [url, setUrl] = useState(sharedUrl);
  const [platform, setPlatform] = useState<Platform>(parsed?.platform || "other");
  const [author, setAuthor] = useState(parsed?.author || "");
  const [keyTakeaway, setKeyTakeaway] = useState("");
  const [ratingVibe, setRatingVibe] = useState<RatingVibe>("recommended");

  // Place selection: existing or new
  const [mode, setMode] = useState<"pick" | "new">("new");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [placeName, setPlaceName] = useState(sharedTitle);
  const [cityId, setCityId] = useState<string>("");
  const [category, setCategory] = useState<Category>("dinner");
  const [priority, setPriority] = useState<Priority>("want_to");
  const [placeSearch, setPlaceSearch] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Auto-select first city
  const cities = useMemo(() => {
    if (!group) return [];
    return store.cities
      .filter((c) => c.group_id === group.id)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [store.cities, group]);

  useEffect(() => {
    if (cities.length > 0 && !cityId) {
      setCityId(cities[0].id);
    }
  }, [cities, cityId]);

  // Places in selected city for autocomplete
  const cityPlaces = useMemo(() => {
    if (!cityId) return [];
    const places = store.places.filter((p) => p.city_id === cityId);
    if (!placeSearch.trim()) return places;
    const q = placeSearch.toLowerCase();
    return places.filter((p) => p.name.toLowerCase().includes(q));
  }, [store.places, cityId, placeSearch]);

  // Update parsed fields when URL changes
  useEffect(() => {
    if (!url) return;
    const p = parseSourceUrl(url);
    setPlatform(p.platform);
    if (p.author) setAuthor(p.author);
  }, [url]);

  if (!group || !member) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-neutral-500 text-sm mb-4">
            You need to join a group first.
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-[#2d5a3f] hover:text-[#234a33]"
          >
            Go to home
          </button>
        </div>
      </div>
    );
  }

  if (cities.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-neutral-500 text-sm mb-4">
            Add a city first before saving places.
          </p>
          <button
            onClick={() => router.push("/home")}
            className="text-sm text-[#2d5a3f] hover:text-[#234a33]"
          >
            Go to cities
          </button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || submitting) return;
    setSubmitting(true);

    let targetPlaceId = selectedPlaceId;

    // Create new place if needed
    if (mode === "new" && placeName.trim()) {
      const place = await createPlace(cityId, member!.id, {
        name: placeName.trim(),
        category,
        priority,
      });
      if (place) targetPlaceId = place.id;
    }

    // Add source
    if (targetPlaceId) {
      await createSource(targetPlaceId, member!.id, {
        platform,
        url: url.trim(),
        author: author.trim() || null,
        key_takeaway: keyTakeaway.trim() || null,
        rating_vibe: ratingVibe,
      });
    }

    setSubmitting(false);
    setDone(true);
    showToast("Saved!");
  }

  if (done) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg mb-1">Saved</p>
          <p className="text-neutral-400 text-sm mb-6">
            {placeName || "Source added"}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setDone(false);
                setUrl("");
                setPlaceName("");
                setKeyTakeaway("");
                setSelectedPlaceId(null);
                setMode("new");
              }}
              className="text-sm text-[#2d5a3f] border border-[#2d5a3f]/30 px-4 py-2 rounded-md hover:bg-[#2d5a3f]/5"
            >
              Add another
            </button>
            <button
              onClick={() => router.push(`/city/${cityId}`)}
              className="text-sm text-neutral-500 px-4 py-2 rounded-md hover:text-neutral-700"
            >
              View city
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Minimal header */}
      <header className="border-b border-neutral-100 bg-white px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push("/home")}
          className="text-neutral-400 hover:text-neutral-600 text-sm"
        >
          &larr;
        </button>
        <span className="text-sm font-medium text-neutral-600">Quick Add</span>
        <div className="w-8" />
      </header>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-4 py-6 space-y-5">
          {/* URL */}
          <div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste link..."
              className="w-full px-3 py-2.5 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50 placeholder:text-neutral-300"
              autoFocus={!sharedUrl}
            />
            {parsed && parsed.platform !== "other" && (
              <p className="text-xs text-[#2d5a3f]/70 mt-1">
                {parsed.platform === "tiktok" && "TikTok"}
                {parsed.platform === "rednote" && "RedNote"}
                {parsed.platform === "instagram" && "Instagram"}
                {parsed.platform === "youtube" && "YouTube"}
                {parsed.author && ` · ${parsed.author}`}
              </p>
            )}
          </div>

          {/* City picker */}
          <div>
            <label className="block text-xs text-neutral-400 mb-1.5">City</label>
            <div className="flex gap-2 flex-wrap">
              {cities.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCityId(c.id);
                    setSelectedPlaceId(null);
                    setMode("new");
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full border ${
                    cityId === c.id
                      ? "border-[#2d5a3f]/40 bg-[#2d5a3f]/10 text-[#2d5a3f]"
                      : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mode: existing place or new */}
          <div>
            <label className="block text-xs text-neutral-400 mb-1.5">Place</label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => { setMode("new"); setSelectedPlaceId(null); }}
                className={`text-xs px-3 py-1.5 rounded-full border ${
                  mode === "new"
                    ? "border-[#2d5a3f]/40 bg-[#2d5a3f]/10 text-[#2d5a3f]"
                    : "border-neutral-200 text-neutral-500"
                }`}
              >
                New place
              </button>
              <button
                type="button"
                onClick={() => setMode("pick")}
                className={`text-xs px-3 py-1.5 rounded-full border ${
                  mode === "pick"
                    ? "border-[#2d5a3f]/40 bg-[#2d5a3f]/10 text-[#2d5a3f]"
                    : "border-neutral-200 text-neutral-500"
                }`}
              >
                Existing place
              </button>
            </div>

            {mode === "new" ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  placeholder="Place name"
                  className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50 placeholder:text-neutral-300"
                />
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(CATEGORY_CONFIG) as Category[]).slice(0, 12).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`text-xs px-2 py-1 rounded-full border ${
                        category === cat
                          ? "border-[#2d5a3f]/40 bg-[#f2f7f4] text-[#2d5a3f]"
                          : "border-neutral-200 text-neutral-400"
                      }`}
                    >
                      {CATEGORY_CONFIG[cat].emoji} {CATEGORY_CONFIG[cat].label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={placeSearch}
                  onChange={(e) => setPlaceSearch(e.target.value)}
                  placeholder="Search places..."
                  className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50 placeholder:text-neutral-300 mb-2"
                />
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {cityPlaces.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlaceId(p.id);
                        setPlaceName(p.name);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedPlaceId === p.id
                          ? "bg-[#2d5a3f]/10 text-[#2d5a3f]"
                          : "hover:bg-neutral-50 text-neutral-600"
                      }`}
                    >
                      {CATEGORY_CONFIG[p.category]?.emoji} {p.name}
                    </button>
                  ))}
                  {cityPlaces.length === 0 && (
                    <p className="text-xs text-neutral-400 py-4 text-center">
                      No places found
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Key takeaway */}
          <div>
            <label className="block text-xs text-neutral-400 mb-1.5">
              Key takeaway
            </label>
            <input
              type="text"
              value={keyTakeaway}
              onChange={(e) => setKeyTakeaway(e.target.value)}
              placeholder="What's the tip? (optional)"
              className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50 placeholder:text-neutral-300"
            />
          </div>

          {/* Vibe */}
          <div>
            <label className="block text-xs text-neutral-400 mb-1.5">Vibe</label>
            <div className="flex gap-2">
              {(Object.keys(VIBE_CONFIG) as RatingVibe[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setRatingVibe(v)}
                  className={`text-xs px-3 py-1.5 rounded-full border ${
                    ratingVibe === v
                      ? "border-[#2d5a3f]/40 bg-[#f2f7f4] text-[#2d5a3f]"
                      : "border-neutral-200 text-neutral-400"
                  }`}
                >
                  {VIBE_CONFIG[v].emoji} {VIBE_CONFIG[v].label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!url.trim() || (mode === "new" && !placeName.trim()) || (mode === "pick" && !selectedPlaceId) || submitting}
            className="w-full py-2.5 text-[#2d5a3f] border border-[#2d5a3f]/30 rounded-md text-sm hover:bg-[#2d5a3f]/5 disabled:opacity-30"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

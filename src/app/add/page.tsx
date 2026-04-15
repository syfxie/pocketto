"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useStore, useCurrentGroup } from "@/lib/use-store";
import { createPlace, createSource } from "@/lib/store";
import { parseSourceUrl } from "@/lib/url-parser";
import { CATEGORY_CONFIG, VIBE_CONFIG } from "@/lib/constants";
import { Category, RatingVibe, Platform } from "@/lib/types";
import { showToast } from "@/components/Toast";
import { t } from "@/lib/i18n";

export default function QuickAddPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const store = useStore();
  const { group, member } = useCurrentGroup();

  const sharedUrl = searchParams.get("url") || searchParams.get("text") || "";
  const sharedTitle = searchParams.get("title") || "";
  const parsed = useMemo(() => (sharedUrl ? parseSourceUrl(sharedUrl) : null), [sharedUrl]);

  const [url, setUrl] = useState(sharedUrl);
  const [platform, setPlatform] = useState<Platform>(parsed?.platform || "other");
  const [author, setAuthor] = useState(parsed?.author || "");
  const [keyTakeaway, setKeyTakeaway] = useState("");
  const [ratingVibe, setRatingVibe] = useState<RatingVibe>("recommended");
  const [mode, setMode] = useState<"pick" | "new">("new");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [placeName, setPlaceName] = useState(sharedTitle);
  const [cityId, setCityId] = useState<string>("");
  const [category, setCategory] = useState<Category>("dinner");
  const [placeSearch, setPlaceSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const cities = useMemo(() => {
    if (!group) return [];
    return store.cities.filter((c) => c.group_id === group.id).sort((a, b) => a.sort_order - b.sort_order);
  }, [store.cities, group]);

  useEffect(() => { if (cities.length > 0 && !cityId) setCityId(cities[0].id); }, [cities, cityId]);

  const cityPlaces = useMemo(() => {
    if (!cityId) return [];
    const places = store.places.filter((p) => p.city_id === cityId);
    if (!placeSearch.trim()) return places;
    const q = placeSearch.toLowerCase();
    return places.filter((p) => p.name.toLowerCase().includes(q));
  }, [store.places, cityId, placeSearch]);

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
          <p className="text-neutral-500 text-sm mb-4">{t("quickAdd.joinFirst")}</p>
          <button onClick={() => router.push("/")} className="text-sm text-[#2d5a3f] hover:text-[#234a33]">{t("quickAdd.goHome")}</button>
        </div>
      </div>
    );
  }

  if (cities.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-neutral-500 text-sm mb-4">{t("quickAdd.addCityFirst")}</p>
          <button onClick={() => router.push("/home")} className="text-sm text-[#2d5a3f] hover:text-[#234a33]">{t("quickAdd.goCities")}</button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || submitting) return;
    setSubmitting(true);
    let targetPlaceId = selectedPlaceId;
    if (mode === "new" && placeName.trim()) {
      const place = await createPlace(cityId, member!.id, { name: placeName.trim(), category, priority: "want_to" });
      if (place) targetPlaceId = place.id;
    }
    if (targetPlaceId) {
      await createSource(targetPlaceId, member!.id, {
        platform, url: url.trim(), author: author.trim() || null,
        key_takeaway: keyTakeaway.trim() || null, rating_vibe: ratingVibe,
      });
    }
    setSubmitting(false);
    setDone(true);
    showToast(t("quickAdd.saved"));
  }

  if (done) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg mb-1">{t("quickAdd.saved")}</p>
          <p className="text-neutral-400 text-sm mb-6">{placeName || ""}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setDone(false); setUrl(""); setPlaceName(""); setKeyTakeaway(""); setSelectedPlaceId(null); setMode("new"); }}
              className="text-sm text-[#2d5a3f] border border-[#2d5a3f]/30 px-4 py-2 rounded-md hover:bg-[#2d5a3f]/5">{t("quickAdd.addAnother")}</button>
            <button onClick={() => router.push(`/city/${cityId}`)}
              className="text-sm text-neutral-500 px-4 py-2 rounded-md hover:text-neutral-700">{t("quickAdd.viewCity")}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-neutral-100 bg-white px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.push("/home")} className="text-neutral-400 hover:text-neutral-600 text-sm">&larr;</button>
        <span className="text-sm font-medium text-neutral-600">{t("quickAdd.title")}</span>
        <div className="w-8" />
      </header>
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-4 py-6 space-y-5">
          <div>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder={t("quickAdd.paste")}
              className="w-full px-3 py-2.5 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50 placeholder:text-neutral-300" autoFocus={!sharedUrl} />
            {parsed && parsed.platform !== "other" && (
              <p className="text-xs text-[#2d5a3f]/70 mt-1">
                {parsed.platform === "tiktok" && "TikTok"}{parsed.platform === "rednote" && "RedNote"}{parsed.platform === "instagram" && "Instagram"}{parsed.platform === "youtube" && "YouTube"}
                {parsed.author && ` · ${parsed.author}`}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1.5">{t("quickAdd.city")}</label>
            <div className="flex gap-2 flex-wrap">
              {cities.map((c) => (
                <button key={c.id} type="button" onClick={() => { setCityId(c.id); setSelectedPlaceId(null); setMode("new"); }}
                  className={`text-xs px-3 py-1.5 rounded-full border ${cityId === c.id ? "border-[#2d5a3f]/40 bg-[#2d5a3f]/10 text-[#2d5a3f]" : "border-neutral-200 text-neutral-500 hover:border-neutral-300"}`}>{c.name}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1.5">{t("quickAdd.place")}</label>
            <div className="flex gap-2 mb-3">
              <button type="button" onClick={() => { setMode("new"); setSelectedPlaceId(null); }}
                className={`text-xs px-3 py-1.5 rounded-full border ${mode === "new" ? "border-[#2d5a3f]/40 bg-[#2d5a3f]/10 text-[#2d5a3f]" : "border-neutral-200 text-neutral-500"}`}>{t("quickAdd.newPlace")}</button>
              <button type="button" onClick={() => setMode("pick")}
                className={`text-xs px-3 py-1.5 rounded-full border ${mode === "pick" ? "border-[#2d5a3f]/40 bg-[#2d5a3f]/10 text-[#2d5a3f]" : "border-neutral-200 text-neutral-500"}`}>{t("quickAdd.existing")}</button>
            </div>
            {mode === "new" ? (
              <div className="space-y-3">
                <input type="text" value={placeName} onChange={(e) => setPlaceName(e.target.value)} placeholder={t("quickAdd.placeName")}
                  className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50 placeholder:text-neutral-300" />
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(CATEGORY_CONFIG) as Category[]).slice(0, 12).map((cat) => (
                    <button key={cat} type="button" onClick={() => setCategory(cat)}
                      className={`text-xs px-2 py-1 rounded-full border ${category === cat ? "border-[#2d5a3f]/40 bg-[#f2f7f4] text-[#2d5a3f]" : "border-neutral-200 text-neutral-400"}`}>
                      {CATEGORY_CONFIG[cat].emoji} {CATEGORY_CONFIG[cat].label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <input type="text" value={placeSearch} onChange={(e) => setPlaceSearch(e.target.value)} placeholder={t("quickAdd.search")}
                  className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50 placeholder:text-neutral-300 mb-2" />
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {cityPlaces.map((p) => (
                    <button key={p.id} type="button" onClick={() => { setSelectedPlaceId(p.id); setPlaceName(p.name); }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm ${selectedPlaceId === p.id ? "bg-[#2d5a3f]/10 text-[#2d5a3f]" : "hover:bg-neutral-50 text-neutral-600"}`}>
                      {CATEGORY_CONFIG[p.category]?.emoji} {p.name}
                    </button>
                  ))}
                  {cityPlaces.length === 0 && <p className="text-xs text-neutral-400 py-4 text-center">{t("quickAdd.noPlaces")}</p>}
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1.5">{t("quickAdd.takeaway")}</label>
            <input type="text" value={keyTakeaway} onChange={(e) => setKeyTakeaway(e.target.value)} placeholder={t("quickAdd.tip")}
              className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50 placeholder:text-neutral-300" />
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1.5">{t("quickAdd.vibe")}</label>
            <div className="flex gap-2">
              {(Object.keys(VIBE_CONFIG) as RatingVibe[]).map((v) => (
                <button key={v} type="button" onClick={() => setRatingVibe(v)}
                  className={`text-xs px-3 py-1.5 rounded-full border ${ratingVibe === v ? "border-[#2d5a3f]/40 bg-[#f2f7f4] text-[#2d5a3f]" : "border-neutral-200 text-neutral-400"}`}>
                  {VIBE_CONFIG[v].emoji} {VIBE_CONFIG[v].label}
                </button>
              ))}
            </div>
          </div>
          <button type="submit"
            disabled={!url.trim() || (mode === "new" && !placeName.trim()) || (mode === "pick" && !selectedPlaceId) || submitting}
            className="w-full py-2.5 text-[#2d5a3f] border border-[#2d5a3f]/30 rounded-md text-sm hover:bg-[#2d5a3f]/5 disabled:opacity-30">
            {submitting ? t("quickAdd.saving") : t("quickAdd.save")}
          </button>
        </div>
      </form>
    </div>
  );
}

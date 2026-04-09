"use client";

import { useState } from "react";
import { createSource } from "@/lib/store";
import { parseSourceUrl, isDuplicateUrl } from "@/lib/url-parser";
import { PLATFORM_CONFIG, VIBE_CONFIG } from "@/lib/constants";
import { Platform, RatingVibe } from "@/lib/types";
import { showToast } from "@/components/Toast";

interface Props {
  placeId: string;
  memberId: string;
  existingUrls: string[];
  onDone: () => void;
}

export default function AddSourceForm({
  placeId,
  memberId,
  existingUrls,
  onDone,
}: Props) {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState<Platform>("other");
  const [author, setAuthor] = useState("");
  const [keyTakeaway, setKeyTakeaway] = useState("");
  const [ratingVibe, setRatingVibe] = useState<RatingVibe>("recommended");
  const [caption, setCaption] = useState("");
  const [dupWarning, setDupWarning] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);

  function handleUrlChange(value: string) {
    setUrl(value);
    setDupWarning(false);
    setAutoDetected(false);

    if (!value.trim()) return;

    // Check for duplicate
    if (isDuplicateUrl(existingUrls, value.trim())) {
      setDupWarning(true);
    }

    // Auto-detect platform and author
    try {
      const parsed = parseSourceUrl(value.trim());
      if (parsed.platform !== "other") {
        setPlatform(parsed.platform);
        setAutoDetected(true);
      }
      if (parsed.author) {
        setAuthor(parsed.author);
      }
    } catch {
      // ignore parse errors
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    await createSource(placeId, memberId, {
      platform,
      url: url.trim(),
      author: author.trim() || null,
      caption: caption.trim() || null,
      key_takeaway: keyTakeaway.trim() || null,
      rating_vibe: ratingVibe,
    });
    showToast("Source added");
    onDone();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-neutral-50 border border-neutral-200 rounded-md p-4 space-y-3"
    >
      {/* URL input */}
      <div>
        <input
          type="url"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="Paste link from TikTok, RedNote, Instagram..."
          className="w-full px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#2d5a3f]/50"
          autoFocus
        />
        {dupWarning && (
          <p className="text-amber-600 text-xs mt-1">
            This link may already be saved for this place.
          </p>
        )}
        {autoDetected && (
          <p className="text-[#2d5a3f] text-xs mt-1">
            Auto-detected: {PLATFORM_CONFIG[platform].label}
            {author && ` by ${author}`}
          </p>
        )}
      </div>

      {/* Platform + Author row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className="w-full px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#2d5a3f]/50"
          >
            {(Object.keys(PLATFORM_CONFIG) as Platform[]).map((p) => (
              <option key={p} value={p}>
                {PLATFORM_CONFIG[p].icon} {PLATFORM_CONFIG[p].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Author</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="@username"
            className="w-full px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#2d5a3f]/50"
          />
        </div>
      </div>

      {/* Key takeaway */}
      <div>
        <label className="block text-xs text-neutral-500 mb-1">
          Key takeaway
        </label>
        <input
          type="text"
          value={keyTakeaway}
          onChange={(e) => setKeyTakeaway(e.target.value)}
          placeholder="What's the main tip? e.g. 'Order the mapo tofu, skip the fish'"
          className="w-full px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#2d5a3f]/50"
        />
      </div>

      {/* Vibe */}
      <div>
        <label className="block text-xs text-neutral-500 mb-1">Vibe</label>
        <div className="flex gap-2">
          {(Object.keys(VIBE_CONFIG) as RatingVibe[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setRatingVibe(v)}
              className={`text-xs px-3 py-1.5 rounded-full border ${
                ratingVibe === v
                  ? "border-[#2d5a3f]/40 bg-[#f2f7f4] text-[#1a3628]"
                  : "border-neutral-200 text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {VIBE_CONFIG[v].emoji} {VIBE_CONFIG[v].label}
            </button>
          ))}
        </div>
      </div>

      {/* Caption (optional) */}
      <div>
        <label className="block text-xs text-neutral-500 mb-1">
          Caption / title (optional)
        </label>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Original post caption"
          className="w-full px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#2d5a3f]/50"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onDone}
          className="text-xs px-3 py-1.5 text-neutral-500 hover:text-neutral-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!url.trim()}
          className="text-xs px-4 py-1.5 text-[#2d5a3f] border border-[#2d5a3f]/30 rounded-md font-medium hover:bg-[#2d5a3f]/5 disabled:opacity-40"
        >
          Add source
        </button>
      </div>
    </form>
  );
}

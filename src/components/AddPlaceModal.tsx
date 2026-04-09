"use client";

import { useState } from "react";
import { createPlace, createSource } from "@/lib/store";
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from "@/lib/constants";
import { Category, Priority, FoodCategory, ActivityCategory } from "@/lib/types";
import { parseSourceUrl } from "@/lib/url-parser";
import { showToast } from "@/components/Toast";

interface Props {
  cityId: string;
  memberId: string;
  onClose: () => void;
}

const FOOD_CATEGORIES: FoodCategory[] = [
  "breakfast", "brunch", "lunch", "dinner", "hotpot", "bbq",
  "street_food", "noodles", "dumplings", "cafe", "tea_house",
  "bar", "dessert", "ice_cream", "bakery", "bubble_tea",
];

const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  "tourist", "temple", "museum", "park", "nature",
  "nightlife", "experience", "shopping_mall", "market", "shop", "photo_spot",
];

export default function AddPlaceModal({ cityId, memberId, onClose }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("dinner");
  const [priority, setPriority] = useState<Priority>("want_to");
  const [address, setAddress] = useState("");
  const [hoursNote, setHoursNote] = useState("");

  // Optional first source
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceTakeaway, setSourceTakeaway] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const place = await createPlace(cityId, memberId, {
      name: name.trim(),
      category,
      priority,
      address: address.trim() || null,
      hours_note: hoursNote.trim() || null,
    });

    // Attach first source if provided
    if (place && sourceUrl.trim()) {
      const parsed = parseSourceUrl(sourceUrl.trim());
      await createSource(place.id, memberId, {
        platform: parsed.platform,
        url: sourceUrl.trim(),
        author: parsed.author,
        key_takeaway: sourceTakeaway.trim() || null,
        rating_vibe: "recommended",
      });
    }

    if (place) showToast(`Added ${place.name}`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-md w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Add a place</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 外婆家 Grandma's Home"
              className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50"
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-2">
              Category
            </label>
            <div className="mb-1.5">
              <span className="text-xs text-neutral-400">Food & Drink</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {FOOD_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-xs px-2.5 py-1 rounded-full border ${
                    category === cat
                      ? "border-[#2d5a3f]/40 bg-[#f2f7f4] text-[#1a3628]"
                      : "border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {CATEGORY_CONFIG[cat].emoji} {CATEGORY_CONFIG[cat].label}
                </button>
              ))}
            </div>
            <div className="mb-1.5">
              <span className="text-xs text-neutral-400">Activities & Shopping</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ACTIVITY_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-xs px-2.5 py-1 rounded-full border ${
                    category === cat
                      ? "border-[#2d5a3f]/40 bg-[#f2f7f4] text-[#1a3628]"
                      : "border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {CATEGORY_CONFIG[cat].emoji} {CATEGORY_CONFIG[cat].label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-2">
              Priority
            </label>
            <div className="flex gap-2">
              {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`text-xs px-3 py-1.5 rounded-full border ${
                    priority === p
                      ? "border-[#2d5a3f]/40 bg-[#f2f7f4] text-[#1a3628]"
                      : `border-neutral-200 ${PRIORITY_CONFIG[p].color} hover:opacity-80`
                  }`}
                >
                  {PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* Address + Hours */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Nanjing Road"
              className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Hours note (optional)
            </label>
            <input
              type="text"
              value={hoursNote}
              onChange={(e) => setHoursNote(e.target.value)}
              placeholder="e.g. Closed 2-5pm, weekdays only"
              className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50"
            />
          </div>

          {/* First source (optional) */}
          <div className="border-t border-neutral-100 pt-4">
            <p className="text-xs font-medium text-neutral-500 mb-3">
              Source (optional — add the link that led you here)
            </p>
            <div className="space-y-3">
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="Paste link from TikTok, RedNote, Instagram..."
                className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50"
              />
              {sourceUrl && (
                <input
                  type="text"
                  value={sourceTakeaway}
                  onChange={(e) => setSourceTakeaway(e.target.value)}
                  placeholder="Key takeaway from this post"
                  className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50"
                />
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 text-neutral-600 rounded-md font-medium border border-neutral-200 hover:bg-neutral-50 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-2.5 px-4 text-[#2d5a3f] border border-[#2d5a3f]/30 rounded-md font-medium hover:bg-[#2d5a3f]/5 disabled:opacity-40 text-sm"
            >
              Add place
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { Place } from "@/lib/types";
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from "@/lib/constants";

interface Props {
  place: Place;
  sourceCount: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function PlaceCard({
  place,
  sourceCount,
  isSelected,
  onClick,
}: Props) {
  const cat = CATEGORY_CONFIG[place.category];
  const pri = PRIORITY_CONFIG[place.priority];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
        isSelected
          ? "border-orange-300 bg-orange-50/50 shadow-sm"
          : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg flex-shrink-0">{cat.emoji}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">
                {place.name}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs px-1.5 py-0.5 rounded ${pri.color}`}>
                {pri.label}
              </span>
              <span className="text-xs text-stone-400">
                {cat.label}
              </span>
              {place.address && (
                <span className="text-xs text-stone-400 truncate max-w-[200px]">
                  · {place.address}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          {sourceCount > 0 && (
            <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
              {sourceCount} {sourceCount === 1 ? "source" : "sources"}
            </span>
          )}
          <span className="text-stone-400 text-xs">{isSelected ? "▲" : "▼"}</span>
        </div>
      </div>
    </button>
  );
}

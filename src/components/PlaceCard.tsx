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
      className={`w-full text-left px-4 py-3 rounded-md border transition-all ${
        isSelected
          ? "border-[#2d5a3f]/30 bg-[#f2f7f4]/50 "
          : "border-neutral-200 bg-white hover:border-neutral-300 hover:"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg flex-shrink-0">{cat.emoji}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {place.visited && (
                <span className="text-[#2d5a3f] text-xs flex-shrink-0" title={place.visit_rating || "visited"}>
                  {place.visit_rating === "great" ? "👍" : place.visit_rating === "skip" ? "👎" : "✓"}
                </span>
              )}
              <span className={`font-medium text-sm truncate ${place.visited ? "text-neutral-400" : ""}`}>
                {place.name}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs px-1.5 py-0.5 rounded ${pri.color}`}>
                {pri.label}
              </span>
              <span className="text-xs text-neutral-400">
                {cat.label}
              </span>
              {place.address && (
                <span className="text-xs text-neutral-400 truncate max-w-[200px]">
                  · {place.address}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          {sourceCount > 0 && (
            <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
              {sourceCount} {sourceCount === 1 ? "source" : "sources"}
            </span>
          )}
          <span className="text-neutral-400 text-xs">{isSelected ? "▲" : "▼"}</span>
        </div>
      </div>
    </button>
  );
}

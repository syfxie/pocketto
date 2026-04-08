"use client";

import { useDraggable } from "@dnd-kit/core";
import { Place } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/constants";

interface Props {
  place: Place;
  dayPlans: { id: string }[];
  onAddToDay: (planId: string, placeId: string) => void;
}

export default function DraggablePlace({ place, dayPlans, onAddToDay }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: place.id });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        opacity: isDragging ? 0.4 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-md border border-neutral-200 px-3 py-2 cursor-grab active:cursor-grabbing hover:border-neutral-300 hover:"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm">
          {CATEGORY_CONFIG[place.category].emoji}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{place.name}</p>
          {place.address && (
            <p className="text-xs text-neutral-400 truncate">{place.address}</p>
          )}
        </div>
      </div>
      {dayPlans.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {dayPlans.map((plan, i) => (
            <button
              key={plan.id}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onAddToDay(plan.id, place.id);
              }}
              className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-500 hover:bg-[#f2f7f4] hover:text-[#234a33]"
            >
              + D{i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

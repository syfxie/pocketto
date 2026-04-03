"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DayPlanStop, Place } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/constants";

interface Props {
  stop: DayPlanStop;
  place: Place;
  index: number;
  onRemove: () => void;
}

export default function SortableStop({ stop, place, index, onRemove }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const cat = CATEGORY_CONFIG[place.category];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg border border-stone-200 px-3 py-2 group hover:border-stone-300"
    >
      <div className="flex items-center gap-2">
        {/* Drag handle */}
        <button
          className="cursor-grab active:cursor-grabbing text-stone-300 hover:text-stone-500 touch-none"
          {...attributes}
          {...listeners}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="3" cy="2" r="1.2" />
            <circle cx="9" cy="2" r="1.2" />
            <circle cx="3" cy="6" r="1.2" />
            <circle cx="9" cy="6" r="1.2" />
            <circle cx="3" cy="10" r="1.2" />
            <circle cx="9" cy="10" r="1.2" />
          </svg>
        </button>

        {/* Number badge */}
        <span className="text-[10px] font-bold text-white bg-orange-500 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
          {index + 1}
        </span>

        {/* Place info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{cat.emoji}</span>
            <p className="text-sm font-medium truncate">{place.name_en}</p>
          </div>
          {place.name_zh && (
            <p className="text-xs text-stone-400 truncate ml-6">
              {place.name_zh}
            </p>
          )}
        </div>

        {/* Remove */}
        <button
          onClick={onRemove}
          className="text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 flex-shrink-0 text-xs"
        >
          &times;
        </button>
      </div>

      {/* Notes */}
      {stop.notes && (
        <p className="text-xs text-stone-500 mt-1 ml-[52px]">{stop.notes}</p>
      )}
    </div>
  );
}

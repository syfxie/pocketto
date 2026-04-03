"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DayPlan, DayPlanStop, Place } from "@/lib/types";
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from "@/lib/constants";
import SortableStop from "@/components/SortableStop";

interface Props {
  plan: DayPlan;
  dayNumber: number;
  stops: DayPlanStop[];
  places: Place[];
  onRemoveStop: (stopId: string) => void;
  onDeleteDay: () => void;
  onUpdateLabel: (label: string) => void;
}

export default function DayColumn({
  plan,
  dayNumber,
  stops,
  places,
  onRemoveStop,
  onDeleteDay,
  onUpdateLabel,
}: Props) {
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState(plan.label);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { setNodeRef, isOver } = useDroppable({ id: plan.id });

  function getPlace(placeId: string) {
    return places.find((p) => p.id === placeId);
  }

  function handleSaveLabel() {
    if (labelDraft.trim()) {
      onUpdateLabel(labelDraft.trim());
    }
    setEditingLabel(false);
  }

  return (
    <div className="w-72 flex-shrink-0">
      <div
        ref={setNodeRef}
        className={`rounded-xl border p-4 h-full transition-colors ${
          isOver
            ? "border-orange-300 bg-orange-50/50"
            : "border-stone-200 bg-white"
        }`}
      >
        {/* Day header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            {editingLabel ? (
              <input
                type="text"
                value={labelDraft}
                onChange={(e) => setLabelDraft(e.target.value)}
                onBlur={handleSaveLabel}
                onKeyDown={(e) => e.key === "Enter" && handleSaveLabel()}
                className="text-sm font-medium w-full px-1 py-0.5 rounded border border-orange-300 focus:outline-none"
                autoFocus
              />
            ) : (
              <button
                onClick={() => {
                  setLabelDraft(plan.label);
                  setEditingLabel(true);
                }}
                className="text-sm font-medium text-stone-700 hover:text-orange-600 text-left"
              >
                {plan.label}
              </button>
            )}
            {plan.date && (
              <p className="text-xs text-stone-400 mt-0.5">{plan.date}</p>
            )}
          </div>
          <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full ml-2">
            {stops.length}
          </span>
        </div>

        {/* Stops */}
        <SortableContext
          items={stops.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 min-h-[100px]">
            {stops.map((stop, i) => {
              const place = getPlace(stop.place_id);
              if (!place) return null;
              return (
                <SortableStop
                  key={stop.id}
                  stop={stop}
                  place={place}
                  index={i}
                  onRemove={() => onRemoveStop(stop.id)}
                />
              );
            })}
            {stops.length === 0 && (
              <div className="text-center py-8 text-xs text-stone-400 border-2 border-dashed border-stone-200 rounded-lg">
                Drag places here
              </div>
            )}
          </div>
        </SortableContext>

        {/* Day footer */}
        <div className="mt-3 pt-3 border-t border-stone-100 flex justify-between items-center">
          <span className="text-xs text-stone-400">
            {stops.length} {stops.length === 1 ? "stop" : "stops"}
          </span>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onDeleteDay}
                className="text-xs text-red-600 font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-stone-500"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-stone-400 hover:text-red-500"
            >
              Remove day
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

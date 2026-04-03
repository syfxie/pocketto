"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCity, usePlaces, useDayPlans, useStore, useCurrentGroup } from "@/lib/use-store";
import {
  createDayPlan,
  addStopToPlan,
  removeStopFromPlan,
  reorderStops,
  moveStopToPlan,
  updateDayPlan,
  deleteDayPlan,
} from "@/lib/store";
import { CATEGORY_CONFIG } from "@/lib/constants";
import DayColumn from "@/components/DayColumn";
import SortableStop from "@/components/SortableStop";

const UNPLANNED_ID = "__unplanned__";

export default function PlannerPage() {
  const params = useParams();
  const router = useRouter();
  const cityId = params.id as string;
  const city = useCity(cityId);
  const places = usePlaces(cityId);
  const dayPlans = useDayPlans(cityId);
  const store = useStore();
  const { member } = useCurrentGroup();
  const [activeStopId, setActiveStopId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  // Build a map of placeId -> dayPlanStops
  const allStops = useMemo(() => {
    return store.dayPlanStops.filter((s) =>
      dayPlans.some((d) => d.id === s.day_plan_id)
    );
  }, [store.dayPlanStops, dayPlans]);

  // Places not assigned to any day
  const unplannedPlaces = useMemo(() => {
    const plannedPlaceIds = new Set(allStops.map((s) => s.place_id));
    return places.filter((p) => !plannedPlaceIds.has(p.id));
  }, [places, allStops]);

  // Stops grouped by day plan
  const stopsByPlan = useMemo(() => {
    const map: Record<string, typeof allStops> = {};
    for (const plan of dayPlans) {
      map[plan.id] = allStops
        .filter((s) => s.day_plan_id === plan.id)
        .sort((a, b) => a.sort_order - b.sort_order);
    }
    return map;
  }, [dayPlans, allStops]);

  if (!city || !member) return null;

  function handleAddDay() {
    const num = dayPlans.length + 1;
    createDayPlan(cityId, `Day ${num}`);
  }

  function handleAddToDay(planId: string, placeId: string) {
    addStopToPlan(planId, placeId);
  }

  function handleRemoveStop(stopId: string) {
    removeStopFromPlan(stopId);
  }

  // Find which container (plan ID or UNPLANNED_ID) an item belongs to
  function findContainer(id: string): string | null {
    // Check if it's an unplanned place
    if (unplannedPlaces.some((p) => p.id === id)) return UNPLANNED_ID;
    // Check stops
    const stop = allStops.find((s) => s.id === id);
    if (stop) return stop.day_plan_id;
    // Check if id is a container itself
    if (id === UNPLANNED_ID || dayPlans.some((d) => d.id === id)) return id;
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveStopId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    // Handled in dragEnd for simplicity
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveStopId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) return;

    // Dragging from unplanned pool into a day
    if (activeContainer === UNPLANNED_ID && overContainer !== UNPLANNED_ID) {
      const targetPlanId =
        dayPlans.some((d) => d.id === overId) ? overId : overContainer;
      addStopToPlan(targetPlanId, activeId);
      return;
    }

    // Dragging a stop between days
    if (
      activeContainer !== UNPLANNED_ID &&
      overContainer !== UNPLANNED_ID &&
      activeContainer !== overContainer
    ) {
      const targetPlanId =
        dayPlans.some((d) => d.id === overId) ? overId : overContainer;
      moveStopToPlan(activeId, targetPlanId);
      return;
    }

    // Reordering within the same day
    if (activeContainer === overContainer && activeContainer !== UNPLANNED_ID) {
      const stops = stopsByPlan[activeContainer] || [];
      const oldIndex = stops.findIndex((s) => s.id === activeId);
      const overStop = stops.findIndex((s) => s.id === overId);
      if (oldIndex === -1 || overStop === -1 || oldIndex === overStop) return;

      const newOrder = [...stops.map((s) => s.id)];
      newOrder.splice(oldIndex, 1);
      newOrder.splice(overStop, 0, activeId);
      reorderStops(activeContainer, newOrder);
    }
  }

  // Get place for a stop
  function getPlace(placeId: string) {
    return places.find((p) => p.id === placeId);
  }

  // Active drag item info
  const activeDragPlace = activeStopId
    ? getPlace(activeStopId) ||
      getPlace(allStops.find((s) => s.id === activeStopId)?.place_id || "")
    : null;

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white sticky top-0 z-10">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => router.push(`/city/${cityId}`)}
              className="text-stone-400 hover:text-stone-600 text-sm"
            >
              &larr; {city.name_en}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">
              Day Planner{" "}
              <span className="text-stone-400 font-normal">
                — {city.name_en}
              </span>
            </h1>
            <button
              onClick={handleAddDay}
              className="text-sm px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
            >
              + Add day
            </button>
          </div>
        </div>
      </header>

      {/* Planner content */}
      <main className="flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 p-6 min-h-[calc(100vh-120px)]">
            {/* Unplanned pool */}
            <div className="w-72 flex-shrink-0">
              <div className="bg-stone-50 rounded-xl border border-stone-200 p-4 h-full">
                <h3 className="text-sm font-medium text-stone-500 mb-3">
                  Unplanned ({unplannedPlaces.length})
                </h3>
                <SortableContext
                  items={unplannedPlaces.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                  id={UNPLANNED_ID}
                >
                  <div className="space-y-2">
                    {unplannedPlaces.map((place) => (
                      <div
                        key={place.id}
                        className="bg-white rounded-lg border border-stone-200 px-3 py-2 cursor-grab active:cursor-grabbing hover:border-stone-300 hover:shadow-sm"
                        id={place.id}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {CATEGORY_CONFIG[place.category].emoji}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {place.name_en}
                            </p>
                            {place.name_zh && (
                              <p className="text-xs text-stone-400 truncate">
                                {place.name_zh}
                              </p>
                            )}
                          </div>
                        </div>
                        {/* Quick-add buttons */}
                        {dayPlans.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {dayPlans.map((plan, i) => (
                              <button
                                key={plan.id}
                                onClick={() =>
                                  handleAddToDay(plan.id, place.id)
                                }
                                className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-500 hover:bg-orange-100 hover:text-orange-600"
                              >
                                + D{i + 1}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {unplannedPlaces.length === 0 && (
                      <p className="text-xs text-stone-400 text-center py-8">
                        All places assigned!
                      </p>
                    )}
                  </div>
                </SortableContext>
              </div>
            </div>

            {/* Day columns */}
            {dayPlans.map((plan, i) => (
              <DayColumn
                key={plan.id}
                plan={plan}
                dayNumber={i + 1}
                stops={stopsByPlan[plan.id] || []}
                places={places}
                onRemoveStop={handleRemoveStop}
                onDeleteDay={() => deleteDayPlan(plan.id)}
                onUpdateLabel={(label) => updateDayPlan(plan.id, { label })}
              />
            ))}

            {/* Empty state */}
            {dayPlans.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-stone-400 text-sm mb-4">
                    No days planned yet. Add a day to start building your
                    itinerary.
                  </p>
                  <button
                    onClick={handleAddDay}
                    className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                  >
                    + Add your first day
                  </button>
                </div>
              </div>
            )}
          </div>

          <DragOverlay>
            {activeDragPlace && (
              <div className="bg-white rounded-lg border border-orange-300 shadow-lg px-3 py-2 w-64 opacity-90">
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {CATEGORY_CONFIG[activeDragPlace.category].emoji}
                  </span>
                  <p className="text-sm font-medium truncate">
                    {activeDragPlace.name_en}
                  </p>
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
}

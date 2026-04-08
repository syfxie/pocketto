"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCity, usePlaces, useCurrentGroup, useStore } from "@/lib/use-store";
import { deleteCity } from "@/lib/store";
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from "@/lib/constants";
import { Category, Priority } from "@/lib/types";
import PlaceCard from "@/components/PlaceCard";
import PlaceDetail from "@/components/PlaceDetail";
import AddPlaceModal from "@/components/AddPlaceModal";

type SortKey = "name" | "priority" | "date" | "sources";

export default function CityPage() {
  const params = useParams();
  const router = useRouter();
  const cityId = params.id as string;
  const city = useCity(cityId);
  const places = usePlaces(cityId);
  const store = useStore();
  const { group, member } = useCurrentGroup();

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [filterCategory, setFilterCategory] = useState<Category | null>(null);
  const [filterPriority, setFilterPriority] = useState<Priority | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("date");

  if (!city || !group || !member) {
    return null;
  }

  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const place of places) {
      counts[place.id] = store.sources.filter(
        (s) => s.place_id === place.id
      ).length;
    }
    return counts;
  }, [places, store.sources]);

  const filteredPlaces = useMemo(() => {
    let result = [...places];
    if (filterCategory) {
      result = result.filter((p) => p.category === filterCategory);
    }
    if (filterPriority) {
      result = result.filter((p) => p.priority === filterPriority);
    }
    switch (sortBy) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "priority": {
        const order: Record<Priority, number> = { must_go: 0, want_to: 1, if_time: 2 };
        result.sort((a, b) => order[a.priority] - order[b.priority]);
        break;
      }
      case "sources":
        result.sort((a, b) => (sourceCounts[b.id] || 0) - (sourceCounts[a.id] || 0));
        break;
      case "date":
      default:
        result.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }
    return result;
  }, [places, filterCategory, filterPriority, sortBy, sourceCounts]);

  // Unique categories present in this city's places
  const activeCategories = useMemo(() => {
    const cats = new Set(places.map((p) => p.category));
    return Array.from(cats).sort();
  }, [places]);

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => router.push("/home")}
              className="text-stone-400 hover:text-stone-600 text-sm"
            >
              &larr; Cities
            </button>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold">
                {city.name}
              </h1>
              <div className="flex items-center gap-4 mt-1 text-xs text-stone-500">
                {(city.dates_start || city.dates_end) && (
                  <span>
                    {city.dates_start} — {city.dates_end || "?"}
                  </span>
                )}
                {city.stay_name && <span>🏠 {city.stay_name}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/city/${cityId}/planner`)}
                className="text-sm px-4 py-2 border border-stone-200 text-stone-600 rounded-lg font-medium hover:bg-stone-50"
              >
                Day Planner
              </button>
              <button
                onClick={() => setShowAddPlace(true)}
                className="text-sm px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                + Add place
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b border-stone-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-6">
          {/* Category filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterCategory(null)}
              className={`text-xs px-2.5 py-1 rounded-full ${
                !filterCategory
                  ? "bg-stone-800 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              All
            </button>
            {activeCategories.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setFilterCategory(filterCategory === cat ? null : cat)
                }
                className={`text-xs px-2.5 py-1 rounded-full ${
                  filterCategory === cat
                    ? "bg-stone-800 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {CATEGORY_CONFIG[cat].emoji} {CATEGORY_CONFIG[cat].label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-stone-200" />

          {/* Priority filters */}
          <div className="flex items-center gap-1.5">
            {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
              <button
                key={p}
                onClick={() =>
                  setFilterPriority(filterPriority === p ? null : p)
                }
                className={`text-xs px-2.5 py-1 rounded-full ${
                  filterPriority === p
                    ? "bg-stone-800 text-white"
                    : `${PRIORITY_CONFIG[p].color} hover:opacity-80`
                }`}
              >
                {PRIORITY_CONFIG[p].label}
              </button>
            ))}
          </div>

          <div className="ml-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="text-xs text-stone-500 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="date">Newest first</option>
              <option value="name">Name A-Z</option>
              <option value="priority">Priority</option>
              <option value="sources">Most sources</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-6 py-6">
          {filteredPlaces.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-stone-400 text-sm mb-4">
                {places.length === 0
                  ? "No places saved yet. Start adding your finds!"
                  : "No places match your filters."}
              </p>
              {places.length === 0 && (
                <button
                  onClick={() => setShowAddPlace(true)}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  + Add your first place
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPlaces.map((place) => (
                <div key={place.id}>
                  <PlaceCard
                    place={place}
                    sourceCount={sourceCounts[place.id] || 0}
                    isSelected={selectedPlaceId === place.id}
                    onClick={() =>
                      setSelectedPlaceId(
                        selectedPlaceId === place.id ? null : place.id
                      )
                    }
                  />
                  {selectedPlaceId === place.id && (
                    <PlaceDetail
                      placeId={place.id}
                      memberId={member.id}
                      onClose={() => setSelectedPlaceId(null)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showAddPlace && (
        <AddPlaceModal
          cityId={cityId}
          memberId={member.id}
          onClose={() => setShowAddPlace(false)}
        />
      )}
    </div>
  );
}

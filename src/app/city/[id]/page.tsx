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
import EditCityModal from "@/components/EditCityModal";

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
  const [showEditCity, setShowEditCity] = useState(false);
  const [filterCategory, setFilterCategory] = useState<Category | null>(null);
  const [filterPriority, setFilterPriority] = useState<Priority | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [searchQuery, setSearchQuery] = useState("");

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
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.address && p.address.toLowerCase().includes(q))
      );
    }
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
  }, [places, searchQuery, filterCategory, filterPriority, sortBy, sourceCounts]);

  // Unique categories present in this city's places
  const activeCategories = useMemo(() => {
    const cats = new Set(places.map((p) => p.category));
    return Array.from(cats).sort();
  }, [places]);

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => router.push("/home")}
              className="text-neutral-400 hover:text-neutral-600 text-sm"
            >
              &larr; Cities
            </button>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold">
                {city.name}
              </h1>
              <div className="flex items-center gap-4 mt-1 text-xs text-neutral-500">
                {(city.dates_start || city.dates_end) && (
                  <span>
                    {city.dates_start} — {city.dates_end || "?"}
                  </span>
                )}
                {city.stay_name && <span>🏠 {city.stay_name}</span>}
                <button
                  onClick={() => setShowEditCity(true)}
                  className="text-neutral-300 hover:text-neutral-500"
                >
                  Edit
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/city/${cityId}/planner`)}
                className="text-sm px-4 py-2 border border-neutral-200 text-neutral-600 rounded-md font-medium hover:bg-neutral-50"
              >
                Day Planner
              </button>
              <button
                onClick={() => setShowAddPlace(true)}
                className="text-sm px-4 py-2 text-[#2d5a3f] border border-[#2d5a3f]/30 rounded-md font-medium hover:bg-[#2d5a3f]/5"
              >
                + Add place
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search + Filters */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-6">
          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search places..."
            className="w-40 px-2.5 py-1 rounded-md border border-neutral-200 text-xs focus:outline-none focus:border-[#2d5a3f]/50 placeholder:text-neutral-300"
          />
          {/* Category filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterCategory(null)}
              className={`text-xs px-2.5 py-1 rounded-full ${
                !filterCategory
                  ? "bg-neutral-800 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
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
                    ? "bg-neutral-800 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {CATEGORY_CONFIG[cat].emoji} {CATEGORY_CONFIG[cat].label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-neutral-200" />

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
                    ? "bg-neutral-800 text-white"
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
              className="text-xs text-neutral-500 bg-transparent border-none focus:outline-none cursor-pointer"
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
              <p className="text-neutral-400 text-sm mb-4">
                {places.length === 0
                  ? "No places saved yet. Start adding your finds!"
                  : "No places match your filters."}
              </p>
              {places.length === 0 && (
                <button
                  onClick={() => setShowAddPlace(true)}
                  className="text-sm text-[#2d5a3f] hover:text-[#234a33] font-medium"
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

      {showEditCity && (
        <EditCityModal
          city={city}
          onClose={() => setShowEditCity(false)}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentGroup, useCities, useStore } from "@/lib/use-store";
import { createCity, clearSession } from "@/lib/store";
import AddCityModal from "@/components/AddCityModal";

export default function HomePage() {
  const router = useRouter();
  const { group, member } = useCurrentGroup();
  const cities = useCities();
  const store = useStore();
  const [showAddCity, setShowAddCity] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  if (!group || !member) {
    if (typeof window !== "undefined") router.push("/");
    return null;
  }

  const placeCounts = cities.map((city) => ({
    ...city,
    placeCount: store.places.filter((p) => p.city_id === city.id).length,
  }));

  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">{group.name}</h1>
            <p className="text-xs text-neutral-500">
              Logged in as {member.nickname}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInvite(!showInvite)}
              className="text-xs px-3 py-1.5 rounded-md border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            >
              Invite code
            </button>
            <button
              onClick={() => {
                clearSession();
                router.push("/");
              }}
              className="text-xs px-3 py-1.5 rounded-md text-neutral-500 hover:bg-neutral-50"
            >
              Leave
            </button>
          </div>
        </div>
        {showInvite && (
          <div className="max-w-4xl mx-auto px-6 pb-4">
            <div className="inline-flex items-center gap-3 bg-[#f2f7f4] rounded-md px-4 py-2.5">
              <span className="text-xs text-[#1a3628]">Share this code:</span>
              <span className="font-mono text-lg font-semibold tracking-[0.2em] text-[#234a33]">
                {group.invite_code}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(group.invite_code)}
                className="text-xs text-[#234a33] hover:text-[#1a3628] underline"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
            Cities
          </h2>
          <button
            onClick={() => setShowAddCity(true)}
            className="text-sm px-4 py-2 text-[#2d5a3f] border border-[#2d5a3f]/30 rounded-md font-medium hover:bg-[#2d5a3f]/5"
          >
            + Add city
          </button>
        </div>

        {placeCounts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-400 text-sm mb-4">
              No cities yet. Start planning your trip!
            </p>
            <button
              onClick={() => setShowAddCity(true)}
              className="text-sm text-[#2d5a3f] hover:text-[#234a33] font-medium"
            >
              + Add your first city
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {placeCounts.map((city) => (
              <button
                key={city.id}
                onClick={() => router.push(`/city/${city.id}`)}
                className="text-left bg-white rounded-lg border border-neutral-200 p-5 hover:border-neutral-300 hover: group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-base group-hover:text-[#234a33]">
                      {city.name}
                    </h3>
                  </div>
                </div>
                {(city.dates_start || city.dates_end) && (
                  <p className="text-xs text-neutral-400 mb-2">
                    {city.dates_start} — {city.dates_end || "?"}
                  </p>
                )}
                {city.stay_name && (
                  <p className="text-xs text-neutral-500 mb-2 truncate">
                    🏠 {city.stay_name}
                  </p>
                )}
                <p className="text-xs text-neutral-400">
                  {city.placeCount} {city.placeCount === 1 ? "place" : "places"} saved
                </p>
              </button>
            ))}
          </div>
        )}
      </main>

      {showAddCity && (
        <AddCityModal
          groupId={group.id}
          onClose={() => setShowAddCity(false)}
        />
      )}
    </div>
  );
}

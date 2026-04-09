"use client";

import { useState } from "react";
import { updateCity } from "@/lib/store";
import { City } from "@/lib/types";
import { showToast } from "@/components/Toast";

interface Props {
  city: City;
  onClose: () => void;
}

export default function EditCityModal({ city, onClose }: Props) {
  const [name, setName] = useState(city.name);
  const [datesStart, setDatesStart] = useState(city.dates_start || "");
  const [datesEnd, setDatesEnd] = useState(city.dates_end || "");
  const [stayName, setStayName] = useState(city.stay_name || "");
  const [stayAddress, setStayAddress] = useState(city.stay_address || "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await updateCity(city.id, {
      name: name.trim(),
      dates_start: datesStart || null,
      dates_end: datesEnd || null,
      stay_name: stayName.trim() || null,
      stay_address: stayAddress.trim() || null,
    });
    showToast("City updated");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-md w-full max-w-md mx-4 p-6">
        <h2 className="text-base font-medium mb-4">Edit city</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Arrive</label>
              <input
                type="date"
                value={datesStart}
                onChange={(e) => setDatesStart(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Depart</label>
              <input
                type="date"
                value={datesEnd}
                onChange={(e) => setDatesEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50"
              />
            </div>
          </div>
          <div className="border-t border-neutral-100 pt-4">
            <p className="text-xs text-neutral-400 mb-3">Lodging</p>
            <div className="space-y-3">
              <input
                type="text"
                value={stayName}
                onChange={(e) => setStayName(e.target.value)}
                placeholder="Hotel / Airbnb name"
                className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50"
              />
              <input
                type="text"
                value={stayAddress}
                onChange={(e) => setStayAddress(e.target.value)}
                placeholder="Address"
                className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 text-neutral-400 rounded-md text-sm hover:text-neutral-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-2 px-4 text-[#2d5a3f] rounded-md text-sm border border-[#2d5a3f]/30 hover:bg-[#2d5a3f]/5 disabled:opacity-30"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

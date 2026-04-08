"use client";

import { useState } from "react";
import { createCity } from "@/lib/store";

interface Props {
  groupId: string;
  onClose: () => void;
}

export default function AddCityModal({ groupId, onClose }: Props) {
  const [name, setName] = useState("");
  const [datesStart, setDatesStart] = useState("");
  const [datesEnd, setDatesEnd] = useState("");
  const [stayName, setStayName] = useState("");
  const [stayAddress, setStayAddress] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createCity(groupId, {
      name: name.trim(),
      dates_start: datesStart || null,
      dates_end: datesEnd || null,
      stay_name: stayName.trim() || null,
      stay_address: stayAddress.trim() || null,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold mb-4">Add a city</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">
              City name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shanghai 上海"
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">
                Arrive
              </label>
              <input
                type="date"
                value={datesStart}
                onChange={(e) => setDatesStart(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">
                Depart
              </label>
              <input
                type="date"
                value={datesEnd}
                onChange={(e) => setDatesEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="border-t border-stone-100 pt-4">
            <p className="text-xs font-medium text-stone-500 mb-3">
              Lodging (optional)
            </p>
            <div className="space-y-3">
              <input
                type="text"
                value={stayName}
                onChange={(e) => setStayName(e.target.value)}
                placeholder="Hotel / Airbnb name"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="text"
                value={stayAddress}
                onChange={(e) => setStayAddress(e.target.value)}
                placeholder="Address"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 text-stone-600 rounded-lg font-medium border border-stone-200 hover:bg-stone-50 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-2.5 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-40 text-sm"
            >
              Add city
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

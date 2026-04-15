"use client";

import { useState } from "react";
import { createCity } from "@/lib/store";
import { showToast } from "@/components/Toast";
import { t } from "@/lib/i18n";

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await createCity(groupId, {
      name: name.trim(),
      dates_start: datesStart || null,
      dates_end: datesEnd || null,
      stay_name: stayName.trim() || null,
      stay_address: stayAddress.trim() || null,
    });
    showToast(`Added ${name.trim()}`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-md w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold mb-4">{ t("addCity.title") }</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              {t("addCity.name")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shanghai 上海"
              className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">
                Arrive
              </label>
              <input
                type="date"
                value={datesStart}
                onChange={(e) => setDatesStart(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">
                Depart
              </label>
              <input
                type="date"
                value={datesEnd}
                onChange={(e) => setDatesEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50"
              />
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-4">
            <p className="text-xs font-medium text-neutral-500 mb-3">
              Lodging (optional)
            </p>
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
              className="flex-1 py-2.5 px-4 text-neutral-600 rounded-md font-medium border border-neutral-200 hover:bg-neutral-50 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-2.5 px-4 text-[#2d5a3f] border border-[#2d5a3f]/30 rounded-md font-medium hover:bg-[#2d5a3f]/5 disabled:opacity-40 text-sm"
            >
              Add city
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

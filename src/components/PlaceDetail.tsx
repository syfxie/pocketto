"use client";

import { useState } from "react";
import { useStore } from "@/lib/use-store";
import { updatePlace, deletePlace } from "@/lib/store";
import {
  CATEGORY_CONFIG,
  PRIORITY_CONFIG,
  PLATFORM_CONFIG,
  VIBE_CONFIG,
  PAYMENT_CONFIG,
} from "@/lib/constants";
import { Category, Priority, PaymentMethod, VisitRating } from "@/lib/types";
import AddSourceForm from "@/components/AddSourceForm";
import { showToast } from "@/components/Toast";
import { t } from "@/lib/i18n";

interface Props {
  placeId: string;
  memberId: string;
  onClose: () => void;
}

export default function PlaceDetail({ placeId, memberId, onClose }: Props) {
  const store = useStore();
  const place = store.places.find((p) => p.id === placeId);
  const sources = store.sources
    .filter((s) => s.place_id === placeId)
    .sort(
      (a, b) =>
        new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
    );
  const [showAddSource, setShowAddSource] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(place?.notes || "");
  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState(place?.summary || "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(place?.name || "");
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressDraft, setAddressDraft] = useState(place?.address || "");
  const [editingHours, setEditingHours] = useState(false);
  const [hoursDraft, setHoursDraft] = useState(place?.hours_note || "");

  if (!place) return null;

  async function handleSaveName() {
    if (nameDraft.trim()) {
      await updatePlace(placeId, { name: nameDraft.trim() });
      showToast(t("place.save"));
    }
    setEditingName(false);
  }

  async function handleSaveAddress() {
    await updatePlace(placeId, { address: addressDraft.trim() || null });
    setEditingAddress(false);
  }

  async function handleSaveHours() {
    await updatePlace(placeId, { hours_note: hoursDraft.trim() || null });
    setEditingHours(false);
  }

  async function handleSaveNotes() {
    await updatePlace(placeId, { notes: notesDraft.trim() || null });
    setEditingNotes(false);
  }

  async function handleSaveSummary() {
    await updatePlace(placeId, { summary: summaryDraft.trim() || null });
    setEditingSummary(false);
  }

  async function handleCategoryChange(cat: Category) {
    await updatePlace(placeId, { category: cat });
  }

  async function handlePriorityChange(pri: Priority) {
    await updatePlace(placeId, { priority: pri });
  }

  async function handleDelete() {
    const placeName = place?.name || "";
    await deletePlace(placeId);
    showToast(`${t("place.delete")} ${placeName}`);
    onClose();
  }

  return (
    <div className="bg-white border border-t-0 border-neutral-200 rounded-b-md px-6 py-5 -mt-1">
      {/* Editable name */}
      <div className="mb-4">
        {editingName ? (
          <input
            type="text"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
            className="text-base font-medium w-full px-1 py-0.5 rounded border border-[#2d5a3f]/30 focus:outline-none"
            autoFocus
          />
        ) : (
          <button
            onClick={() => { setNameDraft(place.name); setEditingName(true); }}
            className="text-base font-medium hover:text-[#2d5a3f] text-left"
          >
            {place.name}
          </button>
        )}
      </div>

      {/* Category + Priority toggles */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
            <button
              key={p}
              onClick={() => handlePriorityChange(p)}
              className={`text-xs px-2 py-0.5 rounded-full border ${
                place.priority === p
                  ? "border-[#2d5a3f]/40 " + PRIORITY_CONFIG[p].color
                  : "border-transparent text-neutral-300 hover:text-neutral-500"
              }`}
            >
              {PRIORITY_CONFIG[p].label}
            </button>
          ))}
        </div>
        <span className="text-neutral-200">|</span>
        <select
          value={place.category}
          onChange={(e) => handleCategoryChange(e.target.value as Category)}
          className="text-xs text-neutral-500 bg-transparent border-none focus:outline-none cursor-pointer"
        >
          {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_CONFIG[cat].emoji} {CATEGORY_CONFIG[cat].label}
            </option>
          ))}
        </select>
      </div>

      {/* Properties */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-5">
        <div className="flex items-start gap-2">
          <span className="text-neutral-400 w-20 flex-shrink-0">{t("place.address")}</span>
          {editingAddress ? (
            <input
              type="text"
              value={addressDraft}
              onChange={(e) => setAddressDraft(e.target.value)}
              onBlur={handleSaveAddress}
              onKeyDown={(e) => e.key === "Enter" && handleSaveAddress()}
              className="flex-1 px-1 py-0.5 rounded border border-[#2d5a3f]/30 text-sm focus:outline-none"
              autoFocus
            />
          ) : (
            <button
              onClick={() => { setAddressDraft(place.address || ""); setEditingAddress(true); }}
              className="text-left hover:text-[#2d5a3f]"
            >
              {place.address || <span className="text-neutral-300 italic">{t("place.addAddress")}</span>}
            </button>
          )}
        </div>
        <div className="flex items-start gap-2">
          <span className="text-neutral-400 w-20 flex-shrink-0">{t("place.hours")}</span>
          {editingHours ? (
            <input
              type="text"
              value={hoursDraft}
              onChange={(e) => setHoursDraft(e.target.value)}
              onBlur={handleSaveHours}
              onKeyDown={(e) => e.key === "Enter" && handleSaveHours()}
              className="flex-1 px-1 py-0.5 rounded border border-[#2d5a3f]/30 text-sm focus:outline-none"
              autoFocus
            />
          ) : (
            <button
              onClick={() => { setHoursDraft(place.hours_note || ""); setEditingHours(true); }}
              className="text-left hover:text-[#2d5a3f]"
            >
              {place.hours_note || <span className="text-neutral-300 italic">{t("place.addHours")}</span>}
            </button>
          )}
        </div>
        {place.payment.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="text-neutral-400 w-20 flex-shrink-0">{t("place.payment")}</span>
            <span>
              {place.payment
                .map((p) => PAYMENT_CONFIG[p as PaymentMethod]?.label || p)
                .join(", ")}
            </span>
          </div>
        )}
        {place.reservation_required && (
          <div className="flex items-start gap-2">
            <span className="text-neutral-400 w-20 flex-shrink-0">{t("place.reserve")}</span>
            <span>
              {t("place.required")}
              {place.reservation_url && (
                <>
                  {" — "}
                  <a href={place.reservation_url} target="_blank" rel="noopener noreferrer" className="text-[#2d5a3f] hover:underline">
                    {t("place.bookHere")}
                  </a>
                </>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{t("place.notes")}</h4>
          {!editingNotes && (
            <button onClick={() => { setNotesDraft(place.notes || ""); setEditingNotes(true); }} className="text-xs text-neutral-400 hover:text-neutral-600">
              {t("place.edit")}
            </button>
          )}
        </div>
        {editingNotes ? (
          <div>
            <textarea value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} placeholder={t("place.noNotes")} className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50 min-h-[80px] resize-y" autoFocus />
            <div className="flex gap-2 mt-2">
              <button onClick={() => setEditingNotes(false)} className="text-xs text-neutral-500 hover:text-neutral-700">{t("place.cancel")}</button>
              <button onClick={handleSaveNotes} className="text-xs text-[#2d5a3f] hover:text-[#234a33] font-medium">{t("place.save")}</button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-600">
            {place.notes || <span className="text-neutral-400 italic">{t("place.noNotes")}</span>}
          </p>
        )}
      </div>

      {/* Summary */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{t("place.summary")}</h4>
          {!editingSummary && (
            <button onClick={() => { setSummaryDraft(place.summary || ""); setEditingSummary(true); }} className="text-xs text-neutral-400 hover:text-neutral-600">
              {t("place.edit")}
            </button>
          )}
        </div>
        {editingSummary ? (
          <div>
            <textarea value={summaryDraft} onChange={(e) => setSummaryDraft(e.target.value)} placeholder={t("place.noSummary")} className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:border-[#2d5a3f]/50 min-h-[80px] resize-y" autoFocus />
            <div className="flex gap-2 mt-2">
              <button onClick={() => setEditingSummary(false)} className="text-xs text-neutral-500 hover:text-neutral-700">{t("place.cancel")}</button>
              <button onClick={handleSaveSummary} className="text-xs text-[#2d5a3f] hover:text-[#234a33] font-medium">{t("place.save")}</button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-600">
            {place.summary || <span className="text-neutral-400 italic">{t("place.noSummary")}</span>}
          </p>
        )}
      </div>

      {/* Sources */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{t("place.sources")} ({sources.length})</h4>
          <button onClick={() => setShowAddSource(!showAddSource)} className="text-xs text-[#2d5a3f] hover:text-[#234a33] font-medium">
            {showAddSource ? t("place.cancel") : t("place.addSource")}
          </button>
        </div>
        {showAddSource && (
          <div className="mb-4">
            <AddSourceForm placeId={placeId} memberId={memberId} existingUrls={sources.map((s) => s.url)} onDone={() => setShowAddSource(false)} />
          </div>
        )}
        {sources.length === 0 && !showAddSource ? (
          <p className="text-xs text-neutral-400 italic">{t("place.noSources")}</p>
        ) : (
          <div className="space-y-2">
            {sources.map((source) => {
              const plat = PLATFORM_CONFIG[source.platform];
              const vibe = VIBE_CONFIG[source.rating_vibe];
              return (
                <div key={source.id} className="flex items-start gap-3 p-3 rounded-md bg-neutral-50 border border-neutral-100">
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${plat.color}`}>{plat.icon} {plat.label}</span>
                  <div className="min-w-0 flex-1">
                    {source.author && <span className="text-xs text-neutral-500">{source.author}</span>}
                    {source.key_takeaway && <p className="text-sm text-neutral-700 mt-0.5">&ldquo;{source.key_takeaway}&rdquo;</p>}
                    {source.caption && <p className="text-xs text-neutral-400 mt-0.5 truncate">{source.caption}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs">{vibe.emoji}</span>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-neutral-400 hover:text-[#2d5a3f]">{t("place.open")}</a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Visit Feedback */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-xs text-neutral-400">{t("place.visited")}</span>
        {(["great", "ok", "skip"] as VisitRating[]).map((r) => {
          const labels: Record<VisitRating, { emoji: string; label: string }> = {
            great: { emoji: "👍", label: "Great" },
            ok: { emoji: "👌", label: "OK" },
            skip: { emoji: "👎", label: "Skip" },
          };
          const isActive = place.visited && place.visit_rating === r;
          return (
            <button
              key={r}
              onClick={async () => {
                if (isActive) {
                  await updatePlace(placeId, { visited: false, visit_rating: null });
                } else {
                  await updatePlace(placeId, { visited: true, visit_rating: r });
                }
              }}
              className={`text-xs px-2.5 py-1 rounded-full border ${
                isActive ? "border-[#2d5a3f]/40 bg-[#2d5a3f]/10 text-[#2d5a3f]" : "border-neutral-200 text-neutral-400 hover:border-neutral-300"
              }`}
            >
              {labels[r].emoji} {labels[r].label}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
        <button onClick={onClose} className="text-xs text-neutral-400 hover:text-neutral-600">{t("place.collapse")}</button>
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-400">{t("place.confirmDelete")}</span>
            <button onClick={handleDelete} className="text-xs text-red-500 font-medium hover:text-red-600">{t("place.yes")}</button>
            <button onClick={() => setConfirmDelete(false)} className="text-xs text-neutral-500 hover:text-neutral-700">{t("place.cancel")}</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="text-xs text-neutral-400 hover:text-red-500">{t("place.delete")}</button>
        )}
      </div>
    </div>
  );
}

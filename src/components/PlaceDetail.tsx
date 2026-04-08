"use client";

import { useState } from "react";
import { useStore } from "@/lib/use-store";
import { getPlace, updatePlace, deletePlace } from "@/lib/store";
import {
  CATEGORY_CONFIG,
  PRIORITY_CONFIG,
  PLATFORM_CONFIG,
  VIBE_CONFIG,
  PAYMENT_CONFIG,
} from "@/lib/constants";
import { PaymentMethod } from "@/lib/types";
import AddSourceForm from "@/components/AddSourceForm";

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

  if (!place) return null;

  function handleSaveNotes() {
    updatePlace(placeId, { notes: notesDraft.trim() || null });
    setEditingNotes(false);
  }

  function handleSaveSummary() {
    updatePlace(placeId, { summary: summaryDraft.trim() || null });
    setEditingSummary(false);
  }

  function handleDelete() {
    deletePlace(placeId);
    onClose();
  }

  return (
    <div className="bg-white border border-t-0 border-stone-200 rounded-b-lg px-6 py-5 -mt-1">
      {/* Properties */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-5">
        {place.address && (
          <div className="flex items-start gap-2">
            <span className="text-stone-400 w-20 flex-shrink-0">Address</span>
            <span>{place.address}</span>
          </div>
        )}
        {place.hours_note && (
          <div className="flex items-start gap-2">
            <span className="text-stone-400 w-20 flex-shrink-0">Hours</span>
            <span>{place.hours_note}</span>
          </div>
        )}
        {place.payment.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="text-stone-400 w-20 flex-shrink-0">Payment</span>
            <span>
              {place.payment
                .map((p) => PAYMENT_CONFIG[p as PaymentMethod]?.label || p)
                .join(", ")}
            </span>
          </div>
        )}
        {place.reservation_required && (
          <div className="flex items-start gap-2">
            <span className="text-stone-400 w-20 flex-shrink-0">Reserve</span>
            <span>
              Required
              {place.reservation_url && (
                <>
                  {" — "}
                  <a
                    href={place.reservation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:underline"
                  >
                    Book here
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
          <h4 className="text-xs font-medium text-stone-500 uppercase tracking-wide">
            Notes
          </h4>
          {!editingNotes && (
            <button
              onClick={() => {
                setNotesDraft(place.notes || "");
                setEditingNotes(true);
              }}
              className="text-xs text-stone-400 hover:text-stone-600"
            >
              Edit
            </button>
          )}
        </div>
        {editingNotes ? (
          <div>
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              placeholder="General notes about this place..."
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px] resize-y"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setEditingNotes(false)}
                className="text-xs text-stone-500 hover:text-stone-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="text-xs text-orange-500 hover:text-orange-600 font-medium"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-stone-600">
            {place.notes || (
              <span className="text-stone-400 italic">
                No notes yet. Click edit to add general notes.
              </span>
            )}
          </p>
        )}
      </div>

      {/* Summary */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="text-xs font-medium text-stone-500 uppercase tracking-wide">
            Summary
          </h4>
          {!editingSummary && (
            <button
              onClick={() => {
                setSummaryDraft(place.summary || "");
                setEditingSummary(true);
              }}
              className="text-xs text-stone-400 hover:text-stone-600"
            >
              Edit
            </button>
          )}
        </div>
        {editingSummary ? (
          <div>
            <textarea
              value={summaryDraft}
              onChange={(e) => setSummaryDraft(e.target.value)}
              placeholder="Add your notes — what to order, when to go, tips..."
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px] resize-y"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setEditingSummary(false)}
                className="text-xs text-stone-500 hover:text-stone-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSummary}
                className="text-xs text-orange-500 hover:text-orange-600 font-medium"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-stone-600">
            {place.summary || (
              <span className="text-stone-400 italic">
                No notes yet. Click edit to add tips and recommendations.
              </span>
            )}
          </p>
        )}
      </div>

      {/* Sources */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-medium text-stone-500 uppercase tracking-wide">
            Sources ({sources.length})
          </h4>
          <button
            onClick={() => setShowAddSource(!showAddSource)}
            className="text-xs text-orange-500 hover:text-orange-600 font-medium"
          >
            {showAddSource ? "Cancel" : "+ Add source"}
          </button>
        </div>

        {showAddSource && (
          <div className="mb-4">
            <AddSourceForm
              placeId={placeId}
              memberId={memberId}
              existingUrls={sources.map((s) => s.url)}
              onDone={() => setShowAddSource(false)}
            />
          </div>
        )}

        {sources.length === 0 && !showAddSource ? (
          <p className="text-xs text-stone-400 italic">
            No sources yet. Add a link from TikTok, RedNote, Instagram...
          </p>
        ) : (
          <div className="space-y-2">
            {sources.map((source) => {
              const plat = PLATFORM_CONFIG[source.platform];
              const vibe = VIBE_CONFIG[source.rating_vibe];
              return (
                <div
                  key={source.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-stone-50 border border-stone-100"
                >
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${plat.color}`}
                  >
                    {plat.icon} {plat.label}
                  </span>
                  <div className="min-w-0 flex-1">
                    {source.author && (
                      <span className="text-xs text-stone-500">
                        {source.author}
                      </span>
                    )}
                    {source.key_takeaway && (
                      <p className="text-sm text-stone-700 mt-0.5">
                        &ldquo;{source.key_takeaway}&rdquo;
                      </p>
                    )}
                    {source.caption && (
                      <p className="text-xs text-stone-400 mt-0.5 truncate">
                        {source.caption}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs">{vibe.emoji}</span>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-stone-400 hover:text-orange-500"
                    >
                      Open ↗
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-stone-100">
        <button
          onClick={onClose}
          className="text-xs text-stone-400 hover:text-stone-600"
        >
          Collapse
        </button>
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-500">Delete this place?</span>
            <button
              onClick={handleDelete}
              className="text-xs text-red-600 font-medium hover:text-red-700"
            >
              Yes, delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-stone-500 hover:text-stone-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-xs text-stone-400 hover:text-red-500"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

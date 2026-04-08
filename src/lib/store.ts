"use client";

import {
  Group,
  Member,
  City,
  Place,
  Source,
  DayPlan,
  DayPlanStop,
} from "./types";
import { supabase } from "./supabase";

const SESSION_KEY = "pocketto_session";

export interface StoreData {
  groups: Group[];
  members: Member[];
  cities: City[];
  places: Place[];
  sources: Source[];
  dayPlans: DayPlan[];
  dayPlanStops: DayPlanStop[];
  currentGroupId: string | null;
  currentMemberId: string | null;
  loaded: boolean;
}

const defaultData: StoreData = {
  groups: [],
  members: [],
  cities: [],
  places: [],
  sources: [],
  dayPlans: [],
  dayPlanStops: [],
  currentGroupId: null,
  currentMemberId: null,
  loaded: false,
};

let _data: StoreData = { ...defaultData };
let _listeners: (() => void)[] = [];

function notify(): void {
  _listeners.forEach((fn) => fn());
}

function setData(updates: Partial<StoreData>): void {
  _data = { ..._data, ...updates };
  notify();
}

export function subscribe(listener: () => void): () => void {
  _listeners.push(listener);
  return () => {
    _listeners = _listeners.filter((fn) => fn !== listener);
  };
}

export function getSnapshot(): StoreData {
  return _data;
}

// --- Session (localStorage only — just tracks which group/member you are) ---

function loadSession(): { groupId: string | null; memberId: string | null } {
  if (typeof window === "undefined") return { groupId: null, memberId: null };
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return { groupId: null, memberId: null };
    return JSON.parse(raw);
  } catch {
    return { groupId: null, memberId: null };
  }
}

function saveSession(groupId: string | null, memberId: string | null): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ groupId, memberId }));
}

// --- Init: load session + fetch data from Supabase ---

export async function initStore(): Promise<void> {
  const session = loadSession();
  _data = { ..._data, currentGroupId: session.groupId, currentMemberId: session.memberId };
  notify();

  if (session.groupId) {
    await fetchGroupData(session.groupId);
  }
  setData({ loaded: true });
}

async function fetchGroupData(groupId: string): Promise<void> {
  const [
    { data: groups },
    { data: members },
    { data: cities },
  ] = await Promise.all([
    supabase.from("groups").select("*").eq("id", groupId),
    supabase.from("members").select("*").eq("group_id", groupId),
    supabase.from("cities").select("*").eq("group_id", groupId).order("sort_order"),
  ]);

  const cityIds = (cities || []).map((c: City) => c.id);

  let places: Place[] = [];
  let sources: Source[] = [];
  let dayPlans: DayPlan[] = [];
  let dayPlanStops: DayPlanStop[] = [];

  if (cityIds.length > 0) {
    const [
      { data: placesData },
      { data: dayPlansData },
    ] = await Promise.all([
      supabase.from("places").select("*").in("city_id", cityIds),
      supabase.from("day_plans").select("*").in("city_id", cityIds).order("sort_order"),
    ]);

    places = placesData || [];
    dayPlans = dayPlansData || [];

    const placeIds = places.map((p) => p.id);
    const dayPlanIds = dayPlans.map((d) => d.id);

    const [
      { data: sourcesData },
      { data: stopsData },
    ] = await Promise.all([
      placeIds.length > 0
        ? supabase.from("sources").select("*").in("place_id", placeIds)
        : Promise.resolve({ data: [] }),
      dayPlanIds.length > 0
        ? supabase.from("day_plan_stops").select("*").in("day_plan_id", dayPlanIds).order("sort_order")
        : Promise.resolve({ data: [] }),
    ]);

    sources = sourcesData || [];
    dayPlanStops = stopsData || [];
  }

  setData({
    groups: groups || [],
    members: members || [],
    cities: cities || [],
    places: places.map(ensurePlaceDefaults),
    sources,
    dayPlans,
    dayPlanStops,
  });
}

// Supabase returns snake_case which matches our types directly.
// Just ensure defaults for nullable array/boolean fields.
function ensurePlaceDefaults(p: Place): Place {
  return { ...p, payment: p.payment || [], reservation_required: p.reservation_required || false };
}

// --- Helpers ---

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// --- Group ---

export async function createGroup(name: string, nickname: string): Promise<{ group: Group; member: Member } | null> {
  const invite_code = generateInviteCode();

  const { data: group, error: groupErr } = await supabase
    .from("groups")
    .insert({ name, invite_code })
    .select()
    .single();

  if (groupErr || !group) return null;

  const { data: member, error: memberErr } = await supabase
    .from("members")
    .insert({ group_id: group.id, nickname, is_owner: true })
    .select()
    .single();

  if (memberErr || !member) return null;

  saveSession(group.id, member.id);
  setData({
    groups: [group],
    members: [member],
    currentGroupId: group.id,
    currentMemberId: member.id,
  });

  return { group, member };
}

export async function joinGroup(inviteCode: string, nickname: string): Promise<{ group: Group; member: Member } | null> {
  const { data: group } = await supabase
    .from("groups")
    .select("*")
    .ilike("invite_code", inviteCode)
    .single();

  if (!group) return null;

  const { data: member, error } = await supabase
    .from("members")
    .insert({ group_id: group.id, nickname, is_owner: false })
    .select()
    .single();

  if (error || !member) return null;

  saveSession(group.id, member.id);
  await fetchGroupData(group.id);
  setData({
    currentGroupId: group.id,
    currentMemberId: member.id,
  });

  return { group, member };
}

export function clearSession(): void {
  saveSession(null, null);
  setData({ ...defaultData, loaded: true });
}

// --- Cities ---

export async function createCity(
  groupId: string,
  city: Partial<City> & { name: string }
): Promise<City | null> {
  const sort_order = _data.cities.filter((c) => c.group_id === groupId).length;

  const { data, error } = await supabase
    .from("cities")
    .insert({
      group_id: groupId,
      name: city.name,
      dates_start: city.dates_start || null,
      dates_end: city.dates_end || null,
      sort_order,
      stay_name: city.stay_name || null,
      stay_address: city.stay_address || null,
      stay_lat: city.stay_lat || null,
      stay_lng: city.stay_lng || null,
    })
    .select()
    .single();

  if (error || !data) return null;

  setData({ cities: [..._data.cities, data as City] });
  return data as City;
}

export async function updateCity(cityId: string, updates: Partial<City>): Promise<void> {
  // Optimistic update
  setData({
    cities: _data.cities.map((c) => (c.id === cityId ? { ...c, ...updates } : c)),
  });

  await supabase.from("cities").update(updates).eq("id", cityId);
}

export async function deleteCity(cityId: string): Promise<void> {
  // Optimistic update — cascade handled by DB
  const placeIds = _data.places.filter((p) => p.city_id === cityId).map((p) => p.id);
  const dayPlanIds = _data.dayPlans.filter((d) => d.city_id === cityId).map((d) => d.id);
  setData({
    cities: _data.cities.filter((c) => c.id !== cityId),
    places: _data.places.filter((p) => p.city_id !== cityId),
    sources: _data.sources.filter((s) => !placeIds.includes(s.place_id)),
    dayPlans: _data.dayPlans.filter((d) => d.city_id !== cityId),
    dayPlanStops: _data.dayPlanStops.filter((s) => !dayPlanIds.includes(s.day_plan_id)),
  });

  await supabase.from("cities").delete().eq("id", cityId);
}

// --- Places ---

export async function createPlace(
  cityId: string,
  memberId: string,
  place: Partial<Place> & { name: string; category: Place["category"]; priority: Place["priority"] }
): Promise<Place | null> {
  const { data, error } = await supabase
    .from("places")
    .insert({
      city_id: cityId,
      added_by: memberId,
      name: place.name,
      category: place.category,
      priority: place.priority,
      address: place.address || null,
      payment: place.payment || [],
      hours_note: place.hours_note || null,
      reservation_required: place.reservation_required || false,
      notes: place.notes || null,
    })
    .select()
    .single();

  if (error || !data) return null;

  const newPlace = ensurePlaceDefaults(data as Place);
  setData({ places: [..._data.places, newPlace] });
  return newPlace;
}

export async function updatePlace(placeId: string, updates: Partial<Place>): Promise<void> {
  setData({
    places: _data.places.map((p) => (p.id === placeId ? { ...p, ...updates } : p)),
  });

  await supabase.from("places").update(updates).eq("id", placeId);
}

export async function deletePlace(placeId: string): Promise<void> {
  setData({
    places: _data.places.filter((p) => p.id !== placeId),
    sources: _data.sources.filter((s) => s.place_id !== placeId),
    dayPlanStops: _data.dayPlanStops.filter((s) => s.place_id !== placeId),
  });

  await supabase.from("places").delete().eq("id", placeId);
}

// --- Sources ---

export async function createSource(
  placeId: string,
  memberId: string,
  source: Partial<Source> & { platform: Source["platform"]; url: string; rating_vibe: Source["rating_vibe"] }
): Promise<Source | null> {
  const { data, error } = await supabase
    .from("sources")
    .insert({
      place_id: placeId,
      added_by: memberId,
      platform: source.platform,
      url: source.url,
      author: source.author || null,
      caption: source.caption || null,
      key_takeaway: source.key_takeaway || null,
      rating_vibe: source.rating_vibe,
    })
    .select()
    .single();

  if (error || !data) return null;

  const newSource = data as Source;
  setData({ sources: [..._data.sources, newSource] });
  return newSource;
}

export async function deleteSource(sourceId: string): Promise<void> {
  setData({
    sources: _data.sources.filter((s) => s.id !== sourceId),
  });

  await supabase.from("sources").delete().eq("id", sourceId);
}

// --- Day Plans ---

export async function createDayPlan(cityId: string, label: string): Promise<DayPlan | null> {
  const sort_order = _data.dayPlans.filter((d) => d.city_id === cityId).length;

  const { data, error } = await supabase
    .from("day_plans")
    .insert({ city_id: cityId, label, sort_order })
    .select()
    .single();

  if (error || !data) return null;

  const newPlan = data as DayPlan;
  setData({ dayPlans: [..._data.dayPlans, newPlan] });
  return newPlan;
}

export async function updateDayPlan(planId: string, updates: Partial<DayPlan>): Promise<void> {
  setData({
    dayPlans: _data.dayPlans.map((d) => (d.id === planId ? { ...d, ...updates } : d)),
  });

  await supabase.from("day_plans").update(updates).eq("id", planId);
}

export async function deleteDayPlan(planId: string): Promise<void> {
  setData({
    dayPlans: _data.dayPlans.filter((d) => d.id !== planId),
    dayPlanStops: _data.dayPlanStops.filter((s) => s.day_plan_id !== planId),
  });

  await supabase.from("day_plans").delete().eq("id", planId);
}

// --- Day Plan Stops ---

export async function addStopToPlan(planId: string, placeId: string): Promise<DayPlanStop | null> {
  const sort_order = _data.dayPlanStops.filter((s) => s.day_plan_id === planId).length;

  const { data, error } = await supabase
    .from("day_plan_stops")
    .insert({ day_plan_id: planId, place_id: placeId, sort_order })
    .select()
    .single();

  if (error || !data) return null;

  const stop = data as DayPlanStop;
  setData({ dayPlanStops: [..._data.dayPlanStops, stop] });
  return stop;
}

export async function removeStopFromPlan(stopId: string): Promise<void> {
  setData({
    dayPlanStops: _data.dayPlanStops.filter((s) => s.id !== stopId),
  });

  await supabase.from("day_plan_stops").delete().eq("id", stopId);
}

export async function reorderStops(planId: string, orderedStopIds: string[]): Promise<void> {
  setData({
    dayPlanStops: _data.dayPlanStops.map((s) => {
      if (s.day_plan_id !== planId) return s;
      const idx = orderedStopIds.indexOf(s.id);
      return idx >= 0 ? { ...s, sort_order: idx } : s;
    }),
  });

  // Update each stop's sort_order in DB
  await Promise.all(
    orderedStopIds.map((id, idx) =>
      supabase.from("day_plan_stops").update({ sort_order: idx }).eq("id", id)
    )
  );
}

export async function moveStopToPlan(stopId: string, newPlanId: string): Promise<void> {
  const sort_order = _data.dayPlanStops.filter((s) => s.day_plan_id === newPlanId).length;

  setData({
    dayPlanStops: _data.dayPlanStops.map((s) =>
      s.id === stopId ? { ...s, day_plan_id: newPlanId, sort_order } : s
    ),
  });

  await supabase
    .from("day_plan_stops")
    .update({ day_plan_id: newPlanId, sort_order })
    .eq("id", stopId);
}

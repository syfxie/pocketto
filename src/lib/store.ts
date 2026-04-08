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

const STORAGE_KEY = "pocketto_data";

export interface StoreData {
  groups: Group[];
  members: Member[];
  cities: City[];
  places: Place[];
  sources: Source[];
  dayPlans: DayPlan[];
  dayPlanStops: DayPlanStop[];
  // Current session
  currentGroupId: string | null;
  currentMemberId: string | null;
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
};

function loadData(): StoreData {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Auto-seed on first load
      const { SEED_DATA } = require("./seed");
      saveData(SEED_DATA);
      return SEED_DATA;
    }
    return { ...defaultData, ...JSON.parse(raw) };
  } catch {
    return defaultData;
  }
}

function saveData(data: StoreData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let _data: StoreData | null = null;
let _listeners: (() => void)[] = [];

function getData(): StoreData {
  if (!_data) _data = loadData();
  return _data;
}

function setData(data: StoreData): void {
  _data = data;
  saveData(data);
  _listeners.forEach((fn) => fn());
}

export function subscribe(listener: () => void): () => void {
  _listeners.push(listener);
  return () => {
    _listeners = _listeners.filter((fn) => fn !== listener);
  };
}

export function getSnapshot(): StoreData {
  return getData();
}

// --- Helpers ---

function generateId(): string {
  return crypto.randomUUID();
}

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// --- Group ---

export function createGroup(name: string, nickname: string): { group: Group; member: Member } {
  const data = getData();
  const group: Group = {
    id: generateId(),
    name,
    invite_code: generateInviteCode(),
    created_at: new Date().toISOString(),
  };
  const member: Member = {
    id: generateId(),
    group_id: group.id,
    nickname,
    is_owner: true,
    created_at: new Date().toISOString(),
  };
  setData({
    ...data,
    groups: [...data.groups, group],
    members: [...data.members, member],
    currentGroupId: group.id,
    currentMemberId: member.id,
  });
  return { group, member };
}

export function joinGroup(inviteCode: string, nickname: string): { group: Group; member: Member } | null {
  const data = getData();
  const group = data.groups.find(
    (g) => g.invite_code.toUpperCase() === inviteCode.toUpperCase()
  );
  if (!group) return null;
  const member: Member = {
    id: generateId(),
    group_id: group.id,
    nickname,
    is_owner: false,
    created_at: new Date().toISOString(),
  };
  setData({
    ...data,
    members: [...data.members, member],
    currentGroupId: group.id,
    currentMemberId: member.id,
  });
  return { group, member };
}

export function getCurrentGroup(): Group | null {
  const data = getData();
  if (!data.currentGroupId) return null;
  return data.groups.find((g) => g.id === data.currentGroupId) ?? null;
}

export function getCurrentMember(): Member | null {
  const data = getData();
  if (!data.currentMemberId) return null;
  return data.members.find((m) => m.id === data.currentMemberId) ?? null;
}

export function setCurrentSession(groupId: string, memberId: string): void {
  const data = getData();
  setData({ ...data, currentGroupId: groupId, currentMemberId: memberId });
}

export function clearSession(): void {
  const data = getData();
  setData({ ...data, currentGroupId: null, currentMemberId: null });
}

// --- Cities ---

export function getCities(groupId: string): City[] {
  return getData()
    .cities.filter((c) => c.group_id === groupId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getCity(cityId: string): City | null {
  return getData().cities.find((c) => c.id === cityId) ?? null;
}

export function createCity(
  groupId: string,
  city: Partial<City> & { name: string }
): City {
  const data = getData();
  const existing = data.cities.filter((c) => c.group_id === groupId);
  const newCity: City = {
    id: generateId(),
    group_id: groupId,
    name: city.name,
    center_lat: city.center_lat ?? null,
    center_lng: city.center_lng ?? null,
    center_lat_gcj: city.center_lat_gcj ?? null,
    center_lng_gcj: city.center_lng_gcj ?? null,
    dates_start: city.dates_start ?? null,
    dates_end: city.dates_end ?? null,
    sort_order: existing.length,
    stay_name: city.stay_name ?? null,
    stay_address: city.stay_address ?? null,
    stay_lat: city.stay_lat ?? null,
    stay_lng: city.stay_lng ?? null,
    stay_lat_gcj: city.stay_lat_gcj ?? null,
    stay_lng_gcj: city.stay_lng_gcj ?? null,
    stay_checkin: city.stay_checkin ?? null,
    stay_checkout: city.stay_checkout ?? null,
    created_at: new Date().toISOString(),
  };
  setData({ ...data, cities: [...data.cities, newCity] });
  return newCity;
}

export function updateCity(cityId: string, updates: Partial<City>): void {
  const data = getData();
  setData({
    ...data,
    cities: data.cities.map((c) =>
      c.id === cityId ? { ...c, ...updates } : c
    ),
  });
}

export function deleteCity(cityId: string): void {
  const data = getData();
  const placeIds = data.places.filter((p) => p.city_id === cityId).map((p) => p.id);
  const dayPlanIds = data.dayPlans.filter((d) => d.city_id === cityId).map((d) => d.id);
  setData({
    ...data,
    cities: data.cities.filter((c) => c.id !== cityId),
    places: data.places.filter((p) => p.city_id !== cityId),
    sources: data.sources.filter((s) => !placeIds.includes(s.place_id)),
    dayPlans: data.dayPlans.filter((d) => d.city_id !== cityId),
    dayPlanStops: data.dayPlanStops.filter((s) => !dayPlanIds.includes(s.day_plan_id)),
  });
}

// --- Places ---

export function getPlaces(cityId: string): Place[] {
  return getData().places.filter((p) => p.city_id === cityId);
}

export function getPlace(placeId: string): Place | null {
  return getData().places.find((p) => p.id === placeId) ?? null;
}

export function createPlace(
  cityId: string,
  memberId: string,
  place: Partial<Place> & { name: string; category: Place["category"]; priority: Place["priority"] }
): Place {
  const data = getData();
  const newPlace: Place = {
    id: generateId(),
    city_id: cityId,
    added_by: memberId,
    name: place.name,
    category: place.category,
    priority: place.priority,
    lat: place.lat ?? null,
    lng: place.lng ?? null,
    lat_gcj: place.lat_gcj ?? null,
    lng_gcj: place.lng_gcj ?? null,
    address: place.address ?? null,
    payment: place.payment ?? [],
    hours_note: place.hours_note ?? null,
    reservation_required: place.reservation_required ?? false,
    reservation_url: place.reservation_url ?? null,
    notes: place.notes ?? null,
    summary: place.summary ?? null,
    created_at: new Date().toISOString(),
  };
  setData({ ...data, places: [...data.places, newPlace] });
  return newPlace;
}

export function updatePlace(placeId: string, updates: Partial<Place>): void {
  const data = getData();
  setData({
    ...data,
    places: data.places.map((p) =>
      p.id === placeId ? { ...p, ...updates } : p
    ),
  });
}

export function deletePlace(placeId: string): void {
  const data = getData();
  setData({
    ...data,
    places: data.places.filter((p) => p.id !== placeId),
    sources: data.sources.filter((s) => s.place_id !== placeId),
    dayPlanStops: data.dayPlanStops.filter((s) => s.place_id !== placeId),
  });
}

// --- Sources ---

export function getSources(placeId: string): Source[] {
  return getData()
    .sources.filter((s) => s.place_id === placeId)
    .sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime());
}

export function getSourceCount(placeId: string): number {
  return getData().sources.filter((s) => s.place_id === placeId).length;
}

export function createSource(
  placeId: string,
  memberId: string,
  source: Partial<Source> & { platform: Source["platform"]; url: string; rating_vibe: Source["rating_vibe"] }
): Source {
  const data = getData();
  const newSource: Source = {
    id: generateId(),
    place_id: placeId,
    added_by: memberId,
    platform: source.platform,
    url: source.url,
    author: source.author ?? null,
    caption: source.caption ?? null,
    key_takeaway: source.key_takeaway ?? null,
    rating_vibe: source.rating_vibe,
    screenshot_url: source.screenshot_url ?? null,
    added_at: new Date().toISOString(),
  };
  setData({ ...data, sources: [...data.sources, newSource] });
  return newSource;
}

export function deleteSource(sourceId: string): void {
  const data = getData();
  setData({
    ...data,
    sources: data.sources.filter((s) => s.id !== sourceId),
  });
}

// --- Day Plans ---

export function getDayPlans(cityId: string): DayPlan[] {
  return getData()
    .dayPlans.filter((d) => d.city_id === cityId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function createDayPlan(cityId: string, label: string): DayPlan {
  const data = getData();
  const existing = data.dayPlans.filter((d) => d.city_id === cityId);
  const newPlan: DayPlan = {
    id: generateId(),
    city_id: cityId,
    date: null,
    label,
    sort_order: existing.length,
  };
  setData({ ...data, dayPlans: [...data.dayPlans, newPlan] });
  return newPlan;
}

export function updateDayPlan(planId: string, updates: Partial<DayPlan>): void {
  const data = getData();
  setData({
    ...data,
    dayPlans: data.dayPlans.map((d) =>
      d.id === planId ? { ...d, ...updates } : d
    ),
  });
}

export function deleteDayPlan(planId: string): void {
  const data = getData();
  setData({
    ...data,
    dayPlans: data.dayPlans.filter((d) => d.id !== planId),
    dayPlanStops: data.dayPlanStops.filter((s) => s.day_plan_id !== planId),
  });
}

// --- Day Plan Stops ---

export function getDayPlanStops(planId: string): DayPlanStop[] {
  return getData()
    .dayPlanStops.filter((s) => s.day_plan_id === planId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function addStopToPlan(planId: string, placeId: string): DayPlanStop {
  const data = getData();
  const existing = data.dayPlanStops.filter((s) => s.day_plan_id === planId);
  const stop: DayPlanStop = {
    id: generateId(),
    day_plan_id: planId,
    place_id: placeId,
    sort_order: existing.length,
    arrival_time: null,
    notes: null,
  };
  setData({ ...data, dayPlanStops: [...data.dayPlanStops, stop] });
  return stop;
}

export function removeStopFromPlan(stopId: string): void {
  const data = getData();
  setData({
    ...data,
    dayPlanStops: data.dayPlanStops.filter((s) => s.id !== stopId),
  });
}

export function reorderStops(planId: string, orderedStopIds: string[]): void {
  const data = getData();
  setData({
    ...data,
    dayPlanStops: data.dayPlanStops.map((s) => {
      if (s.day_plan_id !== planId) return s;
      const idx = orderedStopIds.indexOf(s.id);
      return idx >= 0 ? { ...s, sort_order: idx } : s;
    }),
  });
}

export function moveStopToPlan(stopId: string, newPlanId: string): void {
  const data = getData();
  const existing = data.dayPlanStops.filter((s) => s.day_plan_id === newPlanId);
  setData({
    ...data,
    dayPlanStops: data.dayPlanStops.map((s) =>
      s.id === stopId
        ? { ...s, day_plan_id: newPlanId, sort_order: existing.length }
        : s
    ),
  });
}

"use client";

import { useSyncExternalStore, useCallback } from "react";
import { getSnapshot, subscribe, StoreData } from "./store";

export function useStore(): StoreData {
  return useSyncExternalStore(subscribe, getSnapshot, () => ({
    groups: [],
    members: [],
    cities: [],
    places: [],
    sources: [],
    dayPlans: [],
    dayPlanStops: [],
    currentGroupId: null,
    currentMemberId: null,
  }));
}

export function useCurrentGroup() {
  const data = useStore();
  const group = data.currentGroupId
    ? data.groups.find((g) => g.id === data.currentGroupId) ?? null
    : null;
  const member = data.currentMemberId
    ? data.members.find((m) => m.id === data.currentMemberId) ?? null
    : null;
  return { group, member };
}

export function useCities() {
  const data = useStore();
  const { group } = useCurrentGroup();
  if (!group) return [];
  return data.cities
    .filter((c) => c.group_id === group.id)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function useCity(cityId: string) {
  const data = useStore();
  return data.cities.find((c) => c.id === cityId) ?? null;
}

export function usePlaces(cityId: string) {
  const data = useStore();
  return data.places.filter((p) => p.city_id === cityId);
}

export function useSources(placeId: string) {
  const data = useStore();
  return data.sources
    .filter((s) => s.place_id === placeId)
    .sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime());
}

export function useSourceCount(placeId: string) {
  const data = useStore();
  return data.sources.filter((s) => s.place_id === placeId).length;
}

export function useDayPlans(cityId: string) {
  const data = useStore();
  return data.dayPlans
    .filter((d) => d.city_id === cityId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function useDayPlanStops(planId: string) {
  const data = useStore();
  return data.dayPlanStops
    .filter((s) => s.day_plan_id === planId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

// Food & Drink
export type FoodCategory =
  | "breakfast"
  | "brunch"
  | "lunch"
  | "dinner"
  | "hotpot"
  | "bbq"
  | "street_food"
  | "noodles"
  | "dumplings"
  | "cafe"
  | "tea_house"
  | "bar"
  | "dessert"
  | "ice_cream"
  | "bakery"
  | "bubble_tea";

// Activities & Shopping
export type ActivityCategory =
  | "tourist"
  | "temple"
  | "museum"
  | "park"
  | "nature"
  | "nightlife"
  | "experience"
  | "shopping_mall"
  | "market"
  | "shop"
  | "photo_spot";

export type Category = FoodCategory | ActivityCategory;

export type Priority = "must_go" | "want_to" | "if_time";

export type Platform =
  | "tiktok"
  | "rednote"
  | "instagram"
  | "youtube"
  | "other";

export type RatingVibe = "loved" | "recommended" | "mixed" | "warned_against";

export type PaymentMethod =
  | "wechat_pay"
  | "alipay"
  | "cash"
  | "foreign_card";

export interface Group {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
}

export interface Member {
  id: string;
  group_id: string;
  nickname: string;
  is_owner: boolean;
  created_at: string;
}

export interface City {
  id: string;
  group_id: string;
  name_en: string;
  name_zh: string;
  center_lat: number | null;
  center_lng: number | null;
  center_lat_gcj: number | null;
  center_lng_gcj: number | null;
  dates_start: string | null;
  dates_end: string | null;
  sort_order: number;
  stay_name: string | null;
  stay_address: string | null;
  stay_lat: number | null;
  stay_lng: number | null;
  stay_lat_gcj: number | null;
  stay_lng_gcj: number | null;
  stay_checkin: string | null;
  stay_checkout: string | null;
  created_at: string;
}

export interface Place {
  id: string;
  city_id: string;
  added_by: string;
  name_en: string;
  name_zh: string;
  name_pinyin: string | null;
  category: Category;
  priority: Priority;
  lat: number | null;
  lng: number | null;
  lat_gcj: number | null;
  lng_gcj: number | null;
  address: string | null;
  payment: PaymentMethod[];
  hours_note: string | null;
  reservation_required: boolean;
  reservation_url: string | null;
  summary: string | null;
  created_at: string;
}

export interface Source {
  id: string;
  place_id: string;
  added_by: string;
  platform: Platform;
  url: string;
  author: string | null;
  caption: string | null;
  key_takeaway: string | null;
  rating_vibe: RatingVibe;
  screenshot_url: string | null;
  added_at: string;
}

export interface DayPlan {
  id: string;
  city_id: string;
  date: string | null;
  label: string;
  sort_order: number;
}

export interface DayPlanStop {
  id: string;
  day_plan_id: string;
  place_id: string;
  sort_order: number;
  arrival_time: string | null;
  notes: string | null;
}

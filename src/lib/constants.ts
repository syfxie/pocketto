import { Category, Platform, Priority, RatingVibe, PaymentMethod } from "./types";

export const CATEGORY_CONFIG: Record<Category, { label: string; emoji: string; group: "food" | "activity" }> = {
  // Food & Drink
  breakfast: { label: "Breakfast", emoji: "🥞", group: "food" },
  brunch: { label: "Brunch", emoji: "🍳", group: "food" },
  lunch: { label: "Lunch", emoji: "🍱", group: "food" },
  dinner: { label: "Dinner", emoji: "🍽", group: "food" },
  hotpot: { label: "Hotpot", emoji: "🫕", group: "food" },
  bbq: { label: "BBQ", emoji: "🥩", group: "food" },
  street_food: { label: "Street Food", emoji: "🥟", group: "food" },
  noodles: { label: "Noodles", emoji: "🍜", group: "food" },
  dumplings: { label: "Dumplings", emoji: "🥟", group: "food" },
  cafe: { label: "Cafe", emoji: "☕", group: "food" },
  tea_house: { label: "Tea House", emoji: "🍵", group: "food" },
  bar: { label: "Bar", emoji: "🍸", group: "food" },
  dessert: { label: "Dessert", emoji: "🍰", group: "food" },
  ice_cream: { label: "Ice Cream", emoji: "🍦", group: "food" },
  bakery: { label: "Bakery", emoji: "🥐", group: "food" },
  bubble_tea: { label: "Bubble Tea", emoji: "🧋", group: "food" },
  // Activities
  tourist: { label: "Tourist Spot", emoji: "📸", group: "activity" },
  temple: { label: "Temple", emoji: "⛩", group: "activity" },
  museum: { label: "Museum", emoji: "🏛", group: "activity" },
  park: { label: "Park", emoji: "🌳", group: "activity" },
  nature: { label: "Nature", emoji: "🏔", group: "activity" },
  nightlife: { label: "Nightlife", emoji: "🌃", group: "activity" },
  experience: { label: "Experience", emoji: "✨", group: "activity" },
  shopping_mall: { label: "Mall", emoji: "🛍", group: "activity" },
  market: { label: "Market", emoji: "🏪", group: "activity" },
  shop: { label: "Shop", emoji: "🏬", group: "activity" },
  photo_spot: { label: "Photo Spot", emoji: "📷", group: "activity" },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  must_go: { label: "Must Go", color: "bg-red-100 text-red-700" },
  want_to: { label: "Want To", color: "bg-amber-100 text-amber-700" },
  if_time: { label: "If Time", color: "bg-gray-100 text-gray-600" },
};

export const PLATFORM_CONFIG: Record<Platform, { label: string; color: string; icon: string }> = {
  tiktok: { label: "TikTok", color: "bg-pink-100 text-pink-700", icon: "♪" },
  rednote: { label: "RedNote", color: "bg-red-100 text-red-700", icon: "📕" },
  instagram: { label: "Instagram", color: "bg-purple-100 text-purple-700", icon: "📷" },
  youtube: { label: "YouTube", color: "bg-red-100 text-red-600", icon: "▶" },
  other: { label: "Other", color: "bg-gray-100 text-gray-600", icon: "🔗" },
};

export const VIBE_CONFIG: Record<RatingVibe, { label: string; emoji: string }> = {
  loved: { label: "Loved", emoji: "❤️" },
  recommended: { label: "Recommended", emoji: "👍" },
  mixed: { label: "Mixed", emoji: "🤷" },
  warned_against: { label: "Skip", emoji: "👎" },
};

export const PAYMENT_CONFIG: Record<PaymentMethod, { label: string }> = {
  wechat_pay: { label: "WeChat Pay" },
  alipay: { label: "Alipay" },
  cash: { label: "Cash" },
  foreign_card: { label: "Foreign Card" },
};

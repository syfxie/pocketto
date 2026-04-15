"use client";

export type Locale = "en" | "zh";

const LOCALE_KEY = "pocketto_locale";

let _locale: Locale = "en";
let _listeners: (() => void)[] = [];

export function getLocale(): Locale {
  if (typeof window === "undefined") return "en";
  if (!_locale) {
    _locale = (localStorage.getItem(LOCALE_KEY) as Locale) || "en";
  }
  return _locale;
}

export function setLocale(locale: Locale) {
  _locale = locale;
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCALE_KEY, locale);
  }
  _listeners.forEach((fn) => fn());
}

export function subscribeLocale(listener: () => void): () => void {
  _listeners.push(listener);
  return () => {
    _listeners = _listeners.filter((fn) => fn !== listener);
  };
}

// --- Translations ---

const translations = {
  // Landing
  "app.name": { en: "pocketto", zh: "pocketto" },
  "app.tagline": { en: "trip planner", zh: "旅行计划" },
  "landing.create": { en: "Create a new group", zh: "创建新组" },
  "landing.join": { en: "Join with invite code", zh: "用邀请码加入" },
  "landing.groupName": { en: "Group name", zh: "组名" },
  "landing.nickname": { en: "Your nickname", zh: "你的昵称" },
  "landing.inviteCode": { en: "Invite code", zh: "邀请码" },
  "landing.back": { en: "Back", zh: "返回" },
  "landing.createBtn": { en: "Create", zh: "创建" },
  "landing.joinBtn": { en: "Join", zh: "加入" },
  "landing.invalidCode": { en: "Invalid invite code. Check and try again.", zh: "无效邀请码，请检查后重试。" },

  // Home
  "home.cities": { en: "Cities", zh: "城市" },
  "home.addCity": { en: "+ Add city", zh: "+ 添加城市" },
  "home.noCities": { en: "No cities yet. Start planning your trip!", zh: "还没有城市，开始规划你的旅行吧！" },
  "home.addFirst": { en: "+ Add your first city", zh: "+ 添加第一个城市" },
  "home.inviteCode": { en: "Invite code", zh: "邀请码" },
  "home.shareCode": { en: "Share this code:", zh: "分享此邀请码：" },
  "home.copy": { en: "Copy", zh: "复制" },
  "home.leave": { en: "Leave", zh: "离开" },
  "home.loggedIn": { en: "Logged in as", zh: "已登录" },
  "home.places": { en: "places saved", zh: "个地点已保存" },
  "home.place": { en: "place saved", zh: "个地点已保存" },
  "home.today": { en: "Today", zh: "今日行程" },
  "home.stops": { en: "stops planned", zh: "个站点" },
  "home.stop": { en: "stop planned", zh: "个站点" },

  // City view
  "city.back": { en: "← Cities", zh: "← 城市" },
  "city.edit": { en: "Edit", zh: "编辑" },
  "city.dayPlanner": { en: "Day Planner", zh: "日程" },
  "city.planner": { en: "Planner", zh: "日程" },
  "city.import": { en: "Import", zh: "导入" },
  "city.addPlace": { en: "+ Add place", zh: "+ 添加地点" },
  "city.add": { en: "+ Add", zh: "+ 添加" },
  "city.search": { en: "Search...", zh: "搜索..." },
  "city.all": { en: "All", zh: "全部" },
  "city.noPlaces": { en: "No places saved yet. Start adding your finds!", zh: "还没有地点，开始添加吧！" },
  "city.noMatch": { en: "No places match your filters.", zh: "没有匹配的地点。" },
  "city.addFirst": { en: "+ Add your first place", zh: "+ 添加第一个地点" },

  // Sort
  "sort.newest": { en: "Newest", zh: "最新" },
  "sort.name": { en: "A-Z", zh: "名称" },
  "sort.priority": { en: "Priority", zh: "优先级" },
  "sort.sources": { en: "Sources", zh: "来源数" },
  "sort.confidence": { en: "Confidence", zh: "推荐度" },

  // Place detail
  "place.address": { en: "Address", zh: "地址" },
  "place.hours": { en: "Hours", zh: "营业时间" },
  "place.payment": { en: "Payment", zh: "支付方式" },
  "place.reserve": { en: "Reserve", zh: "预约" },
  "place.required": { en: "Required", zh: "需要预约" },
  "place.bookHere": { en: "Book here", zh: "预约链接" },
  "place.notes": { en: "Notes", zh: "笔记" },
  "place.summary": { en: "Summary", zh: "总结" },
  "place.sources": { en: "Sources", zh: "来源" },
  "place.addSource": { en: "+ Add source", zh: "+ 添加来源" },
  "place.noNotes": { en: "No notes yet. Click edit to add general notes.", zh: "暂无笔记。点击编辑添加。" },
  "place.noSummary": { en: "No summary yet. Click edit to add tips and recommendations.", zh: "暂无总结。点击编辑添加推荐和建议。" },
  "place.noSources": { en: "No sources yet. Add a link from TikTok, RedNote, Instagram...", zh: "暂无来源。添加抖音、小红书、Instagram链接..." },
  "place.visited": { en: "Visited?", zh: "去过了吗？" },
  "place.collapse": { en: "Collapse", zh: "收起" },
  "place.delete": { en: "Delete", zh: "删除" },
  "place.confirmDelete": { en: "Delete this place?", zh: "删除此地点？" },
  "place.yes": { en: "Yes, delete", zh: "确认删除" },
  "place.addAddress": { en: "Add address", zh: "添加地址" },
  "place.addHours": { en: "Add hours", zh: "添加营业时间" },
  "place.save": { en: "Save", zh: "保存" },
  "place.cancel": { en: "Cancel", zh: "取消" },
  "place.edit": { en: "Edit", zh: "编辑" },
  "place.open": { en: "Open ↗", zh: "打开 ↗" },

  // Add place modal
  "addPlace.title": { en: "Add a place", zh: "添加地点" },
  "addPlace.name": { en: "Name", zh: "名称" },
  "addPlace.category": { en: "Category", zh: "分类" },
  "addPlace.priority": { en: "Priority", zh: "优先级" },
  "addPlace.address": { en: "Address", zh: "地址" },
  "addPlace.hoursNote": { en: "Hours note (optional)", zh: "营业时间备注（可选）" },
  "addPlace.source": { en: "Source (optional — add the link that led you here)", zh: "来源（可选 — 添加推荐链接）" },
  "addPlace.cancel": { en: "Cancel", zh: "取消" },
  "addPlace.submit": { en: "Add place", zh: "添加地点" },

  // Add city modal
  "addCity.title": { en: "Add a city", zh: "添加城市" },
  "addCity.name": { en: "City name", zh: "城市名称" },
  "addCity.arrive": { en: "Arrive", zh: "到达" },
  "addCity.depart": { en: "Depart", zh: "离开" },
  "addCity.lodging": { en: "Lodging (optional)", zh: "住宿（可选）" },
  "addCity.hotel": { en: "Hotel / Airbnb name", zh: "酒店/民宿名称" },
  "addCity.cancel": { en: "Cancel", zh: "取消" },
  "addCity.submit": { en: "Add city", zh: "添加城市" },

  // Edit city
  "editCity.title": { en: "Edit city", zh: "编辑城市" },
  "editCity.save": { en: "Save", zh: "保存" },

  // Day planner
  "planner.title": { en: "Day Planner", zh: "日程安排" },
  "planner.addDay": { en: "+ Add day", zh: "+ 添加日程" },
  "planner.unplanned": { en: "Unplanned", zh: "未安排" },
  "planner.allAssigned": { en: "All places assigned!", zh: "所有地点已安排！" },
  "planner.noPlans": { en: "No days planned yet. Add a day to start building your itinerary.", zh: "还没有日程，添加一天开始规划。" },
  "planner.addFirst": { en: "+ Add your first day", zh: "+ 添加第一天" },
  "planner.dragHere": { en: "Drag places here", zh: "拖拽地点到这里" },
  "planner.removeDay": { en: "Remove day", zh: "删除日程" },
  "planner.stops": { en: "stops", zh: "站点" },
  "planner.stop": { en: "stop", zh: "站点" },

  // Quick add
  "quickAdd.title": { en: "Quick Add", zh: "快速添加" },
  "quickAdd.paste": { en: "Paste link...", zh: "粘贴链接..." },
  "quickAdd.city": { en: "City", zh: "城市" },
  "quickAdd.place": { en: "Place", zh: "地点" },
  "quickAdd.newPlace": { en: "New place", zh: "新地点" },
  "quickAdd.existing": { en: "Existing place", zh: "已有地点" },
  "quickAdd.placeName": { en: "Place name", zh: "地点名称" },
  "quickAdd.takeaway": { en: "Key takeaway", zh: "要点" },
  "quickAdd.tip": { en: "What's the tip? (optional)", zh: "有什么建议？（可选）" },
  "quickAdd.vibe": { en: "Vibe", zh: "评价" },
  "quickAdd.save": { en: "Save", zh: "保存" },
  "quickAdd.saving": { en: "Saving...", zh: "保存中..." },
  "quickAdd.saved": { en: "Saved", zh: "已保存" },
  "quickAdd.addAnother": { en: "Add another", zh: "继续添加" },
  "quickAdd.viewCity": { en: "View city", zh: "查看城市" },
  "quickAdd.joinFirst": { en: "You need to join a group first.", zh: "请先加入一个组。" },
  "quickAdd.addCityFirst": { en: "Add a city first before saving places.", zh: "请先添加城市。" },
  "quickAdd.goHome": { en: "Go to home", zh: "去首页" },
  "quickAdd.goCities": { en: "Go to cities", zh: "去城市列表" },
  "quickAdd.search": { en: "Search places...", zh: "搜索地点..." },
  "quickAdd.noPlaces": { en: "No places found", zh: "未找到地点" },

  // Bulk import
  "import.title": { en: "Bulk Import", zh: "批量导入" },
  "import.subtitle": { en: "Paste links or text containing URLs", zh: "粘贴包含链接的文字" },
  "import.placeholder": { en: "Paste URLs here (one per line), or paste text with links embedded...", zh: "在此粘贴链接（每行一个），或粘贴含链接的文字..." },
  "import.detected": { en: "URLs detected", zh: "个链接已识别" },
  "import.extract": { en: "Extract & assign", zh: "提取并分配" },
  "import.startOver": { en: "Start over", zh: "重新开始" },
  "import.ready": { en: "ready", zh: "就绪" },
  "import.saved": { en: "saved", zh: "已保存" },
  "import.links": { en: "links", zh: "个链接" },
  "import.newPlace": { en: "New place", zh: "新地点" },
  "import.existing": { en: "Existing", zh: "已有" },
  "import.selectPlace": { en: "Select a place...", zh: "选择地点..." },
  "import.takeaway": { en: "Key takeaway (optional)", zh: "要点（可选）" },

  // Source form
  "source.paste": { en: "Paste link from TikTok, RedNote, Instagram...", zh: "粘贴抖音、小红书、Instagram链接..." },
  "source.duplicate": { en: "This link may already be saved for this place.", zh: "此链接可能已保存过。" },
  "source.platform": { en: "Platform", zh: "平台" },
  "source.author": { en: "Author", zh: "作者" },
  "source.takeaway": { en: "Key takeaway", zh: "要点" },
  "source.takeawayHint": { en: "What's the main tip? e.g. 'Order the mapo tofu, skip the fish'", zh: "核心建议，如'点麻婆豆腐，不点鱼'" },
  "source.vibe": { en: "Vibe", zh: "评价" },
  "source.caption": { en: "Caption / title (optional)", zh: "标题/描述（可选）" },
  "source.cancel": { en: "Cancel", zh: "取消" },
  "source.submit": { en: "Add source", zh: "添加来源" },

  // Food categories
  "cat.food": { en: "Food & Drink", zh: "美食" },
  "cat.activity": { en: "Activities & Shopping", zh: "活动和购物" },

  // Misc
  "misc.loading": { en: "Loading...", zh: "加载中..." },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[getLocale()] || entry.en;
}

// Initialize locale from localStorage
if (typeof window !== "undefined") {
  const saved = localStorage.getItem(LOCALE_KEY) as Locale | null;
  if (saved) _locale = saved;
}

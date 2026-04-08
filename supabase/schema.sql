-- Pocketto Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/qjuicphcoxlsicchkwxl/sql

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Groups
create table groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  invite_code text unique not null,
  created_at timestamptz default now()
);

-- Members
create table members (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references groups(id) on delete cascade not null,
  nickname text not null,
  is_owner boolean default false,
  created_at timestamptz default now()
);

-- Cities
create table cities (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references groups(id) on delete cascade not null,
  name text not null,
  center_lat decimal,
  center_lng decimal,
  center_lat_gcj decimal,
  center_lng_gcj decimal,
  dates_start date,
  dates_end date,
  sort_order integer default 0,
  stay_name text,
  stay_address text,
  stay_lat decimal,
  stay_lng decimal,
  stay_lat_gcj decimal,
  stay_lng_gcj decimal,
  stay_checkin date,
  stay_checkout date,
  created_at timestamptz default now()
);

-- Places
create table places (
  id uuid primary key default uuid_generate_v4(),
  city_id uuid references cities(id) on delete cascade not null,
  added_by uuid references members(id) not null,
  name text not null,
  category text not null,
  priority text not null default 'want_to',
  lat decimal,
  lng decimal,
  lat_gcj decimal,
  lng_gcj decimal,
  address text,
  payment text[] default '{}',
  hours_note text,
  reservation_required boolean default false,
  reservation_url text,
  notes text,
  summary text,
  created_at timestamptz default now()
);

-- Sources
create table sources (
  id uuid primary key default uuid_generate_v4(),
  place_id uuid references places(id) on delete cascade not null,
  added_by uuid references members(id) not null,
  platform text not null,
  url text not null,
  author text,
  caption text,
  key_takeaway text,
  rating_vibe text not null default 'recommended',
  screenshot_url text,
  added_at timestamptz default now()
);

-- Day Plans
create table day_plans (
  id uuid primary key default uuid_generate_v4(),
  city_id uuid references cities(id) on delete cascade not null,
  date date,
  label text not null,
  sort_order integer default 0
);

-- Day Plan Stops
create table day_plan_stops (
  id uuid primary key default uuid_generate_v4(),
  day_plan_id uuid references day_plans(id) on delete cascade not null,
  place_id uuid references places(id) on delete cascade not null,
  sort_order integer default 0,
  arrival_time time,
  notes text
);

-- Indexes
create index idx_members_group on members(group_id);
create index idx_cities_group on cities(group_id);
create index idx_places_city on places(city_id);
create index idx_sources_place on sources(place_id);
create index idx_day_plans_city on day_plans(city_id);
create index idx_day_plan_stops_plan on day_plan_stops(day_plan_id);
create index idx_groups_invite_code on groups(invite_code);

-- Row Level Security (allow all for now — no auth)
alter table groups enable row level security;
alter table members enable row level security;
alter table cities enable row level security;
alter table places enable row level security;
alter table sources enable row level security;
alter table day_plans enable row level security;
alter table day_plan_stops enable row level security;

-- Permissive policies (open access via anon key)
create policy "Allow all" on groups for all using (true) with check (true);
create policy "Allow all" on members for all using (true) with check (true);
create policy "Allow all" on cities for all using (true) with check (true);
create policy "Allow all" on places for all using (true) with check (true);
create policy "Allow all" on sources for all using (true) with check (true);
create policy "Allow all" on day_plans for all using (true) with check (true);
create policy "Allow all" on day_plan_stops for all using (true) with check (true);

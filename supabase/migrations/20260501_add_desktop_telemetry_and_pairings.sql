create table if not exists public.desktop_pairings (
  desktop_profile_id uuid not null references public.profiles(id) on delete cascade,
  mobile_profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'inactive')),
  paired_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (desktop_profile_id, mobile_profile_id)
);

create index if not exists desktop_pairings_mobile_profile_idx
on public.desktop_pairings (mobile_profile_id, updated_at desc);

create table if not exists public.desktop_telemetry_daily (
  desktop_profile_id uuid not null references public.profiles(id) on delete cascade,
  snapshot_date date not null,
  web_browsing_seconds integer not null default 0,
  weighted_video_seconds double precision not null default 0,
  page_load_count integer not null default 0,
  data_transfer_bytes bigint not null default 0,
  website_category_time jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null default timezone('utc', now()),
  primary key (desktop_profile_id, snapshot_date)
);

alter table public.desktop_pairings enable row level security;
alter table public.desktop_telemetry_daily enable row level security;

create policy "public desktop pairings read" on public.desktop_pairings
for select using (true);

create policy "public desktop pairings write" on public.desktop_pairings
for insert with check (true);

create policy "public desktop pairings update" on public.desktop_pairings
for update using (true);

create policy "public desktop telemetry read" on public.desktop_telemetry_daily
for select using (true);

create policy "public desktop telemetry write" on public.desktop_telemetry_daily
for insert with check (true);

create policy "public desktop telemetry update" on public.desktop_telemetry_daily
for update using (true);

create table if not exists public.device_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  patch jsonb not null default '{}'::jsonb,
  customized_keys text[] not null default '{}',
  synced_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.app_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  has_completed_onboarding boolean not null default false,
  permissions jsonb not null default '{"screenTime": true, "motion": true, "location": true, "notifications": true}'::jsonb,
  joined_challenges text[] not null default '{}',
  synced_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.metric_history (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  snapshot_date date not null,
  metrics jsonb not null,
  saved_at timestamptz not null default timezone('utc', now()),
  primary key (profile_id, snapshot_date)
);

alter table public.device_profiles enable row level security;
alter table public.app_preferences enable row level security;
alter table public.metric_history enable row level security;

create policy "public device profiles read" on public.device_profiles
for select using (true);

create policy "public device profiles write" on public.device_profiles
for insert with check (true);

create policy "public device profiles update" on public.device_profiles
for update using (true);

create policy "public app preferences read" on public.app_preferences
for select using (true);

create policy "public app preferences write" on public.app_preferences
for insert with check (true);

create policy "public app preferences update" on public.app_preferences
for update using (true);

create policy "public metric history read" on public.metric_history
for select using (true);

create policy "public metric history write" on public.metric_history
for insert with check (true);

create policy "public metric history update" on public.metric_history
for update using (true);

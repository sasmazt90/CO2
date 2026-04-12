create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  friend_code text not null unique,
  display_name text not null,
  region text not null default 'Berlin',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.friendships (
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'accepted' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

create table if not exists public.weekly_snapshots (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  weekly_score integer not null,
  streak integer not null default 0,
  delta integer not null default 0,
  shared_badge text not null default 'Calm Leaf Bronze',
  cohort text not null default 'friends' check (cohort in ('friends', 'regional', 'global')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (profile_id, week_start)
);

create table if not exists public.challenge_memberships (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  challenge_id text not null,
  progress numeric(5,4) not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (profile_id, challenge_id)
);

create or replace view public.leaderboard_weekly as
select
  ws.profile_id,
  ws.cohort,
  ws.week_start,
  ws.weekly_score,
  ws.streak,
  ws.delta,
  ws.shared_badge,
  p.region,
  p.display_name,
  p.friend_code
from public.weekly_snapshots ws
join public.profiles p on p.id = ws.profile_id;

alter table public.profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.weekly_snapshots enable row level security;
alter table public.challenge_memberships enable row level security;

create policy "public profile read" on public.profiles
for select using (true);

create policy "public profile write" on public.profiles
for insert with check (true);

create policy "public profile update" on public.profiles
for update using (true);

create policy "public friendships read" on public.friendships
for select using (true);

create policy "public friendships write" on public.friendships
for insert with check (true);

create policy "public friendships update" on public.friendships
for update using (true);

create policy "public snapshots read" on public.weekly_snapshots
for select using (true);

create policy "public snapshots write" on public.weekly_snapshots
for insert with check (true);

create policy "public snapshots update" on public.weekly_snapshots
for update using (true);

create policy "public challenge memberships read" on public.challenge_memberships
for select using (true);

create policy "public challenge memberships write" on public.challenge_memberships
for insert with check (true);

create policy "public challenge memberships delete" on public.challenge_memberships
for delete using (true);

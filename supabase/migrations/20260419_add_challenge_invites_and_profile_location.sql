alter table public.profiles
  add column if not exists city text,
  add column if not exists country text;

update public.profiles
set
  city = coalesce(city, region, 'Munich'),
  region = coalesce(region, 'Bavaria'),
  country = coalesce(country, 'Germany');

alter table public.profiles
  alter column city set default 'Munich',
  alter column region set default 'Bavaria',
  alter column country set default 'Germany';

create table if not exists public.challenge_invites (
  id uuid primary key default gen_random_uuid(),
  challenge_key text not null,
  challenge_id text,
  title text not null,
  target_label text not null,
  group_name text not null,
  duration text not null check (duration in ('weekly', 'monthly')),
  creator_profile_id uuid not null references public.profiles(id) on delete cascade,
  invitee_profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (challenge_key, invitee_profile_id)
);

create index if not exists challenge_invites_creator_idx
  on public.challenge_invites (creator_profile_id, created_at desc);

create index if not exists challenge_invites_invitee_idx
  on public.challenge_invites (invitee_profile_id, created_at desc);

drop view if exists public.leaderboard_weekly;

create or replace view public.leaderboard_weekly as
select
  ws.profile_id,
  ws.cohort,
  ws.week_start,
  ws.weekly_score,
  ws.streak,
  ws.delta,
  ws.shared_badge,
  p.city,
  p.region,
  p.country,
  p.display_name,
  p.friend_code
from public.weekly_snapshots ws
join public.profiles p on p.id = ws.profile_id;

alter table public.challenge_invites enable row level security;

drop policy if exists "public challenge invites read" on public.challenge_invites;
drop policy if exists "public challenge invites write" on public.challenge_invites;
drop policy if exists "public challenge invites update" on public.challenge_invites;

create policy "public challenge invites read" on public.challenge_invites
for select using (true);

create policy "public challenge invites write" on public.challenge_invites
for insert with check (true);

create policy "public challenge invites update" on public.challenge_invites
for update using (true);

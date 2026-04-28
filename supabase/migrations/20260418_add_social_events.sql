create table if not exists public.social_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  event_type text not null check (event_type in ('friend_added', 'challenge_invited')),
  event_key text not null unique,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists social_events_profile_created_idx
  on public.social_events (profile_id, created_at desc);

alter table public.social_events enable row level security;

drop policy if exists "public social events read" on public.social_events;
drop policy if exists "public social events write" on public.social_events;

create policy "public social events read" on public.social_events
for select using (true);

create policy "public social events write" on public.social_events
for insert with check (true);

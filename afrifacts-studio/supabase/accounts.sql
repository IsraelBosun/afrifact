-- AfriFacts accounts: what a signed-in reader keeps in the cloud.
--
-- Run this AFTER schema.sql, in the same Supabase SQL editor. Like that
-- file it is idempotent, so re-running it after an edit is safe.
--
-- THE PROJECT IS SHARED
--
-- This project also serves Native Pandas, whose tables live in `public`.
-- The login is shared on purpose (one auth.users, one account across both
-- apps), but the data is not: everything here lives in `afrifacts`, and
-- nothing in this file reads, writes or depends on `public`. That includes
-- the updated_at trigger function below, which is AfriFacts' own copy
-- rather than Pandas' public.set_updated_at, so neither app can break the
-- other by editing a helper.
--
-- THE SECURITY MODEL
--
-- The anon key ships inside the APK. What keeps one reader out of
-- another's progress is the "own rows" policy on every table: a signed-in
-- user reads and writes rows whose user_id is their own, and nothing
-- else. The anon role gets no grant on any of these tables at all, so a
-- signed-out request is refused before a policy is even consulted.
--
-- The phone stays the source of truth. These tables are a backup the app
-- merges into on sign-in and pushes to after activity, so every shape
-- here is chosen to merge cleanly: sets of ids are rows (merging is a
-- union), and quiz results are an append-only log (merging is adding),
-- never counters that two phones would overwrite.

-- =====================================================================
-- TABLES
-- =====================================================================

/*
  Who the reader is, in this app.

  Separate from Pandas' public.profiles: a username chosen there never
  appears here, and the other way round.

  joined_at is a day, not a timestamp, because it is the local day key
  the app already records as Progress.joinedAt. On merge the earlier one
  wins, so signing in on a new phone does not reset "member since".
*/
create table if not exists afrifacts.profiles (
  user_id      uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) <= 40),
  joined_at    date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

/*
  Saved facts. Newest first on screen, so saved_at is kept.

  No foreign key to afrifacts.facts: the studio deletes facts it has
  withdrawn, and a reference would either block that push or silently
  delete people's saves along with it. A save of a fact that no longer
  exists is simply not shown.
*/
create table if not exists afrifacts.saved_facts (
  user_id  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  fact_id  text not null,
  saved_at timestamptz not null default now(),
  primary key (user_id, fact_id)
);

-- Facts the reader has had on screen. Drives "facts learned".
create table if not exists afrifacts.seen_facts (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  fact_id text not null,
  primary key (user_id, fact_id)
);

-- Local days on which at least one fact was read. The streak is computed
-- from these on the phone; it is never stored, so it cannot drift.
create table if not exists afrifacts.reading_days (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day     date not null,
  primary key (user_id, day)
);

/*
  One row per finished quiz run. Accuracy is the sum over these.

  Append-only, keyed by the phone that wrote it, for the same reason as
  Pandas' review_log: two phones on one account would otherwise both
  number their runs from 1 and collide. Re-sending a run after a flaky
  connection hits the primary key and is ignored, so a push is safe to
  repeat.
*/
create table if not exists afrifacts.quiz_runs (
  user_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  device_id text not null,
  run_id    text not null,
  correct   smallint not null,
  total     smallint not null,
  at        timestamptz not null default now(),
  primary key (user_id, device_id, run_id),
  check (total > 0 and correct between 0 and total)
);

-- =====================================================================
-- ACCESS
-- =====================================================================

alter table afrifacts.profiles     enable row level security;
alter table afrifacts.saved_facts  enable row level security;
alter table afrifacts.seen_facts   enable row level security;
alter table afrifacts.reading_days enable row level security;
alter table afrifacts.quiz_runs    enable row level security;

-- Signed-in readers only. `anon` is deliberately absent.
grant select, insert, update, delete
  on afrifacts.profiles, afrifacts.saved_facts, afrifacts.seen_facts, afrifacts.reading_days
  to authenticated;

-- A finished run is history: it can be added and read, never edited.
grant select, insert on afrifacts.quiz_runs to authenticated;

-- service_role is already covered by the default privileges in schema.sql.

drop policy if exists "own rows" on afrifacts.profiles;
create policy "own rows" on afrifacts.profiles
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "own rows" on afrifacts.saved_facts;
create policy "own rows" on afrifacts.saved_facts
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "own rows" on afrifacts.seen_facts;
create policy "own rows" on afrifacts.seen_facts
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "own rows" on afrifacts.reading_days;
create policy "own rows" on afrifacts.reading_days
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "own rows" on afrifacts.quiz_runs;
create policy "own rows" on afrifacts.quiz_runs
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- =====================================================================
-- updated_at
-- =====================================================================

create or replace function afrifacts.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists profiles_updated_at on afrifacts.profiles;
create trigger profiles_updated_at before update on afrifacts.profiles
  for each row execute function afrifacts.set_updated_at();

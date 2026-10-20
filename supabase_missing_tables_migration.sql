-- ==============================================================================
-- EX-IT — Missing tables & columns
-- Run this in your Supabase SQL editor after the original migrations.
-- These objects are referenced by the app but were absent from
-- supabase_migration.sql / supabase_payments_migration.sql.
-- ==============================================================================

-- ─── user_profiles: activity tracking used by notification crons ──────────────
alter table public.user_profiles
  add column if not exists last_active_at timestamptz default now();

-- ─── user_avatars: per-user procedural avatar configuration ───────────────────
create table if not exists public.user_avatars (
  user_id uuid primary key references auth.users(id) on delete cascade,
  shape text not null default 'blob',
  fill_color text not null default '#00E676',
  eyes text not null default 'happy',
  mouth text not null default 'smile',
  accessory text not null default 'sparkle',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_avatars enable row level security;

drop policy if exists "Users can manage their own avatar" on public.user_avatars;
create policy "Users can manage their own avatar"
  on public.user_avatars for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── push_subscriptions: Web Push endpoints ───────────────────────────────────
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text,
  auth text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Users can manage their own push subscriptions" on public.push_subscriptions;
create policy "Users can manage their own push subscriptions"
  on public.push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_push_subscriptions_user
  on public.push_subscriptions(user_id);

-- Ensure upsert(onConflict: 'endpoint') works even if the table was created
-- manually before this migration.
create unique index if not exists idx_push_subscriptions_endpoint
  on public.push_subscriptions(endpoint);

-- ─── vault_entries: time-locked messages ─────────────────────────────────────
create table if not exists public.vault_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  unlocks_at timestamptz not null,
  created_at timestamptz default now()
);

alter table public.vault_entries enable row level security;

drop policy if exists "Users can manage their own vault entries" on public.vault_entries;
create policy "Users can manage their own vault entries"
  on public.vault_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_vault_entries_user_created
  on public.vault_entries(user_id, created_at desc);

-- ─── Supporting indexes ───────────────────────────────────────────────────────
create index if not exists idx_ex_profiles_user
  on public.ex_profiles(user_id, updated_at desc);

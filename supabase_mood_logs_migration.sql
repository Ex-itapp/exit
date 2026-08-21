-- =============================================================================
-- EX-IT — Mood Logs Migration
-- Run this in your Supabase SQL Editor to enable cloud-synced mood tracking.
-- =============================================================================

create table if not exists public.mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  emoji text not null,
  note text default '',
  created_at timestamptz default now()
);

alter table public.mood_logs enable row level security;

create policy "Users can manage their own mood logs"
  on public.mood_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_mood_logs_user_created
  on public.mood_logs(user_id, created_at desc);

-- Unique constraint: one mood per user per day ( enforced at app level, but this helps )
-- We don't add a DB unique constraint because the app replaces the day's mood on re-log.

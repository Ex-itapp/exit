-- =============================================================================
-- EX-IT — Rebuild Habit Tracker Migration
-- Run this in your Supabase SQL Editor to enable the Rebuild feature.
-- =============================================================================

-- 1. Create habits table
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) <= 40),
  category text not null check (category in ('body','mind','social','routine','craft')),
  frequency_type text not null default 'daily' check (frequency_type in ('daily','weekly')),
  weekly_target int check (weekly_target between 1 and 7),
  reminder_time time,
  why_note text,
  status text not null default 'active' check (status in ('active','paused','archived')),
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 2. Create habit_logs table
create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,            -- user's local date (YYYY-MM-DD)
  status text not null default 'done' check (status in ('done','skipped')),
  note text,
  created_at timestamptz default now(),
  unique (habit_id, log_date)
);

-- 3. Indexes
create index if not exists idx_habits_user_status on public.habits (user_id, status);
create index if not exists idx_habit_logs_user_date on public.habit_logs (user_id, log_date);
create index if not exists idx_habit_logs_habit_date on public.habit_logs (habit_id, log_date);

-- 4. Enforce max 5 active habits per user at the database level
create or replace function public.check_active_habits_limit()
returns trigger as $$
declare
  active_count int;
begin
  if new.status = 'active' then
    select count(*) into active_count
    from public.habits
    where user_id = new.user_id 
      and status = 'active' 
      and id != coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);
      
    if active_count >= 5 then
      raise exception 'Active habits limit reached. Maximum 5 active habits allowed.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_enforce_active_habits_limit on public.habits;
create trigger trigger_enforce_active_habits_limit
  before insert or update on public.habits
  for each row
  execute function public.check_active_habits_limit();

-- 5. Enable Row-Level Security (RLS)
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

-- 6. RLS Policies for habits
drop policy if exists "Users can manage their own habits" on public.habits;
create policy "Users can manage their own habits"
  on public.habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 7. RLS Policies for habit_logs
drop policy if exists "Users can manage their own habit logs" on public.habit_logs;
create policy "Users can manage their own habit logs"
  on public.habit_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

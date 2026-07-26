-- ==============================================================================
-- UNSENT — Complete Supabase Database Migration Script
-- Includes Auth profile syncing, Full Diary, Check-ins, Red Flags,
-- Rewards, Person Engine (Voice & Traits), Memory Bank (pgvector), and Closure Sessions.
-- ==============================================================================

-- 1. Enable Required Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector"; -- Enables pgvector for Memory Bank similarity search

-- ==============================================================================
-- 2. USER PROFILES TABLE (Linked to auth.users)
-- ==============================================================================
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_name text default 'Friend',
  user_goal text default 'Finding peace and clarity',
  user_anchor text default 'I deserve someone who chooses me every single day.',
  breakup_date timestamptz default now(),
  app_mode text default 'no_contact' check (app_mode in ('no_contact', 'evaluating')),
  streak_days int default 0,
  has_completed_onboarding boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_profiles enable row level security;

create policy "Users can manage their own profile"
  on public.user_profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Trigger to automatically create a profile row when a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, user_name, created_at, updated_at)
  values (new.id, coalesce(new.raw_user_meta_data->>'user_name', 'Friend'), now(), now());
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- 3. DIARY ENTRIES TABLE (Full Diary)
-- ==============================================================================
create table if not exists public.diary_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  moods text[] default '{}',
  is_unsent boolean default true,
  created_at timestamptz default now()
);

alter table public.diary_entries enable row level security;

create policy "Users can manage their own diary entries"
  on public.diary_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_diary_user_created on public.diary_entries(user_id, created_at desc);

-- ==============================================================================
-- 4. DAILY CHECK-INS TABLE
-- ==============================================================================
create table if not exists public.checkins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  mood text,
  created_at timestamptz default now()
);

alter table public.checkins enable row level security;

create policy "Users can manage their own checkins"
  on public.checkins for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_checkins_user_created on public.checkins(user_id, created_at desc);

-- ==============================================================================
-- 5. RED FLAGS LOG TABLE
-- ==============================================================================
create table if not exists public.red_flags (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  severity text default 'medium' check (severity in ('low', 'medium', 'high', 'dealbreaker')),
  category text default 'general',
  created_at timestamptz default now()
);

alter table public.red_flags enable row level security;

create policy "Users can manage their own red flags"
  on public.red_flags for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_red_flags_user_created on public.red_flags(user_id, created_at desc);

-- ==============================================================================
-- 6. USER REWARDS / BADGES TABLE
-- ==============================================================================
create table if not exists public.user_rewards (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id text not null,
  is_unlocked boolean default true,
  unlocked_at timestamptz default now(),
  unique(user_id, badge_id)
);

alter table public.user_rewards enable row level security;

create policy "Users can manage their own rewards"
  on public.user_rewards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ==============================================================================
-- 7. PERSON ENGINE — EX PROFILES TABLE (Voice & Trait Layers)
-- ==============================================================================
create table if not exists public.ex_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text default 'Them',
  voice_profile jsonb not null default '{}'::jsonb,
  trait_profile jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.ex_profiles enable row level security;

create policy "Users can manage their own ex profiles"
  on public.ex_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ==============================================================================
-- 8. MEMORY BANK TABLE (With pgvector embedding search)
-- ==============================================================================
create table if not exists public.memory_bank (
  id uuid primary key default uuid_generate_v4(),
  ex_profile_id uuid not null references public.ex_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  topic_tags text[] default '{}',
  emotional_weight text default 'hurt' check (emotional_weight in ('hurt', 'fond', 'angry', 'confusing', 'neutral')),
  embedding vector(768), -- 768 dimensions for Google text-embedding-004 (or change to 1536 for OpenAI)
  source text default 'user_added' check (source in ('user_added', 'correction')),
  created_at timestamptz default now()
);

alter table public.memory_bank enable row level security;

create policy "Users can manage their own memory bank entries"
  on public.memory_bank for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_memory_bank_profile on public.memory_bank(ex_profile_id, created_at desc);

-- Note: Once you have >100 entries, you can enable IVFFlat indexing for faster cosine similarity:
-- create index on public.memory_bank using ivfflat (embedding vector_cosine_ops);

-- Helper function for similarity search over memory bank in backend RPC/edge functions
create or replace function public.match_memories(
  query_embedding vector(768),
  match_profile_id uuid,
  match_count int default 4
)
returns table (
  id uuid,
  content text,
  topic_tags text[],
  emotional_weight text,
  similarity float
)
language sql security definer as $$
  select
    id,
    content,
    topic_tags,
    emotional_weight,
    1 - (memory_bank.embedding <=> query_embedding) as similarity
  from public.memory_bank
  where ex_profile_id = match_profile_id
    and user_id = auth.uid()
  order by memory_bank.embedding <=> query_embedding
  limit match_count;
$$;

-- ==============================================================================
-- 9. CLOSURE SESSIONS TABLE (Talk to Them)
-- ==============================================================================
create table if not exists public.closure_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ex_profile_id uuid references public.ex_profiles(id) on delete set null,
  status text default 'active' check (status in ('active', 'completed', 'paused_crisis')),
  message_count int default 0,
  max_messages int default 15,
  reflection_response text,
  started_at timestamptz default now(),
  ended_at timestamptz
);

alter table public.closure_sessions enable row level security;

create policy "Users can manage their own closure sessions"
  on public.closure_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_closure_sessions_user on public.closure_sessions(user_id, started_at desc);

-- ==============================================================================
-- 10. CLOSURE MESSAGES TABLE (Chat history inside sessions)
-- ==============================================================================
create table if not exists public.closure_messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.closure_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'ex_simulation', 'system_scripted')),
  content text not null,
  flagged_and_regenerated boolean default false,
  created_at timestamptz default now()
);

alter table public.closure_messages enable row level security;

create policy "Users can manage their own closure messages"
  on public.closure_messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_closure_messages_session on public.closure_messages(session_id, created_at asc);

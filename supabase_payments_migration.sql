-- ==============================================================================
-- EX-IT — Payments & Subscriptions Migration
-- Run this in your Supabase SQL editor.
-- ==============================================================================

-- 1. PROFILES TABLE (mirrors auth.users for webhook lookups by email)
-- If you already have a profiles/user_profiles table, you can skip this block
-- and update the webhook route to use your existing table name.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view and update their own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Extend the existing handle_new_user to also insert into profiles for webhook lookups.
-- Run this AFTER supabase_migration.sql to replace the function with a combined version.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, user_name, created_at, updated_at)
  values (new.id, coalesce(new.raw_user_meta_data->>'user_name', 'Friend'), now(), now());

  insert into public.profiles (id, email, full_name, avatar_url, created_at, updated_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    now(),
    now()
  )
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- ==============================================================================
-- 2. SUBSCRIPTIONS TABLE
-- ==============================================================================
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  dodo_subscription_id text unique not null,
  dodo_customer_id text,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'trialing', 'paused', 'cancelled', 'expired')),
  product_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;

-- Users can only read their own subscriptions; webhook (service_role) can write
create policy "Users can view their own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create index if not exists idx_subscriptions_user_id
  on public.subscriptions(user_id, created_at desc);

-- ==============================================================================
-- 3. PAYMENTS TABLE (one-time purchases)
-- ==============================================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  dodo_payment_id text unique not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'succeeded'
    check (status in ('succeeded', 'failed', 'pending')),
  amount integer,          -- amount in smallest currency unit (e.g. cents)
  currency text default 'USD',
  product_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.payments enable row level security;

-- Users can only read their own payments; webhook (service_role) can write
create policy "Users can view their own payments"
  on public.payments for select
  using (auth.uid() = user_id);

create index if not exists idx_payments_user_id
  on public.payments(user_id, created_at desc);

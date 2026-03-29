-- Supabase baseline schema for Bao An practice app.
-- This version intentionally removes the previous "public full access" policies.
-- IMPORTANT:
-- 1. Apply this on a trusted migration path with a service role or SQL editor.
-- 2. The current app still writes directly from the client to `math_progress`.
--    After applying the secure policies below, client-side writes will stop working
--    until those operations are moved behind trusted server endpoints / RPC.

-- 1. Main account storage
create table if not exists public.math_progress (
    id text primary key,
    data jsonb,
    updated_at timestamptz default now()
);

create index if not exists math_progress_updated_at_idx
    on public.math_progress (updated_at desc);

-- 2. Public leaderboard
create table if not exists public.leaderboard (
    id text primary key,
    name text,
    total_score integer default 0,
    last_score integer default 0,
    best_time integer default 999999,
    tier text,
    is_public boolean default true,
    updated_at timestamptz default now(),
    math_score integer default 0,
    vietnamese_score integer default 0,
    english_score integer default 0,
    finance_score integer default 0
);

create index if not exists leaderboard_public_score_idx
    on public.leaderboard (is_public, total_score desc, updated_at desc);

alter table public.math_progress enable row level security;
alter table public.leaderboard enable row level security;

-- Remove insecure legacy policies if they exist.
drop policy if exists "Enable all for public" on public.math_progress;
drop policy if exists "Enable all for public" on public.leaderboard;
drop policy if exists "Public can read leaderboard" on public.leaderboard;

-- Secure default:
-- - `math_progress`: no anon access by default.
-- - `leaderboard`: public can read only rows marked public.
create policy "Public can read leaderboard"
on public.leaderboard
for select
to anon, authenticated
using (is_public = true);

comment on table public.math_progress is
'Stores one account per JSON blob. Prefer migrating long-term toward normalized profile / parent / progress tables for safer reporting and integrity checks.';

comment on table public.leaderboard is
'Public read-only leaderboard table. Writes should come only from trusted server flows.';

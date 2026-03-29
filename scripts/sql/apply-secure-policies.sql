-- Apply secure production policies for Bao An practice app.
-- Run this only after deploying the current server-side write paths.

begin;

alter table public.math_progress enable row level security;
alter table public.leaderboard enable row level security;

drop policy if exists "Enable all for public" on public.math_progress;
drop policy if exists "Enable all for public" on public.leaderboard;
drop policy if exists "Public can read leaderboard" on public.leaderboard;

create policy "Public can read leaderboard"
on public.leaderboard
for select
to anon, authenticated
using (is_public = true);

commit;

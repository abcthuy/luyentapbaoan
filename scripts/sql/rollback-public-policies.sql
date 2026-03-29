-- Emergency rollback for Bao An practice app.
-- This temporarily restores broad public access so the legacy client can recover.
-- Use only if production write flows break after policy rollout.

begin;

drop policy if exists "Public can read leaderboard" on public.leaderboard;
drop policy if exists "Enable all for public" on public.math_progress;
drop policy if exists "Enable all for public" on public.leaderboard;

create policy "Enable all for public"
on public.math_progress
for all
to anon, authenticated
using (true)
with check (true);

create policy "Enable all for public"
on public.leaderboard
for all
to anon, authenticated
using (true)
with check (true);

commit;

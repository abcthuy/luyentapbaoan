# Parent System Upgrade Flow

## Current State Audit

### Current data model
- `ParentProfile` lives inside `AppStorage.parents` in [`lib/mastery.ts`](D:\phân mềm tự làm mới\luyentapbaoan\lib\mastery.ts).
- Each parent stores `childrenIds: string[]` directly on the parent record.
- Parent data is sanitized per account in [`lib/server/app-storage.ts`](D:\phân mềm tự làm mới\luyentapbaoan\lib\server\app-storage.ts), which filters `childrenIds` against only the profiles present in that same storage row.

### Current flows
- Admin create/delete/assign parent all mutate one `math_progress` row only:
  - [`app/api/admin/parents/create/route.ts`](D:\phân mềm tự làm mới\luyentapbaoan\app\api\admin\parents\create\route.ts)
  - [`app/api/admin/parents/delete/route.ts`](D:\phân mềm tự làm mới\luyentapbaoan\app\api\admin\parents\delete\route.ts)
  - [`app/api/admin/parents/assign/route.ts`](D:\phân mềm tự làm mới\luyentapbaoan\app\api\admin\parents\assign\route.ts)
- Parent login reads `allParents` aggregated across rows, then stores only `parent.id` in session in [`app/login/parent/page.tsx`](D:\phân mềm tự làm mới\luyentapbaoan\app\login\parent\page.tsx).
- Parent dashboard reads `storage.parents.find(parentId)` from the currently loaded storage row and derives managed children by checking `parent.childrenIds` against `allProfiles` in [`app/parent/dashboard/page.tsx`](D:\phân mềm tự làm mới\luyentapbaoan\app\parent\dashboard\page.tsx).
- ProgressProvider aggregates `allParents` and `allProfiles` from many rows, but `storage` is still just one active row in [`components/progress-provider.tsx`](D:\phân mềm tự làm mới\luyentapbaoan\components\progress-provider.tsx).

## Confirmed Structural Problems

### 1. Parent identity is not independent enough
- A parent record is embedded inside one account row.
- Session stores only `parent.id`, not the row that owns that parent.
- If the active `math_sync_id` changes, the dashboard may no longer be able to find the logged-in parent.

### 2. Parent-child relationship is denormalized
- `childrenIds` is stored on the parent object instead of a dedicated relation.
- One relation update requires rewriting the whole parent collection.
- Cross-account linking is effectively impossible without violating the current sanitizer.

### 3. Sanitization currently removes cross-account links by design
- [`lib/server/app-storage.ts`](D:\phân mềm tự làm mới\luyentapbaoan\lib\server\app-storage.ts) filters `childrenIds` to profile ids that exist in the same row.
- That means any future cross-row relationship would be deleted during normalization/sync.

### 4. Parent login and dashboard depend on different scopes
- Login shows parents from all rows via `allParents`.
- Dashboard loads the parent from only the active row via `storage.parents`.
- This is the main mismatch causing “data exists but UI cannot see it”.

### 5. Admin UI is row-scoped while parent UX appears global
- Admin parent management writes only to the current row.
- Parent login appears global because it aggregates all parents.
- This creates user expectations the data model cannot actually support.

## Target Architecture

### New model
Keep parent as an independent entity and split the relationship out.

```ts
export interface ParentAccount {
  id: string;
  name: string;
  pin: string;
  displayOrder?: number;
  status?: "active" | "disabled";
  createdAt: string;
  updatedAt: string;
}

export interface ParentChildLink {
  id: string;
  parentId: string;
  childId: string;
  childSyncId: string;
  assignedAt: string;
}
```

### Storage direction
For the current codebase, the safest upgrade path is:
- Keep `profiles` where they are now.
- Add `parentAccounts` and `parentChildLinks` to `AppStorage`.
- Keep legacy `parents` temporarily for backward compatibility only.
- Treat `parentAccounts` + `parentChildLinks` as the new source of truth.

### Why this is the right next step
- Parent becomes independent from any single child list.
- One parent can manage 1 or many children.
- Each child link can point to a different `syncId` if needed later.
- Migration can be incremental without breaking existing rows.

## Recommended Upgrade Flow

### Phase 1. Add new schema without breaking old data
Update `AppStorage` to support both old and new shapes:
- Add `parentAccounts?: ParentAccount[]`
- Add `parentChildLinks?: ParentChildLink[]`
- Keep `parents?: ParentProfile[]` as legacy input only

Rules:
- New writes go to `parentAccounts` and `parentChildLinks`
- Old `parents` is still read for migration fallback

### Phase 2. Add server-side normalization and migration helpers
Create helpers in server/client normalization layers:
- `getParentAccounts(storage)`
- `getParentChildLinks(storage)`
- `migrateLegacyParents(storage)`

Migration behavior:
- If `parentAccounts` is empty and legacy `parents` exists, derive:
  - one `ParentAccount` per legacy parent
  - one `ParentChildLink` per `childrenIds` entry
- Preserve legacy parent `id` so sessions and UI mapping remain stable during rollout

### Phase 3. Change admin APIs to write only new structures
Refactor these routes:
- [`app/api/admin/parents/create/route.ts`](D:\phân mềm tự làm mới\luyentapbaoan\app\api\admin\parents\create\route.ts)
- [`app/api/admin/parents/delete/route.ts`](D:\phân mềm tự làm mới\luyentapbaoan\app\api\admin\parents\delete\route.ts)
- [`app/api/admin/parents/assign/route.ts`](D:\phân mềm tự làm mới\luyentapbaoan\app\api\admin\parents\assign\route.ts)

New behaviors:
- Create parent: append to `parentAccounts`
- Delete parent: remove from `parentAccounts` and cascade delete its links in `parentChildLinks`
- Assign child: upsert one `ParentChildLink`
- Optional unassign endpoint: delete one `ParentChildLink`

### Phase 4. Update aggregation logic in ProgressProvider
In [`components/progress-provider.tsx`](D:\phân mềm tự làm mới\luyentapbaoan\components\progress-provider.tsx):
- Build `allParents` from `parentAccounts`, not legacy `parents`
- Build a derived map `parentId -> managed child count` from `parentChildLinks`
- Stop treating `childrenIds` on parent as canonical

### Phase 5. Fix parent login session model
Parent session must identify both the parent and where to load its links from.

Replace:
- `math_parent_session = parent.id`

With something like:
```json
{
  "parentId": "pr-...",
  "sourceSyncId": "USER-..."
}
```

Then in [`app/login/parent/page.tsx`](D:\phân mềm tự làm mới\luyentapbaoan\app\login\parent\page.tsx):
- Login against the parent account record
- Save both `parentId` and `sourceSyncId`

### Phase 6. Fix parent dashboard to use links, not embedded children
In [`app/parent/dashboard/page.tsx`](D:\phân mềm tự làm mới\luyentapbaoan\app\parent\dashboard\page.tsx):
- Load the parent from `parentAccounts`
- Load managed child ids from `parentChildLinks`
- Resolve children using `(childSyncId, childId)`

Short-term implementation option:
- For dashboard v1, only show children whose `childSyncId` matches the current source row

Professional implementation option:
- Build a lookup from all aggregated profiles by `${sourceSyncId}:${profile.id}`
- Resolve managed children globally from links

### Phase 7. Update admin UI to reflect the new reality
In [`app/admin/parents/page.tsx`](D:\phân mềm tự làm mới\luyentapbaoan\app\admin\parents\page.tsx):
- Show parent records from `parentAccounts`
- Show assigned children from `parentChildLinks`
- Add explicit unassign action per child
- Show which account a child belongs to if cross-account linking is enabled

### Phase 8. Remove legacy shape only after stable rollout
Only after all reads/writes are on the new model:
- stop writing `parents`
- remove `childrenIds` dependency from UI
- later remove legacy migration fallback

## Latest Recommended Implementation Sequence

### Milestone A: Safe compatibility layer
Ship first:
- add new interfaces
- add normalization helpers
- derive new structures from old `parents`
- no UI breakage

Outcome:
- old data keeps working
- app can read both models

### Milestone B: New admin write path
Ship next:
- convert create/delete/assign APIs
- add unassign API
- keep parent ids stable

Outcome:
- all new edits are normalized

### Milestone C: Parent auth/session rewrite
Ship next:
- new parent session payload
- dashboard reads parent by `(sourceSyncId, parentId)`

Outcome:
- login/dashboard mismatch is removed

### Milestone D: Cross-account support or explicit row-scope
Choose one and state it in UI:
- Option 1: professional simple mode
  - parent manages only children in the same row
  - still use `parentChildLinks`, but `childSyncId` must equal source row
- Option 2: professional full mode
  - parent can manage children across rows
  - dashboard and admin UI resolve children globally

Given the current codebase, Option 1 should be shipped first. Option 2 can be added later without another schema rewrite because `childSyncId` is already present.

## Non-negotiable Rules for the Upgrade
- Server normalization must never delete valid parent-child links just because a child is not in the current row.
- Parent session must always store enough information to reload the same parent deterministically.
- Admin UI and parent dashboard must read from the same canonical structures.
- Legacy `parents.childrenIds` must be treated as migration input only, not long-term source of truth.

## Recommended Next Coding Task
Implement in this order:
1. Add `parentAccounts` and `parentChildLinks` to [`lib/mastery.ts`](D:\phân mềm tự làm mới\luyentapbaoan\lib\mastery.ts)
2. Add migration helpers in [`lib/server/app-storage.ts`](D:\phân mềm tự làm mới\luyentapbaoan\lib\server\app-storage.ts) and the client normalize path in [`components/progress-provider.tsx`](D:\phân mềm tự làm mới\luyentapbaoan\components\progress-provider.tsx)
3. Refactor parent admin routes to the new model
4. Refactor parent login and dashboard session payload
5. Update admin parent page to render from the new model

## Decision
The latest upgrade flow should be:
- normalize parent into its own entity now
- move child assignment into a relation model now
- keep rollout row-scoped first
- preserve `childSyncId` in the relation so the system can become global later without another migration

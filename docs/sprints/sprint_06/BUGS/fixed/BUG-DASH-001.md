# BUG-DASH-001 — Dashboard "Mark Fixed" does not move bug file to fixed/ directory

## Status: FIXED
## Severity: P2
## Type: bug
## Sprint: 06
## Discovered: 2026-02-27 via FAT Round 2 — Step 20
## Assigned: [DEV:dashboard]

## Steps to Reproduce
1. Start vigil-server (`npm run dev:server`)
2. Open dashboard at `http://localhost:7474/dashboard`
3. Select Sprint 06 in the sprint selector
4. Click "Mark Fixed" on any bug row (e.g. BUG-FAT-008)
5. Check `docs/sprints/sprint_06/BUGS/open/` and `BUGS/fixed/` directories

## Expected
Bug file moves from `BUGS/open/BUG-FAT-008.md` to `BUGS/fixed/BUG-FAT-008.md`.

## Actual
- Dashboard UI updates: status shows "RESOLVED", button changes to "Reopen" ✅
- File content updates: `## Status:` field changed from OPEN to RESOLVED ✅
- File location: File remains in `BUGS/open/` — NOT moved to `BUGS/fixed/` ❌

## Root Cause
Dashboard frontend calls the wrong server endpoint:

| Current | Correct |
|---|---|
| `PATCH /api/bugs/:id` with `{ status: 'resolved' }` | `POST /api/bugs/:id/close` with `{ resolution, keepTest }` |

**PATCH route** (`updateBug()` in writer.ts:105): Updates fields in-place, no file move.
**POST /close route** (`closeBug()` in writer.ts:141): Correctly moves file from open/ to fixed/.

### Code path:
1. `BugList.tsx:127` → `handleStatusChange(bug.id, 'resolved')`
2. `BugList.tsx:36` → `patchBug(bugId, { status })`
3. `api.ts:41` → `PATCH /api/bugs/${bugId}`

### Verification:
Direct curl to close endpoint works correctly:
```
curl -X POST http://localhost:7474/api/bugs/BUG-FAT-009/close \
  -H "Content-Type: application/json" \
  -d '{"resolution":"test","keepTest":false}'
→ {"closed":true,"bugId":"BUG-FAT-009"}
→ File moved to BUGS/fixed/ ✅
```

## Fix

In `packages/dashboard/src/views/BugList.tsx`:
- When "Mark Fixed" is clicked, call `POST /api/bugs/:id/close` instead of `PATCH`
- Add a `closeBug()` function in `packages/dashboard/src/api.ts` that calls the close endpoint
- Pass `resolution` (can default to "Marked fixed via dashboard") and `keepTest: true`

In `packages/dashboard/src/api.ts`, add:
```typescript
export async function closeBug(bugId: string, resolution: string, keepTest: boolean): Promise<void> {
  const res = await fetch(`${BASE}/bugs/${bugId}/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resolution, keepTest }),
  });
  if (!res.ok) throw new Error(`Failed to close bug: ${res.status}`);
}
```

## Fix Applied

**Files changed:**
- `packages/dashboard/src/api.ts` — Added `closeBug()` function that calls `POST /api/bugs/:id/close`
- `packages/dashboard/src/views/BugList.tsx` — Split `handleStatusChange` into `handleMarkFixed` (calls close endpoint) and `handleReopen` (calls PATCH). "Mark Fixed" button now calls `handleMarkFixed`.

**Verified:** Clicked "Mark Fixed" on BUG-FAT-008 → file moved from `BUGS/open/` to `BUGS/fixed/` ✅, status shows "FIXED" in dashboard ✅.

## Regression Test
File: —
Status: ⬜

## Test Decision
[ ] Add E2E test for dashboard Mark Fixed → file move (Sprint 07)

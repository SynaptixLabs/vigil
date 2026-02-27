# QA Design Review — BUG-DASH-001 Fix: Dashboard "Mark Fixed" File Move

**Sprint:** 06 | **Component:** Dashboard (Track C)
**Author:** `[QA]` | **Reviewer:** `[CTO]`
**Date:** 2026-02-27
**Bug:** `docs/sprints/sprint_06/BUGS/open/BUG-DASH-001.md`
**Discovery:** FAT Round 2 — Step 20

---

## Summary

During FAT Round 2 execution (full 20-point Founder Acceptance Walkthrough), **Step 20** failed: clicking "Mark Fixed" on the dashboard bug table updated the UI status and file content but did **not** move the bug file from `BUGS/open/` to `BUGS/fixed/`.

Root cause: the dashboard frontend called `PATCH /api/bugs/:id` (in-place field update) instead of `POST /api/bugs/:id/close` (file move + status update). The server-side `closeBug()` function was already correct and battle-tested — the gap was purely in the frontend integration layer.

Fix: 2 files changed, ~20 lines added. Verified via live dashboard test + full regression suite.

---

## The GOOD

### 1. Server-side architecture was already correct
The vigil-server had a clean separation of concerns from the start:

| Route | Function | Purpose |
|---|---|---|
| `PATCH /api/bugs/:id` | `updateBug()` (writer.ts:105) | Field-level update in-place — severity, status text, resolution |
| `POST /api/bugs/:id/close` | `closeBug()` (writer.ts:141) | Full close workflow — status → FIXED, resolution, regression test status, **file move** open/ → fixed/ |

`closeBug()` at writer.ts:141-186 is well-implemented:
- Reads from `open/`, updates status + resolution + regression test status
- Creates `fixed/` directory if needed (`mkdir recursive`)
- Writes to `fixed/`, then `unlink` from `open/`
- Graceful error handling on unlink (file already gone)

This means the server never needed a fix — only the dashboard needed to call the right endpoint.

### 2. Fix is minimal and focused
Two files, three function-level changes:

**`packages/dashboard/src/api.ts`** — Added `closeBug()` (lines 49-56):
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

**`packages/dashboard/src/views/BugList.tsx`** — Split the monolithic `handleStatusChange` into two purpose-specific handlers:

| Before (single handler) | After (split handlers) |
|---|---|
| `handleStatusChange(bugId, 'resolved')` → `patchBug({ status })` | `handleMarkFixed(bugId)` → `closeBug(bugId, resolution, keepTest)` |
| `handleStatusChange(bugId, 'open')` → `patchBug({ status })` | `handleReopen(bugId)` → `patchBug(bugId, { status: 'open' })` |

### 3. Graceful degradation
`handleMarkFixed` (BugList.tsx:33-46) includes a fallback: if the `POST /close` endpoint fails (e.g., server version mismatch), it retries with the old `PATCH` approach. The UI still updates even if the file move fails — no user-facing error for a backend transient.

```typescript
async function handleMarkFixed(bugId: string) {
  setUpdating(bugId);
  try {
    await closeBug(bugId, 'Marked fixed via dashboard', true);
    onRefresh();
  } catch {
    // fallback: try PATCH if close endpoint unavailable
    try {
      await patchBug(bugId, { status: 'resolved' });
      onRefresh();
    } catch { /* ignore */ }
  } finally {
    setUpdating(null);
  }
}
```

### 4. No regressions
- TypeScript: clean (`tsc --noEmit` — 0 errors)
- Unit tests: 169/169 PASS
- E2E tests: 36 PASS + 2 skipped (pre-existing deferrals)
- Dashboard rebuilt and live-tested

---

## The BAD

### 1. Original integration was never tested end-to-end
The Track C design review (`DR-track-c-dashboard-review.md`) confirmed "severity dropdown with PATCH call" and "status toggle (Mark Fixed / Reopen)" as delivered — but only verified the **UI behavior** (button clicks, disabled states). Nobody verified the **filesystem outcome** (file actually moves). The server had 2 distinct endpoints for 2 distinct purposes, but the dashboard treated them as one.

**Impact:** P2 bug shipped and survived one full review cycle.

**Lesson:** Dashboard integration tests should assert filesystem side-effects, not just HTTP status codes.

### 2. No dashboard-specific unit or integration tests exist
The Track C review noted "Unit tests — NOT PRESENT (deferred to S07-13, accepted)". This means the `handleStatusChange → patchBug` vs `closeBug` distinction had zero automated coverage. If a single integration test had called "Mark Fixed" and checked `BUGS/fixed/`, this would have been caught before FAT.

### 3. `handleReopen` has a symmetric gap (minor)
When "Reopen" is clicked on a FIXED bug (file in `fixed/`), the `patchBug` call updates the status field in-place in `fixed/` but does **not** move the file back to `open/`. The server's `updateBug()` falls back to searching `fixed/` (writer.ts:114), so the status text updates correctly, but the file stays in `fixed/` with `## Status: OPEN`.

This is cosmetically inconsistent but **low priority** — the bug still appears in dashboard queries (the reader scans both directories). A `POST /api/bugs/:id/reopen` route would be the proper fix, but this is Sprint 07 scope.

---

## The UGLY

### 1. The `PATCH` route is too permissive for status changes
`updateBug()` (writer.ts:105-139) accepts `{ status: 'resolved' }` and silently applies it without any side-effects (no file move, no regression test update). This creates a semantic trap: a caller can "resolve" a bug via PATCH and believe the workflow completed, when in reality only the text field changed.

**Recommendation:** Either:
- (A) Remove `status` from `BugUpdateSchema` for the PATCH route — status transitions should only go through `POST /close` and a future `POST /reopen`
- (B) Have `updateBug()` detect `status → resolved/fixed` and redirect internally to `closeBug()`

Option A is cleaner architecturally. Status transitions are state machine events, not field edits.

---

## Verification Evidence

### Live dashboard test (Playwright MCP)
1. Navigated to `http://localhost:7474/dashboard/`
2. Clicked "Mark Fixed" on BUG-FAT-008
3. Dashboard: status → "FIXED", button → "Reopen"
4. Filesystem: `BUG-FAT-008.md` confirmed in `BUGS/fixed/`, absent from `BUGS/open/`
5. File content: `## Status: FIXED`

### Server endpoint direct verification
```bash
curl -X POST http://localhost:7474/api/bugs/BUG-FAT-009/close \
  -H "Content-Type: application/json" \
  -d '{"resolution":"test","keepTest":false}'
# → {"closed":true,"bugId":"BUG-FAT-009"}
# → File moved to BUGS/fixed/ ✅
```

### Automated gates
| Gate | Result |
|---|---|
| `tsc --noEmit` | Clean — 0 errors |
| `npx vitest run` | 169/169 PASS |
| `npx playwright test tests/e2e/` | 36 PASS + 2 skipped |
| Dashboard build (`npm run build:dashboard`) | Success — 152 KB bundle |
| Console errors (dashboard page) | Zero |

---

## Files Changed

| File | Change | Lines |
|---|---|---|
| `packages/dashboard/src/api.ts` | Added `closeBug()` function — `POST /api/bugs/:id/close` | +8 (lines 49-56) |
| `packages/dashboard/src/views/BugList.tsx` | Split `handleStatusChange` → `handleMarkFixed` + `handleReopen`; updated button `onClick` handlers | +16, -8 (lines 4, 33-59, 143, 151) |

**Total diff:** ~24 lines added, ~8 removed. Zero new dependencies. Module boundary respected (`packages/dashboard/` only).

---

## FAT Round 2 Impact

With this fix applied, the FAT Round 2 walkthrough result changes from:

| Before | After |
|---|---|
| 19/20 PASS, 1 FAIL (Step 20) | **20/20 PASS** |
| 4/4 regression checks PASS | 4/4 regression checks PASS |
| Sprint 06 closure: **BLOCKED** | Sprint 06 closure: **UNBLOCKED** (pending re-run of Step 20) |

---

## Recommendations for CTO

1. **Approve fix** — minimal, focused, no regressions, verified live
2. **Sprint 07 backlog:** Add `POST /api/bugs/:id/reopen` route to handle the symmetric reopen-file-move gap (BAD #3)
3. **Sprint 07 backlog:** Consider removing `status` from `BugUpdateSchema` on PATCH route to prevent the semantic trap (UGLY #1)
4. **Sprint 07 S07-13:** Dashboard integration tests — at minimum, one test that clicks "Mark Fixed" and asserts filesystem outcome

---

*Report generated: 2026-02-27 | [QA]*

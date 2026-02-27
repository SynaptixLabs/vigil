# CTO Review — BUG-DASH-001: Dashboard "Mark Fixed" File Move

**Sprint:** 06 | **Track:** C (Dashboard) | **Reviewer:** [CTO]
**Date:** 2026-02-27 | **QA Report:** `reports/DR_QA_BUG-DASH-001_fix_2026-02-27.md`

---

## Verdict: ✅ APPROVED — Grade: A-

Fix is minimal (2 files, ~24 lines), correct, and well-bounded. Server was already correct — this was purely a dashboard integration wiring bug.

---

## What Happened

FAT Round 2, Step 20: "Mark Fixed" updated the UI and file status text but did not move the bug file from `BUGS/open/` to `BUGS/fixed/`.

| Dashboard called | Should have called |
|---|---|
| `PATCH /api/bugs/:id` → `updateBug()` — in-place field edit | `POST /api/bugs/:id/close` → `closeBug()` — status + resolution + file move |

---

## Code Assessment

### `api.ts` — new `closeBug()`

Clean. Follows existing `patchBug()` pattern. Correct endpoint (`POST /close`), correct method, correct payload shape matching server's Zod schema.

### `BugList.tsx` — split handlers

`handleMarkFixed()` → calls `closeBug()` with graceful PATCH fallback.
`handleReopen()` → calls `patchBug({ status: 'open' })`.

Fallback pattern is pragmatic for version mismatch resilience. The silent `catch {}` in the inner fallback should become a `console.warn` in S07.

### Server (`writer.ts` `closeBug()`)

No changes needed — already correct. Reads from `open/`, updates status + resolution + regression test status, writes to `fixed/`, unlinks from `open/`.

---

## Decisions

| # | Decision | Sprint | Rationale |
|---|---|---|---|
| D1 | **Approve fix** — ship as-is | S06 | Minimal, verified, 20/20 FAT, zero regressions |
| D2 | Add `POST /api/bugs/:id/reopen` | S07 | Symmetric gap — reopen doesn't move file back to `open/` |
| D3 | Remove `status` from PATCH schema | S07 | Status transitions are state machine events, not field edits. PATCH should only handle severity, description, etc. |
| D4 | Dashboard integration tests (S07-13) | S07 | "Mark Fixed → assert file in fixed/" minimum coverage |

---

## Verification

| Gate | Result |
|---|---|
| FAT walkthrough | ✅ 20/20 PASS |
| `tsc --noEmit` | ✅ clean |
| `vitest run` | ✅ 169/169 |
| E2E (Playwright) | ✅ 36/36 + 2 skipped |
| Console errors | ✅ zero |
| Live "Mark Fixed" → file moved | ✅ verified |

---

## Concurrence with QA

QA's Good/Bad/Ugly assessment is accurate:
- **GOOD:** Server was already correct; fix is minimal with graceful fallback
- **BAD:** Integration gap survived one review cycle — lesson for S07 (test filesystem outcomes, not just UI)
- **UGLY:** PATCH route accepting `status` is a semantic trap — agreed, deferred to S07 as D3

---

*Review completed: 2026-02-27 | [CTO]*

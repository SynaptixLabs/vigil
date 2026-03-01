# DR — [DEV:app] S07-16b: Session Read API

**Date:** 2026-03-01
**Author:** [DEV:app]
**Scope:** S07-16b — `GET /api/sessions` + `GET /api/sessions/:id` on vigil-server
**Sprint:** 07, Phase 1 — UX Foundation
**Priority:** P0 (blocks S07-17a/17b dashboard) | **Budget:** ~1.5V | **Actual:** ~1V
**Resolves:** D025 — dashboard `fetchSessions()`/`fetchSession()` stubs would 404 without server endpoints
**Prerequisite:** S07-11 (shared types) — confirmed complete prior to this work

---

## Executive Summary

Added session read endpoints to vigil-server, completing the write-read cycle for sessions. The extension already writes session JSON via `POST /api/session`; these new GET endpoints let the dashboard read them back. Both `FilesystemStorage` and `NeonStorage` implementations are wired up. 8 new unit tests added. Zero regressions — 209/209 vitest, 38/38 E2E.

---

## Architecture

```
Extension                   vigil-server                 Dashboard
────────                   ────────────                 ─────────
POST /api/session  ──────►  writeSessionJson()
                            .vigil/sessions/{id}.json
                                    │
GET /api/sessions  ◄────────────────┤───────────►  fetchSessions()
GET /api/sessions/:id  ◄───────────┘───────────►  fetchSession()

Storage layer:
  FilesystemStorage  →  reads .vigil/sessions/*.json, filters, sorts
  NeonStorage        →  queries sessions table, reconstructs VIGILSession
```

### Data flow

1. **List:** `GET /api/sessions?project=X&sprint=Y` → `storage.listSessions(project, sprint)` → maps `VIGILSession[]` → `SessionSummary[]` (lightweight: counts only, no payloads)
2. **Detail:** `GET /api/sessions/:id` → `storage.getSession(id)` → maps `VIGILSession` → `SessionDetail` (full recordings, snapshots, bugs, features)

---

## What Was Built

### New Files

| File | LOC | Purpose |
|---|---|---|
| `packages/server/src/routes/sessions.ts` | 87 | Express router with GET `/` and GET `/:id`, shape mappers `toSummary`/`toDetail` |

### Modified Files

| File | Change |
|---|---|
| `packages/server/src/storage/types.ts` | Added `listSessions(project?, sprint?)` and `getSession(sessionId)` to `StorageProvider` interface |
| `packages/server/src/filesystem/reader.ts` | Added `listSessions()` and `getSession()` — reads `.vigil/sessions/*.json`, validates with `VIGILSessionSchema`, filters by project/sprint, sorts by `startedAt` desc |
| `packages/server/src/storage/filesystem.ts` | Wired `listSessions`/`getSession` delegation to reader functions |
| `packages/server/src/storage/neon.ts` | Implemented `listSessions`/`getSession` — queries `sessions` table, reconstructs `VIGILSession` from columns + JSON fields, validates with `VIGILSessionSchema` |
| `packages/server/src/app.ts` | Registered `sessionsRouter` at `/api/sessions` |
| `tests/unit/server/reader.test.ts` | +8 tests: list all, filter by project, filter by sprint, combined filter, sort order, empty dir, get by ID, get nonexistent |
| `docs/sprints/sprint_07/todo/sprint_07_team_dev_todo.md` | Marked S07-11, S07-16b complete |

**Total new code:** ~150 LOC (87 route + ~40 reader + ~20 storage wiring)
**Total new tests:** 8

---

## Design Decisions

### D1 — Route handler transforms, not storage layer
The storage layer returns raw `VIGILSession` objects. The route handler maps them to `SessionSummary` (list) or `SessionDetail` (detail). This keeps the storage interface simple and avoids introducing dashboard-specific types into the storage contract.

### D2 — Zod validation on read
Filesystem reader validates each session JSON with `VIGILSessionSchema.safeParse()`. Malformed files are silently skipped. This provides resilience against hand-edited or corrupted session files.

### D3 — Sort order
`listSessions` returns newest-first (`startedAt` descending). This matches the expected dashboard UX — most recent sessions at the top.

### D4 — Route path: `/api/sessions` (plural) vs `/api/session` (singular)
The existing POST endpoint is at `/api/session` (singular) for backward compatibility. The new read endpoints use `/api/sessions` (plural) matching REST convention. Dashboard `api.ts` already uses `/api/sessions`.

---

## GOOD (keep)

| # | Finding |
|---|---|
| G01 | **Dashboard contract matched.** `SessionSummary` and `SessionDetail` shapes in `packages/dashboard/src/types.ts` are exactly what the route returns. No adapter layer needed. |
| G02 | **Both storage backends implemented.** Filesystem + Neon — production and local dev both covered. |
| G03 | **Defensive reads.** Missing `.vigil/sessions/` directory returns `[]` not 500. Malformed JSON skipped. |
| G04 | **No new dependencies.** Reuses existing `VIGILSessionSchema` from `@synaptix/vigil-shared`. |

---

## BAD (potential concerns)

### B01 — Filesystem full-scan on every list request
- **Severity:** P3
- **Impact:** Low — session files are small JSON, typical project has <100 sessions. No index needed at current scale.
- **Mitigation:** Neon storage (S07-15) will be the production path with proper SQL queries. Filesystem is local dev only.
- **Action:** Monitor. If local perf becomes an issue, add an in-memory cache with file watcher invalidation.

---

## UGLY

None.

---

## Quality Gates

| Gate | Result |
|---|---|
| `npx tsc --noEmit` (extension) | PASS |
| `npx tsc --noEmit` (server) | PASS |
| `npm run build` | PASS |
| `npm run build:server` | PASS |
| `npx vitest run` | PASS — 209/209 (22 test files) |
| `npx playwright test` | PASS — 38/38 |
| New unit tests | +8 (reader.test.ts: session list/get) |
| No regressions | Confirmed — all pre-existing 201 tests still pass |

---

## Summary

| Category | Count |
|---|---|
| GOOD | 4 |
| BAD | 1 (P3 — acceptable, local dev only) |
| UGLY | 0 |

**Overall Grade: A**

Minimal, focused delivery. Unblocks S07-17a/17b dashboard work. Both storage backends covered. 8 new tests. Zero regressions.

---

## Unblocks

| ID | Deliverable | Status |
|---|---|---|
| S07-17a | Dashboard Phase A: nav, filters, screenshots | **UNBLOCKED** — awaiting CPTO GO |
| S07-17b | Dashboard Phase B: timeline + replay | Blocked by S07-17a |

---

*Design Review Report | [DEV:app] | 2026-03-01 | Sprint 07 Phase 1*

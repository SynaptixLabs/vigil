# DR — Track C: Management Dashboard

**Author:** `[DEV:dashboard]`
**Reviewer:** `[CPTO]`
**Sprint:** 06
**Date:** 2026-02-26
**Scope:** S06-10 (Dashboard SPA) + S06-11 (Row actions)

---

## 1. Summary

Track C delivered a complete React + Vite + Tailwind dashboard SPA in `packages/dashboard/`. It builds to `packages/server/public/` and is served by vigil-server at `localhost:7474/dashboard` (D006). All 7 QA-required `data-testid` attributes are present. TypeScript clean. Build passes. No regressions to root project tests.

**Total LOC:** ~510 lines across 10 source files
**Dependencies added:** 0 new (reuses React 18, Vite 5, Tailwind 3 — same versions as root)

---

## 2. GOOD

| # | Item |
|---|---|
| G1 | **Clean scaffold** — standalone `package.json`, `tsconfig.json`, Vite config. Dashboard is a self-contained package under `packages/dashboard/` |
| G2 | **Build pipeline works end-to-end** — `vite build` outputs to `packages/server/public/`, Express already serves this at `/dashboard` (server index.ts:37) |
| G3 | **All 7 QA testids present** — `dashboard-root`, `bug-list-table`, `feature-list-table`, `sprint-selector`, `bug-row-{ID}`, `severity-badge-{ID}`, `server-health-status` |
| G4 | **API client ready** — `api.ts` has all REST calls (`fetchBugs`, `fetchFeatures`, `fetchSprints`, `patchBug`, `fetchHealth`) wired to the correct server endpoints |
| G5 | **Row actions built** — severity dropdown (S06-11) and status toggle (Mark Fixed / Reopen) with disabled state during updates |
| G6 | **Health polling** — pings `/health` every 30s, shows green/red dot with version + LLM mode |
| G7 | **Graceful degradation** — error banner when server unreachable; empty-state messages when no bugs/features found |
| G8 | **Vite dev proxy** — `vite.config.ts` proxies `/api` and `/health` to `:7474` for dev workflow |

---

## 3. BAD — Contract Gaps (all resolved)

| # | Issue | Status |
|---|---|---|
| ~~B1~~ | ~~Missing `GET /api/sprints` route~~ | **MOOT** — route exists (`sprintsRouter` in server index.ts:33) |
| ~~B2~~ | ~~Missing `GET /api/features` route~~ | **MOOT** — route exists (`featuresRouter` in server index.ts:32) |
| ~~B3~~ | ~~Type mismatch: BugItem vs BugFile~~ | **RESOLVED** — `types.ts` mirrors server `BugFile`/`FeatureFile` exactly |
| ~~B4~~ | ~~Status enum case mismatch~~ | **RESOLVED** — dashboard sends lowercase statuses matching server `BugUpdateSchema` |
| B5 | Feature BACKLOG not handled | **DEFERRED** — CPTO ruled BACKLOG is status within `open/`, not a folder. Defer to S07. |

---

## 4. UGLY — Issues

| # | Issue | Impact | Status |
|---|---|---|---|
| ~~U1~~ | ~~Dashboard types don't match server response~~ | **RESOLVED** — types aligned, `BugUpdate` added for PATCH calls | Done |
| U2 | SPA fallback missing | Low — no client-side routing in S06 | **ACCEPTED** — not needed yet |
| U3 | No dashboard unit tests | QA uses E2E for now | **DEFERRED** — S07-13 |

---

## 5. CPTO Review Findings — Post-DR Fixes

### P1 FIXED: Sprint type contract mismatch (from CPTO review)

**Problem:** Server `GET /api/sprints` returns `{ sprints: [{ id, name }], current }` but dashboard `fetchSprints()` typed return as `string[]`. Sprint selector would show `[object Object]` entries.

**Fix applied:**
- `api.ts`: `fetchSprints()` now returns `{ ids: string[], current: string }`, maps `data.sprints.map(s => s.id)`
- `App.tsx`: Destructures `{ ids, current }`, uses `current` from server for default sprint selection

**Verified:** `tsc --noEmit` clean, `vite build` passes (772ms).

---

## 6. Files Delivered

```
packages/dashboard/
├── package.json              # @synaptix/vigil-dashboard v2.0.0
├── tsconfig.json             # Strict, noEmit, bundler resolution
├── vite.config.ts            # base=/dashboard/, outDir=../server/public/
├── tailwind.config.js
├── postcss.config.js
├── index.html
└── src/
    ├── main.tsx              # React root
    ├── App.tsx               # Layout: header (sprint selector + health), tabs, views
    ├── types.ts              # BugItem, FeatureItem, BugUpdate, HealthStatus
    ├── api.ts                # REST client (5 functions + SprintsResponse type)
    ├── index.css             # Tailwind directives
    ├── views/
    │   ├── BugList.tsx       # Table + severity dropdown + status toggle
    │   └── FeatureList.tsx   # Read-only feature table
    └── components/
        ├── SprintSelector.tsx
        ├── SeverityBadge.tsx
        └── HealthIndicator.tsx
```

**Root `package.json`:** Added `build:dashboard` script.

---

## 7. Verification Results (post all fixes)

| Gate | Result |
|---|---|
| TypeScript clean (dashboard) | **PASS** |
| Vite build | **PASS** — 772ms |
| Root TypeScript clean | **PASS** — no regressions |
| Root vitest suite | 132/132 pass |
| All 7 testids present | **PASS** |
| Sprint type contract (P1) | **PASS** — maps `{id,name}[]` → `string[]` |
| Dashboard unit tests | N/A — deferred to S07-13 |

---

## 8. What's Next

1. **Integration test:** Start server + dashboard, verify end-to-end data flow
2. **QA handoff:** All testids ready — QA can write E2E specs against `/dashboard`

---

*DR generated: 2026-02-26 | Track C | `[DEV:dashboard]`*
*Updated: 2026-02-26 — P1 fix applied per CPTO review*

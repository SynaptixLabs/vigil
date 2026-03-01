# Sprint 07 — `[DEV:app]` Kickoff — Application Developer

You are `[DEV:app]` on **SynaptixLabs Vigil** — Sprint 07.

---

## Project Overview

**Vigil** is a Bug Discovery & Resolution Platform — a Chrome Extension that captures QA sessions (recordings, screenshots, bugs, features) and sends them to a Node.js server for analysis and autonomous resolution.

| Component | Stack | Your scope? |
|---|---|---|
| **Chrome Extension** | MV3, React 18, Vite, CRXJS, rrweb, Dexie.js | ✅ |
| **vigil-server** | Node.js Express + MCP SDK, port 7474 | ✅ |
| **Dashboard** | React 18, Tailwind CSS, served from vigil-server `/dashboard` | ✅ |
| **Infrastructure** | Neon PostgreSQL, Vercel deployment | ✅ |
| **AGENTS platform** | Python FastAPI, port 8000 (nightingale repo) | ❌ — `[DEV:ai]` owns this |

---

## Reading Material (mandatory before work)

1. `AGENTS.md` — global agent rules and role definitions
2. `CODEX.md` — workspace state, conventions
3. `docs/sprints/sprint_07/sprint_07_index.md` — full sprint scope
4. `docs/sprints/sprint_07/sprint_07_decisions_log.md` — all decisions (D001–D027)
5. `docs/sprints/sprint_07/todo/sprint_07_team_dev_todo.md` — your checklist
6. `docs/sprints/sprint_07/todo/sprint_07_product_vision.md` — Founder UX requirements
7. `docs/sprints/sprint_07/FOUNDER_ACCEPTANCE_WALKTHROUGH_S07.md` — FAT Round 3 steps

**Module-level AGENTS.md files:** `src/background/AGENTS.md`, `src/content/AGENTS.md`, `src/shared/AGENTS.md`, `packages/server/AGENTS.md`, `packages/dashboard/AGENTS.md`

---

## Two-Phase Sprint Structure (D021)

```
PHASE 1 (Week 1-2): UX Foundation — your core deliverables
    │
    ├── FAT Round 3 GATE — 13-step Founder acceptance walkthrough
    │   Must PASS before Phase 2 begins
    │
PHASE 2 (Week 2-3): Cloud infra + server features that depend on [DEV:ai]
```

---

## ⚡ Phase 1 — Your Assignments (sequential)

### 1. S07-11 — Shared Types Package (~2V) — Start Immediately

**Location:** `packages/shared/` (new workspace package)

Extract shared TypeScript types into a single source:
- Move Zod schemas from `src/shared/types.ts` and `packages/server/src/types.ts` into `packages/shared/`
- TS types via `z.infer<>`
- Both extension and server import from `@synaptix/vigil-shared`
- Resolves Sprint 06 U03 (duplicate type definitions)

**No dependencies. Start Day 1.**

### 2. S07-16b — Session Read API (~1.5V) — BLOCKS DASHBOARD

**Files:** `packages/server/src/routes/sessions.ts` (new), `packages/server/src/storage/types.ts`, `packages/server/src/app.ts`

> 🔴 **Critical blocker for S07-17a/17b.** Dashboard `api.ts` has `fetchSessions()` and `fetchSession()` stubs that will 404 without these endpoints. D025.

Endpoints:
1. `GET /api/sessions?project=X&sprint=Y` → `SessionSummary[]`
2. `GET /api/sessions/:id` → full `SessionDetail`

Extend storage provider with `listSessions(project?, sprint?)` and `getSession(sessionId)` read methods.

Types already defined in `packages/dashboard/src/types.ts` — `SessionSummary` and `SessionDetail`.

### 3. S07-17a — Dashboard Phase A: Nav + Filters + Screenshots (~3V)

**Files:** `packages/dashboard/src/`

- Navigation hierarchy: Project selector → Sprint view → Session drill-down
- Filters by project, sprint, session
- Bug/feature detail with attached screenshots inline
- Incremental rewrite (D018) — preserve existing testids

**Blocked by S07-16b.**

### 4. S07-17b — Dashboard Phase B: Timeline + Replay (~3V)

**Files:** `packages/dashboard/src/`

- Session timeline: visual chronological events
- Recording replay: play rrweb recording in dashboard
- Session metadata: duration, snapshot count, bug count

**Blocked by S07-17a.**

### 5. S07-13 — Dashboard Component Tests (~1V)

Add vitest config + component tests for NEW dashboard components (post S07-17a overhaul). Tests written for new state (D018).

**After S07-17a ships.**

---

## 🔧 Phase 2 — After FAT Round 3

| Order | ID | Deliverable | Cost | Notes |
|---|---|---|---|---|
| 6 | S07-15 | Neon PostgreSQL migration | ~4V | Can start parallel Week 2. `@neondatabase/serverless`. D016 fallback. |
| 7 | S07-14 | Vercel deployment | ~2V | After S07-15. `vercel.json` + serverless adaptation. |
| 8 | S07-05 | Returning bug detection (server-side) | ~3V | After `[DEV:ai]` ships S07-04. Load fixed bugs → AGENTS similarity → auto-escalate. |
| 9 | S07-07 | Severity auto-suggest (confidence UI) | ~2V | Stretch. After S07-04. |

---

## Environment

```powershell
cd C:\Synaptix-Labs\projects\vigil

# Extension
npm run dev            # Vite watch build (CRXJS)
npm run build          # Production build → dist/

# vigil-server
npm run dev:server     # nodemon on port 7474
npm run build:server   # production build

# Dashboard
npm run dev:dashboard  # Vite dev server

# Tests
npx vitest run         # Unit + integration (201 tests)
npx playwright test    # E2E (38 tests)
npx tsc --noEmit       # Type check
```

**Port map:** 7474 (vigil-server) | 3900 (TaskPilot demo) | 5173 (Vite HMR)

---

## Quality Gates (non-negotiable)

```
✅ TypeScript clean (tsc --noEmit) — extension + server + dashboard
✅ Build succeeds (npm run build + npm run build:server)
✅ Extension loads in Chrome without errors
✅ vigil-server health check passes (GET /health → 200)
✅ No regressions on existing E2E + unit suites
✅ Required data-testid attributes present
```

---

## Escalation Rules

You do NOT make product decisions. You FLAG ambiguity to `[CPTO]` before:
- Adding npm dependencies
- Changing cross-module interfaces (VIGILSession type, MCP tool signatures, API routes)
- Changing port 7474, Dexie schema, or Chrome manifest permissions
- Touching files outside your assigned scope

---

**Your first task: S07-11 (shared types package). Await CPTO GO to begin.**

*Generated: 2026-03-01 | Sprint 07 | Owner: CPTO*

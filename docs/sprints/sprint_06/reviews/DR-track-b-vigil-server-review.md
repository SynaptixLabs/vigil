# CPTO Design Review — Track B: vigil-server

**Sprint:** 06 | **Track:** B — vigil-server (Express + MCP)
**Author:** `[CTO]` | **Reviewer:** `[CPTO]`
**Date:** 2026-02-26
**Source:** `docs/sprints/sprint_06/reports/DR_CTO_track_b_vigil_server_2026-02-26.md`

---

## Verdict: **APPROVED** ✅ | Grade: **A-** → **A** (post-fix)

Track B is the backbone of the Vigil system — receiving sessions, storing bugs/features, and exposing MCP tools to Claude Code. The CTO review is thorough and accurate. Independent validation confirms: 6/6 MCP tools match spec, 12/12 decisions compliant, zero type drift, 169/169 full suite pass. All actionable BAD items resolved by DEV:server — B02 (MCP tool tests, P2), B04 (body limit, P3), B05 (emoji constants, P3) fixed promptly. Only B03 (HTTP integration tests) remains deferred to Sprint 07 per CPTO ruling. Grade upgraded from A- to A.

---

## Standard Checks (Vigil-specific)

- [x] TypeScript strict — `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- [x] Port 7474 — configurable via `vigil.config.json`, default 7474
- [x] No secrets in source or config — confirmed
- [x] Filesystem storage, no DB (D003) — confirmed
- [x] Mock LLM only (D005) — `/api/vigil/suggest` returns hardcoded stub
- [x] Unit tests — 49 tests (counter: 7, types: 5, writer: 13, reader: 10, MCP: 14)
- [ ] E2E — deferred to QA S06-15
- [x] No regressions — 169/169 full suite pass
- [x] Module boundaries — all code in `packages/server/`, no cross-module imports
- [x] Dependencies justified — express, cors, zod, @modelcontextprotocol/sdk

---

## CTO Report Validation (CPTO independent verification)

### Deliverable Verification — 5/5 CONFIRMED

| ID | Deliverable | CTO Claim | CPTO Validation |
|---|---|---|---|
| S06-05 | Server scaffold (Express, port 7474) | ✅ | **CONFIRMED** — `index.ts` binds port from config, health check at `/health`, CORS enabled, static serving for dashboard at `/dashboard` |
| S06-06 | Session receiver + filesystem writer | ✅ | **CONFIRMED** — POST `/api/session` with Zod `VIGILSessionSchema` validation, writes to `.vigil/sessions/`, bug/feature extraction to sprint dirs |
| S06-07 | MCP tools for Claude Code (6 tools) | ✅ | **CONFIRMED** — `mcp/tools.ts` registers 6 tools via `StdioServerTransport`. All 6 signatures match AGENTS.md §5 line-for-line |
| S06-08 | Bug/feature filesystem (reader + writer + counter) | ✅ | **CONFIRMED** — Separate `bugs.counter`/`features.counter` (D012). Reader parses markdown via regex. Writer creates/updates/moves files |
| S06-09 | REST API surface for dashboard | ✅ | **CONFIRMED** — 5 routes: `/api/bugs`, `/api/features`, `/api/sprints`, `/api/session`, `/api/vigil/suggest` + `/health` |

### MCP Tool Signatures — 6/6 EXACT (concur with CTO)

| Tool | AGENTS.md | Implementation |
|---|---|---|
| `vigil_list_bugs(sprint?, status?)` | line 93 | Zod optional params, returns filtered array |
| `vigil_get_bug(bug_id)` | line 94 | Returns full bug or `isError` on miss |
| `vigil_update_bug(bug_id, fields)` | line 95 | `BugUpdateSchema` reuse from routes |
| `vigil_close_bug(bug_id, resolution, keep_test)` | line 96 | Moves open→fixed directory |
| `vigil_list_features(sprint?, status?)` | line 97 | Mirrors bugs pattern |
| `vigil_get_feature(feat_id)` | line 98 | `isError` on miss |

Transport: `StdioServerTransport` — correct for Claude Code integration.

### Sprint 06 Decisions — 12/12 Compliant (concur with CTO)

D001 (port 7474), D002 (session=container), D003 (filesystem/no DB), D004 (MCP in server), D005 (mock LLM), D006 (dashboard served by server), D008 (maxFixIterations=3), D010 (FEAT same format), D011 (BUG-XXX.md filename), D012 (separate counters) — all verified.

### Type Drift — Zero (concur with CTO)

`src/shared/types.ts` interfaces match `packages/server/src/types.ts` Zod schemas field-for-field. Shared package planned for Sprint 07 (S07-11).

---

## GOOD (concur with CTO — 6/6 valid)

**G01 — Layered architecture.** Config → Types → Filesystem → Routes → MCP. No circular dependencies. Each route is a single Router export. MCP tools reuse filesystem functions — no duplication. This is the right layering for a markdown-as-DB system.

**G02 — Zod as single validation source.** One schema definition serves three consumers: REST validation, MCP tool parameters, and type inference. This eliminates drift between API contract and runtime validation.

**G03 — Config discovery.** `findConfigPath()` walks up from `packages/server/` to project root. Cached after first load. Helper functions (`getProjectRoot`, `getVigilDataDir`, `getSprintDir`) used consistently. No hardcoded paths anywhere.

**G04 — Self-review process worked.** DEV:server caught B01 (P1 — MCP tools targeting `sprint_current/` instead of `sprint_06/`) and fixed it before CTO review. All 7 self-review items verified as resolved. This validates the multi-layer review process.

**G05 — Test coverage on the right layer.** 35 tests focus on filesystem operations — the most fragile layer in a markdown-as-DB architecture. Writer tests verify file creation, status updates, bug closure with move semantics. Reader tests verify regex parsing against fixtures. This is where bugs will hide.

**G06 — Complete REST surface for Track C.** All dashboard endpoints exist and are wired. Track C (dashboard) had zero server-side blockers. This is good cross-track coordination.

---

## BAD — CTO Findings Assessment

### B01 — `.vigil/` missing from `.gitignore` → **FIXED** ✅
- **CTO severity:** P2 — **CPTO concurs**
- Fixed during CTO review. Runtime data would have been committed. Good catch.
- **Status:** CLOSED — no action needed.

### ~~B02 — No MCP tool tests~~ → **FIXED** ✅
- **CTO severity:** P2 — **CPTO concurs**
- ~~137 lines, 6 tools, zero test coverage.~~
- **Fix applied:** 14 tests in `tests/unit/server/mcp.test.ts` — covers all 6 tools (happy path + error path), Zod parameter validation, `isError` flags. 14/14 pass.
- **Status:** CLOSED. MCP tools now tested before Sprint 07 AGENTS integration, as required.

### B03 — No HTTP route integration tests → **VALID, DEFERRABLE**
- **CTO severity:** P3 — **CPTO concurs**
- Route handlers only tested via manual curl. No automated Express → filesystem → response tests.
- **CPTO decision:** Defer to Sprint 07. Dashboard E2E (QA Q606) provides indirect coverage for now.
- **Effort:** ~1.5V

### ~~B04 — 50MB JSON body limit~~ → **FIXED** ✅
- **CTO severity:** P3 — **CPTO concurs**
- **Fix applied:** `packages/server/src/index.ts:17` — limit reduced from `50mb` to `10mb`. One-liner.
- **Status:** CLOSED.

### ~~B05 — Magic emoji strings~~ → **FIXED** ✅
- **CTO severity:** P3 — **CPTO concurs**
- **Fix applied:** `TEST_STATUS` constants extracted to `types.ts`. `writer.ts` updated to use constants — no more magic strings.
- **Status:** CLOSED.

---

## UGLY — CTO Findings Assessment

### U01 — Counter race condition → **ACKNOWLEDGED**
- **CTO severity:** P2 now / P0 in multi-user — **CPTO concurs**
- Read-increment-write is not atomic. Single-user Sprint 06 is safe. Multi-user requires lockfile or atomic rename.
- **CPTO note:** S07-15 (Neon PostgreSQL) resolves this entirely — database sequences replace file counters. Moved from Sprint 08 to Sprint 07 per D015.

### U02 — Markdown-as-database regex fragility → **ACKNOWLEDGED**
- **CTO severity:** Per D003 — **CPTO concurs**
- By design for Sprint 06. Manual edits to bug files risk silent data loss.
- **CPTO note:** S07-15 (Neon PostgreSQL) resolves this. Structured storage replaces regex parsing.

### U03 — Duplicate type definitions → **ACKNOWLEDGED**
- **CTO severity:** P3 — **CPTO concurs**
- Server Zod schemas duplicated from extension interfaces. Zero drift today.
- **CPTO note:** S07-11 (shared types package) resolves this. Already in Sprint 07 scope.

### U04 — MCP and Express as separate processes → **NEW FINDING, VALID**
- **CTO severity:** P3 — **CPTO concurs**
- Claude Code spawns MCP server via stdio separately from Express. Both read/write same markdown files with no coordination. Concurrent write + read could yield partial data.
- **CPTO note:** Low risk for Sprint 06 (small files, fast I/O, single user). S07-15 (Neon) resolves this — database handles concurrent access. Monitor in Sprint 07 if Neon migration slips.

---

## Quality Gate Results

| Gate | Result |
|---|---|
| `tsc --noEmit` | **PASS** |
| `npm run build:server` | **PASS** |
| `vitest` | **169/169 PASS** (includes Track A tests + B02 MCP tests) |
| MCP tools match AGENTS.md §5 | **6/6 PASS** |
| Sprint 06 decisions compliance | **12/12 PASS** |
| Type drift (ext ↔ server) | **Zero** |
| `.gitignore` includes `.vigil/` | **PASS** (fixed during review) |
| No secrets in source | **PASS** |
| No hardcoded port | **PASS** — reads from config |

---

## CPTO Decisions

| # | Decision | Ruling |
|---|---|---|
| D1 | B02 (MCP tool tests) timing | ~~Before Sprint 07 AGENTS integration~~ — **DONE.** 14 tests shipped in S06. |
| D2 | B03 (HTTP integration tests) timing | **Defer to Sprint 07** — QA E2E provides indirect coverage for S06. |
| D3 | U01/U02 resolution path | **S07-15 (Neon PostgreSQL)** resolves both counter atomicity and markdown fragility. No Sprint 08 deferral needed. |
| D4 | U04 process coordination | **Monitor in Sprint 07.** Neon migration (S07-15) is the real fix. Low risk for S06 single-user. |

---

## Conditions — ALL CLEARED ✅

### FIXED (post-review)

- [x] **B02 — MCP tool tests.** 14 tests in `tests/unit/server/mcp.test.ts`. All 6 tools covered (happy + error paths). 14/14 pass. Fixed by `[DEV:server]`.
- [x] **B04 — Body limit.** Reduced from `50mb` to `10mb` in `index.ts:17`. Fixed by `[DEV:server]`.
- [x] **B05 — Magic emoji strings.** `TEST_STATUS` constants extracted to `types.ts`, `writer.ts` updated. Fixed by `[DEV:server]`.

### PREVIOUSLY FIXED (during CTO review)

- [x] **B01 — `.vigil/` in .gitignore.** Fixed by `[CTO]` during review.

### DEFERRED (per CPTO ruling)

- B03 — HTTP route integration tests → Sprint 07 (~1.5V)

---

## Impact Assessment

| Area | Impact |
|---|---|
| Existing E2E tests | **Zero risk** — server is a new package |
| Extension functionality | **Zero risk** — decoupled via HTTP |
| Dashboard readiness | **Ready** — all REST endpoints wired, Track C approved |
| MCP tool readiness | **Ready** — 6/6 tools match spec, 14 MCP tests pass, Claude Code can connect |
| Sprint 07 readiness | **Excellent** — all actionable items resolved, MCP tested, only B03 deferred |

---

## Cross-Review Notes

### CTO Review Quality Assessment

The CTO review is the highest-quality DR in Sprint 06:
- **Independent verification:** Line-by-line contract comparison (MCP tools vs AGENTS.md §5)
- **Complete decision audit:** 12/12 decisions checked individually
- **Type drift analysis:** Field-by-field comparison between extension and server types
- **Actionable fix list:** Every BAD item has severity, location, fix description, and effort estimate
- **Systemic awareness:** UGLY items correctly identify Sprint 07/08 resolution paths

This is the standard all Track DRs should meet.

### Sprint 07 Implications

Three UGLY items (U01, U02, U04) are now resolved by Sprint 07 scope additions:
- U01 (counter race) + U02 (markdown fragility) → **S07-15 (Neon PostgreSQL)**
- U03 (duplicate types) → **S07-11 (shared types package)**
- U04 (process coordination) → **S07-15 (Neon, database handles concurrency)**

~~B02 (MCP tool tests) should be prioritized early in Sprint 07~~ — **resolved in Sprint 06.** DEV:server shipped 14 MCP tests proactively. Sprint 07 Track B can begin immediately with no testing prerequisites.

---

## Sign-off

**Track B: vigil-server — APPROVED** ✅

**Grade: A** — upgraded from A- after DEV:server resolved all actionable items. Architecture is clean and contract-compliant. 963 LOC, 13 source files, 49 tests (35 original + 14 MCP). 6/6 MCP tools exact match. 12/12 decisions followed. Zero type drift. 4/5 BAD items fixed, 1 deferred by design. 169/169 full suite pass.

CTO review quality is excellent — thorough, accurate, and actionable. No corrections needed to CTO findings. DEV:server response to review was exemplary — all three actionable items resolved promptly with zero regressions.

**QA handoff: CLEARED.** All endpoints ready for E2E testing.

---

*Review by: [CPTO] | 2026-02-26*
*Updated: 2026-02-26 — B02/B04/B05 fixed, grade upgraded to A, conditions cleared*

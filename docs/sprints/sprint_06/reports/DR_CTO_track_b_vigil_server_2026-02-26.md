# DR — [CTO] Track B: vigil-server

**Date:** 2026-02-26
**Reviewer:** [CTO]
**Prior review:** [DEV:server] self-review — `DR_track_b_vigil_server_2026-02-26.md`
**Scope:** S06-05 through S06-09 — vigil-server package (963 LOC, 13 source files, 49 tests)
**Method:** Good/Bad/Ugly — independent agent-assisted audit of architecture, contracts, and tech debt

---

## Standard Checks

- [x] TypeScript strict — `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- [x] Port 7474 — configurable via `vigil.config.json`, default 7474
- [x] No secrets in source or config
- [x] Filesystem storage, no DB (D003)
- [x] Mock LLM only (D005)
- [x] Unit tests — 49 tests (counter: 7, types: 5, writer: 13, reader: 10, mcp: 14)
- [ ] E2E — deferred to QA S06-15
- [x] No regressions — 169/169 full suite pass
- [x] Module boundaries — all code in `packages/server/`, no cross-module imports
- [x] Dependencies justified — express, cors, zod, @modelcontextprotocol/sdk

---

## Contract Compliance

### MCP Tool Signatures vs AGENTS.md §5 — 6/6 EXACT

| Tool | Spec (AGENTS.md) | Implementation (mcp/tools.ts) |
|---|---|---|
| `vigil_list_bugs(sprint?, status?)` | line 93 | lines 9–27 — Zod optional params |
| `vigil_get_bug(bug_id)` | line 94 | lines 30–48 — returns `isError` on miss |
| `vigil_update_bug(bug_id, fields)` | line 95 | lines 51–70 — `BugUpdateSchema` reuse |
| `vigil_close_bug(bug_id, resolution, keep_test)` | line 96 | lines 73–93 — moves open→fixed |
| `vigil_list_features(sprint?, status?)` | line 97 | lines 96–114 — mirrors bugs pattern |
| `vigil_get_feature(feat_id)` | line 98 | lines 117–135 — `isError` on miss |

Transport: stdio (`StdioServerTransport`) — correct for Claude Code.

### Sprint 06 Decisions — 12/12 Compliant

D001 (port 7474), D002 (session=container), D003 (filesystem/no DB), D004 (MCP in server), D005 (mock LLM), D006 (dashboard served by server), D008 (maxFixIterations=3), D010 (FEAT same format), D011 (BUG-XXX.md filename), D012 (separate counters) — all verified in code.

### Type Drift — Extension vs Server: Zero

`src/shared/types.ts` Bug/Feature/VIGILSession interfaces match `packages/server/src/types.ts` Zod schemas field-for-field. No drift. Shared package planned for Sprint 07 (U03).

---

## GOOD (keep)

**G01 — Layered architecture.** Config → Types → Filesystem → Routes → MCP. No circular dependencies. Each route exports a single Router. Filesystem layer (reader/writer/counter) is decoupled from HTTP. MCP tools reuse the same filesystem functions as REST routes.

**G02 — Zod as single validation source.** `VIGILSessionSchema` validates POST `/api/session`. `BugUpdateSchema` validates PATCH. Same schemas drive MCP tool parameters. One definition, three consumers.

**G03 — Config discovery.** `findConfigPath()` walks up from `packages/server/` to project root. Cached after first load. Helpers (`getProjectRoot`, `getVigilDataDir`, `getSprintDir`) used consistently across all modules. No hardcoded paths.

**G04 — Self-review process worked.** DEV:server caught B01 (P1 — MCP tools targeting `sprint_current/` instead of `sprint_06/`) and fixed it before CTO review. All 7 self-review items verified as resolved in code. This is the review process working as designed.

**G05 — Test coverage on the right layer.** 35 tests focus on the filesystem layer — the most fragile part of a markdown-as-DB architecture. Writer tests verify file creation, status updates, bug closure with move semantics. Reader tests verify regex parsing against known fixtures.

**G06 — Complete REST surface for Track C.** `/api/bugs`, `/api/features`, `/api/sprints`, `/api/session`, `/api/vigil/suggest` — dashboard has all endpoints. No Track C blockers.

---

## BAD (fix)

### B01 — `.vigil/` missing from `.gitignore`
- **Severity:** P2 — **FIXED during this review**
- **Location:** `.gitignore`
- **Problem:** Runtime data (`sessions/`, `bugs.counter`, `features.counter`) would be committed to Git.
- **Fix applied:** Added `/.vigil/` under new "Vigil Runtime Data" section.

### B02 — No MCP tool tests
- **Severity:** P2 — **FIXED post-CPTO review**
- **Location:** `tests/unit/server/mcp.test.ts`
- **Problem:** `mcp/tools.ts` (137 lines, 6 tools) had zero test coverage.
- **Fix applied:** 14 tests covering all 6 tools — registration, list/get/update/close bugs, list/get features. Happy path + error path (`isError` flag) for each.
- **Effort:** ~1V

### B03 — No HTTP route integration tests
- **Severity:** P3
- **Location:** Missing `tests/integration/server/`
- **Problem:** Route handlers tested only via manual curl. No automated tests exercising Express middleware → route → filesystem → response.
- **Fix:** Supertest-based integration tests. Deferrable to Sprint 07.
- **Effort:** ~1.5V

### B04 — 50MB JSON body limit
- **Severity:** P3 — **FIXED post-CPTO review**
- **Location:** `packages/server/src/index.ts:17`
- **Problem:** `express.json({ limit: '50mb' })` allowed oversized payloads.
- **Fix applied:** Reduced to `10mb`. One-liner change.
- **Effort:** ~0.1V

### B05 — Magic emoji strings
- **Severity:** P3 — **FIXED post-CPTO review**
- **Location:** `packages/server/src/types.ts`, `packages/server/src/filesystem/writer.ts`
- **Problem:** `⬜`, `🟢`, `⬜ (archived)` were hardcoded in regex and string construction.
- **Fix applied:** Extracted to `TEST_STATUS` constant in `types.ts`. Writer uses `TEST_STATUS.PENDING`, `.PASSING`, `.ARCHIVED`.
- **Effort:** ~0.25V

---

## UGLY (systemic)

### U01 — Counter race condition
- **Severity:** P2 now / P0 in multi-user
- **Location:** `filesystem/counter.ts:21–25`
- **Problem:** Read-increment-write is not atomic. Concurrent POSTs could produce duplicate IDs.
- **Status:** Acceptable for Sprint 06 single-user. Needs lockfile or atomic rename for Sprint 08+.

### U02 — Markdown-as-database regex fragility
- **Severity:** Acknowledged per D003
- **Location:** `filesystem/reader.ts`, `filesystem/writer.ts`
- **Problem:** Regex parsing fails silently on format variations. Manual edits to bug files risk silent data loss.
- **Status:** By design for Sprint 06. Sprint 08+ should migrate to YAML frontmatter.

### U03 — Duplicate type definitions
- **Severity:** P3
- **Location:** `packages/server/src/types.ts` vs `src/shared/types.ts`
- **Problem:** Server Zod schemas manually duplicated from extension interfaces. Drift risk on any model change.
- **Status:** Zero drift today. Sprint 07 shared package will resolve.

### U04 — MCP and Express as separate processes sharing filesystem
- **Severity:** P3 (new finding)
- **Location:** `mcp/server.ts` (stdio child process) vs `index.ts` (Express main process)
- **Problem:** Claude Code spawns MCP server separately. Both processes read/write the same markdown files with no coordination. Concurrent write from Express + read from MCP could yield partial data.
- **Status:** Low risk for Sprint 06 (small files, fast I/O). Monitor in Sprint 07.

---

## Summary

| Category | Count |
|---|---|
| GOOD | 6 |
| BAD | 5 (0x P0, 0x P1, 2x P2, 3x P3) — all fixed |
| UGLY | 4 systemic — all deferred by design |

---

## Overall Grade: A-

Architecture is clean and contract-compliant. 6/6 MCP tools match spec. 12/12 decisions followed. Zero type drift. Self-review process caught the only P1 before this review. One `.gitignore` omission found and fixed.

No P0 or P1 issues remain. All BAD items fixed (B01–B05). Only B03 (HTTP integration tests) deferred to Sprint 07. Track B is approved.

---

## Prioritized Fix List

| Priority | ID | Fix | Effort | When |
|---|---|---|---|---|
| ~~P2~~ | ~~B01~~ | ~~`.vigil/` in .gitignore~~ | ~~0.1V~~ | **DONE** |
| ~~P2~~ | ~~B02~~ | ~~MCP tool unit tests~~ | ~~1V~~ | **DONE** — 14 tests |
| P3 | B03 | HTTP route integration tests | ~1.5V | Sprint 07 |
| ~~P3~~ | ~~B04~~ | ~~Reduce JSON body limit to 10MB~~ | ~~0.1V~~ | **DONE** |
| ~~P3~~ | ~~B05~~ | ~~Extract emoji constants~~ | ~~0.25V~~ | **DONE** |

## Deferred (UGLY)

| ID | Item | Target |
|---|---|---|
| U01 | Counter atomicity | Sprint 08 |
| U02 | Frontmatter migration | Sprint 08 |
| U03 | Shared types package | Sprint 07 |
| U04 | MCP/Express process coordination | Sprint 07 (monitor) |

## Next Steps

1. **Track B approved** — no Sprint 06 blockers.
2. **Track C + D unblocked** — REST APIs and MCP tools ready.
3. **QA S06-15 unblocked** — session POST → filesystem verification.
4. **B02 (MCP tests)** should be scheduled before Sprint 07 AGENTS integration.

---

*CTO Design Review | 2026-02-26 | Sprint 06*

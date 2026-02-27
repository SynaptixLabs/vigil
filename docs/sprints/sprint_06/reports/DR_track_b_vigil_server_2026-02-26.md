# DR — Track B: vigil-server

**Date:** 2026-02-26
**Reviewer:** [DEV:server] (self-review for [CPTO])
**Scope:** S06-05 through S06-09 — full vigil-server package
**Deliverables:** Express scaffold, session receiver, MCP tool layer, bug/feature counter, LLM suggest mock

---

## Standard Checks (Vigil-specific)

- [x] TypeScript: no `any`, no suppressed errors — `tsc --noEmit` clean
- [N/A] Chrome Manifest V3 compliance — server package, not extension
- [N/A] Shadow DOM — server package
- [N/A] rrweb — server package
- [N/A] Dexie.js — server package, uses filesystem
- [x] vigil-server on port 7474 — reads from `vigil.config.json`, defaults to 7474
- [x] No secrets in `vigil.config.json` or source files
- [x] Unit tests for all new logic — 35 tests (counter: 7, types: 5, writer: 13, reader: 10)
- [ ] E2E coverage for new user-facing flows — deferred to QA S06-15
- [x] No regressions on previously accepted features — 155/155 pass (0 failures)
- [x] Module boundaries respected — all code in `packages/server/`
- [N/A] data-testid attributes — server, no UI
- [x] Dependencies declared — express, cors, zod, @modelcontextprotocol/sdk (all essential)

---

## GOOD (keep)

**G01 — Clean module separation.** Config, types, routes, filesystem, and MCP are distinct modules with clear responsibilities. No circular dependencies. Each route file exports a single Router. The filesystem layer has reader/writer/counter as separate concerns. This will make Sprint 07 AGENTS integration straightforward.

**G02 — Zod validation at system boundary.** `VIGILSessionSchema` validates the full session payload on POST. Invalid payloads get 400 with structured error details. The same Zod schemas are reused for MCP tool parameter validation — single source of truth for the wire format.

**G03 — Separate counter files (D012 compliance).** `bugs.counter` and `features.counter` are independent, as decided. Counter auto-creates `.vigil/` directory on first write. IDs pad to 3 digits (`BUG-001`). 7 unit tests cover sequential increment, independence, and edge cases (counter at 99 → 100).

**G04 — MCP tools match contract exactly.** 6 tools registered per AGENTS.md §5: `vigil_list_bugs`, `vigil_get_bug`, `vigil_update_bug`, `vigil_close_bug`, `vigil_list_features`, `vigil_get_feature`. Each has Zod parameter schemas with `.describe()` for tool discovery. Stdio transport in `mcp/server.ts` is the correct choice for Claude Code integration.

**G05 — Health check matches spec.** `GET /health → 200 { status: "ok", version: "2.0.0", llmMode: "mock", port: 7474 }`. Verified live.

**G06 — Config walks up to find `vigil.config.json`.** Works regardless of CWD. Cached after first load. Exposes helper functions (`getProjectRoot`, `getVigilDataDir`, `getSprintDir`) used by all other modules.

**G07 — Bug file format matches CLAUDE.md §6.** Filename is `BUG-XXX.md` (D011). Contains all required sections: Status, Severity, Sprint, Discovered, Steps to Reproduce, Expected, Actual, URL, Regression Test with path and status indicator.

---

## BAD (fix)

### B01 — Sprint default bug in writer functions
- **Severity:** P1
- **Location:** `packages/server/src/filesystem/writer.ts:63`, `:73`, `:96`, `:137`
- **Problem:** `bugDir(sprint ?? 'current')` and `featDir(sprint ?? 'current')` pass the literal string `'current'` to `getSprintDir()`, which builds `docs/sprints/sprint_current/` — a directory that doesn't exist. `getSprintDir(undefined)` already resolves to the actual sprint via `loadConfig().sprintCurrent`, but it never receives `undefined` because of the `?? 'current'` fallback.
- **Impact:** MCP tools `vigil_update_bug` and `vigil_close_bug` call writer functions without a sprint arg. These writes and reads silently target the wrong directory. Session route is not affected (always passes explicit sprint).
- **Fix:** Remove the `?? 'current'` fallbacks. Change `bugDir` and `featDir` signatures to accept `string | undefined` and let `getSprintDir` handle the default.
- **Effort:** ~0.5V

### B02 — Bug markdown writes `## Sprint: current` literally
- **Severity:** P2
- **Location:** `packages/server/src/filesystem/writer.ts:24`
- **Problem:** `bugToMarkdown()` hardcodes `## Sprint: current` instead of interpolating the actual sprint number. Same issue in `featureToMarkdown()` at line 49.
- **Impact:** Bug files have `Sprint: current` instead of `Sprint: 06`. Reader can still parse it, but it's inaccurate metadata. MCP `vigil_list_bugs` returns `sprint: "current"` in results.
- **Fix:** Pass the sprint string into `bugToMarkdown()` and `featureToMarkdown()`, write `## Sprint: ${sprint}`.
- **Effort:** ~0.25V

### B03 — No `GET /api/sprints` route
- **Severity:** P2
- **Location:** Missing — `packages/server/src/routes/sprints.ts`
- **Problem:** Track C dashboard spec requires "Sprint selector (reads sprint folders via GET /api/sprints)". This route doesn't exist. Dashboard can't populate the sprint dropdown.
- **Impact:** Blocks Track C API integration.
- **Fix:** Add `routes/sprints.ts` — scan `docs/sprints/` directory, return list of sprint IDs.
- **Effort:** ~0.5V

### B04 — No `GET /api/features` REST route
- **Severity:** P2
- **Location:** Missing — should be in `packages/server/src/routes/features.ts` or extend bugs router
- **Problem:** Bugs have full CRUD REST routes. Features only have MCP tools, no REST API. Dashboard feature table needs a REST endpoint.
- **Impact:** Blocks Track C feature table.
- **Fix:** Add `routes/features.ts` mirroring the bugs pattern.
- **Effort:** ~0.5V

### B05 — `import.meta.dirname` requires Node >= 20.11
- **Severity:** P3
- **Location:** `packages/server/src/config.ts:17`, `packages/server/src/index.ts:33`
- **Problem:** `import.meta.dirname` was added in Node 21.2, backported to 20.11. `package.json` declares `"node": ">=20.0.0"`.
- **Impact:** Fails on Node 20.0–20.10 with `TypeError: Cannot read properties of undefined (reading 'dirname')`.
- **Fix:** Either bump engine requirement to `>=20.11.0` or use `import { dirname } from 'node:path'; import { fileURLToPath } from 'node:url'; const __dirname = dirname(fileURLToPath(import.meta.url))`.
- **Effort:** ~0.25V

### B06 — Missing unit tests for writer and reader
- **Severity:** P2
- **Location:** `tests/unit/server/` — only counter and types tests exist
- **Problem:** No unit tests for `writer.ts` (writeBug, writeFeature, updateBug, closeBug) or `reader.ts` (parseBugFile, parseFeatureFile, listBugs, getBug). These are the most complex modules.
- **Impact:** Writer has a real bug (B01) that tests would have caught. Reader's regex parsing is untested — formatting changes could break it silently.
- **Fix:** Add `writer.test.ts` and `reader.test.ts` with temp directory fixtures.
- **Effort:** ~1.5V

### B07 — `closeBug` regex fragility on test status
- **Severity:** P3
- **Location:** `packages/server/src/filesystem/writer.ts:157`
- **Problem:** `content.replace(/Status: ⬜/, ...)` matches the first occurrence of `Status: ⬜` in the file. If the `## Status:` line somehow also contains ⬜ (unlikely but possible), it could replace the wrong line. More practically, if a bug was already partially updated and the regression test status is no longer ⬜, the replace silently does nothing.
- **Fix:** Make the regex more specific: match only within the `## Regression Test` section, or use a line-by-line parser.
- **Effort:** ~0.5V

---

## UGLY (systemic)

### U01 — Counter race condition
- **Severity:** P2 now / P0 in multi-user
- **Location:** `packages/server/src/filesystem/counter.ts:21-25`
- **Problem:** `readCounter → increment → writeFile` is not atomic. Two concurrent session POSTs could read the same counter value, both increment to the same next value, and produce duplicate bug IDs.
- **Risk:** Acceptable for Sprint 06 single-user. Becomes a data integrity issue if Sprint 07+ introduces concurrent session processing or multiple server instances.
- **Strategic fix:** Use a lockfile (`proper-lockfile` npm), or switch to an atomic file rename pattern (write to temp, rename), or move counters to SQLite when a DB is eventually introduced.
- **Effort:** ~1V to fix properly

### U02 — Markdown-as-database
- **Severity:** Acknowledged (D003)
- **Location:** `reader.ts`, `writer.ts`
- **Problem:** Using regex to parse/update markdown files is inherently fragile. Any manual edit to a bug file (different whitespace, missing section, reordered headers) could break the parser. The writer uses string concatenation and regex replacement — a single unexpected format variation causes silent data loss or corruption.
- **Risk:** By design for Sprint 06 (D003: "debuggable, diffable, no infra dependency"). But the parser should be hardened with defensive checks and warnings for parse failures.
- **Strategic fix:** Sprint 08+ — either introduce frontmatter (YAML header) for structured fields with freeform markdown body, or migrate to SQLite with markdown export.
- **Effort:** ~3V for frontmatter migration

### U03 — Duplicate type definitions
- **Severity:** P3
- **Location:** `packages/server/src/types.ts` vs `src/shared/types.ts`
- **Problem:** Server-side Zod schemas (`Bug`, `Feature`, `VIGILSession`) are manually duplicated from extension-side TypeScript interfaces. If Track A changes the session model, the server types must be manually updated in lockstep.
- **Risk:** Schema drift. Extension sends a field the server doesn't validate, or vice versa. Sprint 07+ exacerbates this when AGENTS also consumes the same types.
- **Strategic fix:** Extract shared types into `packages/shared/` as a workspace package. Both extension and server import from one source. Zod schemas live there; TS types are inferred via `z.infer<>`.
- **Effort:** ~2V (needs workspace package setup + import path updates)

---

## Summary

| Category | Count |
|---|---|
| GOOD | 7 items |
| BAD | 7 issues (1x P1, 4x P2, 2x P3) |
| UGLY | 3 systemic concerns |

### Overall Grade: **B+** → **A-** (post-fix)

Initial review found 7 BAD items (1x P1, 4x P2, 2x P3) and 3 UGLY systemic concerns. **All 7 BAD items have been fixed in-session:**

| ID | Status | What was done |
|---|---|---|
| B01 | **FIXED** | Removed `?? 'current'` fallbacks; `bugDir`/`featDir` now accept `string \| undefined`, `getSprintDir` resolves default |
| B02 | **FIXED** | `bugToMarkdown`/`featureToMarkdown` now accept `sprint` param, writes `## Sprint: 06` |
| B03 | **FIXED** | Added `routes/sprints.ts` — `GET /api/sprints` returns `{ sprints: [{id, name}], current }` |
| B04 | **FIXED** | Added `routes/features.ts` — `GET /api/features`, `GET /api/features/:id` |
| B05 | **FIXED** | Engine bumped to `>=20.11.0` in `packages/server/package.json` |
| B06 | **FIXED** | Added `writer.test.ts` (13 tests) + `reader.test.ts` (10 tests) — **35 total server tests, all green** |
| B07 | **FIXED** | `closeBug` regex now targets `## Regression Test` section specifically |

### Final Quality Gate Results

| Gate | Result |
|---|---|
| `tsc --noEmit` (server) | **PASS** |
| `npm run build:server` | **PASS** |
| `npx vitest run` (full suite) | **155/155 PASS** (0 failures) |
| `GET /health → 200` | **PASS** |
| `GET /api/sprints` | **PASS** — returns 8 sprints, current = "06" |
| `GET /api/features` | **PASS** |
| `POST /api/vigil/suggest` | **PASS** — mock response |
| Server starts on port 7474 | **PASS** |

### Remaining Systemic (UGLY) — deferred by design

| ID | Item | Defer to |
|---|---|---|
| U01 | Counter race condition (non-atomic read/write) | Sprint 08 (multi-user) |
| U02 | Markdown-as-DB regex fragility | Sprint 08 (frontmatter migration) |
| U03 | Duplicate type definitions (server vs extension) | Sprint 07 (shared package) |

These are all acknowledged by existing decisions (D003) and do not block Sprint 06 acceptance.

### What to Cut

Nothing.

---

*DR generated: 2026-02-26 | Updated: 2026-02-26 (all BAD items fixed) | Sprint 06 | Reviewer: [DEV:server]*

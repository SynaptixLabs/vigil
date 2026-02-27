# Sprint 06 — DEV Team Deliverable Checklist

**Sprint goal:** Ship Vigil core platform v2.0.0
**Budget:** ~30V | **Port:** 7474 | **LLM:** mock

---

## Track A — Extension Refactor `[DEV:ext]` (CRITICAL PATH)

> All other tracks depend on Track A session types. Ship S06-01 types first.

| Status | ID | Deliverable | Cost | Notes |
|---|---|---|---|---|
| [x] | S06-01 | Session model refactor (session = container, recording = opt-in) | ~4V | `src/shared/types.ts` + `session-manager.ts` — VIGILSession/VIGILRecording/VIGILSnapshot + vigilSessionManager added |
| [x] | S06-02 | Snapshot + bug editor combo (Ctrl+Shift+B) | ~2V | `src/background/shortcuts.ts` — captures screenshot, creates VIGILSnapshot, sends OPEN_BUG_EDITOR |
| [x] | S06-03 | SPACE shortcut (toggle recording outside input fields) | ~1V | `src/content/content-script.ts` + `message-handler.ts` — TOGGLE_RECORDING wired |
| [x] | S06-04 | END SESSION → POST to vigil-server with retry + offline queue | ~2V | `session-manager.ts` — postWithRetry(3x), loadServerPort from config, pendingSync on fail |

**Track A total: ~9V**

### Track A — Supplementary (DR follow-up)

| Status | Item | Notes |
|---|---|---|
| [x] | Fix pre-existing `message-handler.test.ts` failures (4) | Added missing `chrome.tabs.query`, `chrome.runtime.sendMessage`, `chrome.runtime.getURL` mocks |
| [x] | Wire `OPEN_BUG_EDITOR` in content script + ControlBar | Content script dispatches `vigil:open-bug-editor` event → ControlBar opens BugEditor with `screenshotId` |
| [x] | Unit tests for `vigilSessionManager` (23 tests) | Covers create, start/stop/toggle recording, addSnapshot/Bug/Feature, endSession, error cases, state queries |
| [x] | Fix Track B build blocker (unused vars in `counter.test.ts`) | Removed unused `readFile` import + `currentFeatCount` binding |

**Test suite: 132/132 pass (0 failures)**

---

## Track B — vigil-server `[DEV:server]`

> S06-05 (scaffold) and S06-08 (counter) can start before Track A ships. S06-06 (session receiver) needs final VIGILSession type.

| Status | ID | Deliverable | Cost | Notes |
|---|---|---|---|---|
| [x] | S06-05 | Server scaffold: Express + TS, port 7474, health check | ~2V | `packages/server/` — Express app, config, health check, CORS, scripts in root package.json |
| [x] | S06-06 | Session receiver: POST /api/session → filesystem writer | ~3V | Zod validation, writes session JSON + BUG-XXX.md + FEAT-XXX.md to sprint folders |
| [x] | S06-07 | MCP tool layer: 6 tools exposed to Claude Code | ~3V | `mcp/tools.ts` + `mcp/server.ts` — stdio transport, 6 tools registered |
| [x] | S06-08 | Bug/Feature ID counter (.vigil/bugs.counter) | ~1V | Separate counters: `.vigil/bugs.counter` + `.vigil/features.counter`, auto-creates dir |
| [x] | S06-09 | /api/vigil/suggest mock stub (VIGIL_LLM_MODE=mock) | ~1V | Returns mock response when llmMode=mock, 501 for live |

**Track B total: ~10V**

### Track B — Supplementary (DR follow-up)

| Status | Item | Notes |
|---|---|---|
| [x] | B02: MCP tool unit tests (14 tests) | `tests/unit/server/mcp.test.ts` — all 6 tools tested (happy path + error path) |
| [x] | B04: Reduce JSON body limit to 10MB | `index.ts` — `express.json({ limit: '10mb' })` |
| [x] | B05: Extract TEST_STATUS constants | `types.ts` + `writer.ts` — no more magic emoji strings |

**Test suite: 169/169 pass (0 failures)**

---

## Track C — Dashboard `[DEV:dashboard]`

> Can scaffold React app immediately. API integration waits for Track B.

| Status | ID | Deliverable | Cost | Notes |
|---|---|---|---|---|
| [x] | S06-10 | Dashboard SPA: bug/feature tables by sprint, severity, status | ~4V | `packages/dashboard/` → builds to `packages/server/public/` — DONE: scaffold + views + components + build verified |
| [x] | S06-11 | Row actions: change severity, move to backlog, assign sprint | ~2V | UI built (severity dropdown + status toggle). API calls wired to Track B endpoints — will work when server routes ship |

**Track C total: ~6V**

---

## Track D — Claude Code Commands `[DEV:*]`

> Depends on Track B MCP tools being registered.

| Status | ID | Deliverable | Cost | Notes |
|---|---|---|---|---|
| [ ] | S06-12 | `/project:bug-log` slash command | ~1V | `.claude/commands/bug-log.md` |
| [ ] | S06-13 | `/project:bug-fix` slash command (red→green loop) | ~2V | `.claude/commands/bug-fix.md` — uses MCP tools |
| [ ] | S06-14 | `/project:bug-review` slash command (sprint closure gate) | ~1V | `.claude/commands/bug-review.md` |

**Track D total: ~4V**

---

## QA `[QA]`

| Status | ID | Deliverable | Cost | Notes |
|---|---|---|---|---|
| [ ] | S06-15 | E2E: session POST → filesystem write verified | ~1V | Phase 2 — after Track B ships |

**QA total: ~1V**

---

## Dependency Summary

```
S06-01 (types) ──→ S06-06 (receiver) ──→ S06-10/11 (dashboard APIs)
                                      ──→ S06-12/13/14 (commands via MCP)
S06-05 (scaffold) ── can start immediately
S06-08 (counter)  ── can start immediately
QA Phase 1 ── after Track A (Q601–Q603)
QA Phase 2 ── after Track B (Q604–Q606)
```

---

*Generated: 2026-02-26 | Sprint 06 | Owner: CPTO*

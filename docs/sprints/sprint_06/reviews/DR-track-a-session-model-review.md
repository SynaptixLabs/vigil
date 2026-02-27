# CPTO Design Review — Track A: Session Model Refactor

**Sprint:** 06 | **Track:** A — Extension Refactor
**Author:** `[DEV:ext]` | **Reviewer:** `[CPTO]`
**Date:** 2026-02-26
**Source:** `docs/sprints/sprint_06/reports/DR-track-a-session-model.md`

---

## Verdict: **APPROVED** ✅ | Grade: **A**

All 4 deliverables verified against source code. Zero discrepancies between DEV report and implementation. Clean migration strategy, backward-compatible, fully tested.

---

## Standard Checks (Vigil-specific)

- [x] TypeScript: no `any`, no suppressed errors — `tsc --noEmit` clean
- [x] Chrome Manifest V3 compliance — no V2 APIs used
- [x] Shadow DOM — not applicable (no new injected UI in Track A)
- [x] rrweb — `RrwebChunk` interface added, recording model correct
- [x] Dexie.js — legacy Session/Dexie untouched (deliberate)
- [x] vigil-server port from config — `loadServerPort()` reads `vigil.config.json`, falls back to 7474
- [x] No secrets in source files — confirmed
- [x] Unit tests for all new logic — 23 new tests in `vigil-session-manager.test.ts`
- [x] No regressions — 132/132 pass (0 failures)
- [x] No new dependencies — confirmed
- [x] Module boundaries respected — all changes within `src/background/`, `src/content/`, `src/shared/`

---

## Deliverable Verification (source code validated)

| ID | Deliverable | Status | Evidence |
|---|---|---|---|
| S06-01 | Session model refactor | **CONFIRMED** | `VIGILSession`, `VIGILRecording`, `VIGILSnapshot`, `RrwebChunk` at `types.ts:188-243`. 4 MessageType enum values at `:56-60`. Legacy `Session` (:117-134) untouched. |
| S06-02 | Snapshot + bug editor combo | **CONFIRMED** | `shortcuts.ts:71` — `captureVisibleTab` JPEG quality 80. `:81-87` — VIGILSnapshot with `triggeredBy: 'bug-editor'`. `:99-101` — `OPEN_BUG_EDITOR` message. `:105-114` — fallback to legacy `LOG_BUG`. |
| S06-03 | SPACE toggle recording | **CONFIRMED** | `content-script.ts:112-122` — SPACE keydown with `input`/`textarea`/`select`/`contentEditable` guards. `message-handler.ts:227-251` — `TOGGLE_RECORDING` handler with vigil-first, legacy fallback. |
| S06-04 | END SESSION POST with retry | **CONFIRMED** | `session-manager.ts:287-311` — `postWithRetry` 3 attempts, exponential backoff (1s/2s/3s), sets `pendingSync: true` on failure, notifies tab. `:269-281` — `loadServerPort()` reads `vigil.config.json` via `chrome.runtime.getURL()`. |

### Supplementary

| Item | Status | Evidence |
|---|---|---|
| Legacy `sessionManager` coexists | **CONFIRMED** | `session-manager.ts:113-252` — original export intact, used in `shortcuts.ts:21-36` fallback paths |
| `vigilSessionManager` exports (7+4 methods) | **CONFIRMED** | `:313-471` — `createSession`, `startRecording`, `stopRecording`, `toggleRecording`, `endSession`, `addSnapshot`, `addBug`, `addFeature` + 4 query methods |
| 23 unit tests | **CONFIRMED** | `vigil-session-manager.test.ts` — 256 lines, covers create, start/stop/toggle recording, addSnapshot/Bug/Feature, endSession, state queries |
| `vigil.config.json` in manifest | **CONFIRMED** | `manifest.json:69` — listed in `web_accessible_resources` |
| Pre-existing test failures fixed | **CONFIRMED** | 4 fixes in `message-handler.test.ts` — added `chrome.tabs.query`, `chrome.runtime.sendMessage`, `chrome.runtime.getURL` mocks |
| Track B build blocker fixed | **CONFIRMED** | `counter.test.ts` — removed unused `readFile` import + `currentFeatCount` binding |

---

## GOOD

**G1 — Migration strategy is textbook.** New types (`VIGIL*`) coexist alongside legacy `Session`. Zero modification to Dexie schema, zero risk to existing E2E. The comment block at `types.ts:188-191` documents the coexistence explicitly. This is exactly how you run a parallel migration — full marks.

**G2 — Fallback chains are bulletproof.** Every new path has a fallback to legacy behavior:
- `shortcuts.ts` OPEN_BUG_EDITOR → falls back to LOG_BUG
- `message-handler.ts` TOGGLE_RECORDING → falls back to legacy pause/resume
- `loadServerPort()` → falls back to 7474
- `postWithRetry` → sets `pendingSync` flag on total failure

This means the extension works identically to before until a vigil session is explicitly created. Zero regression risk.

**G3 — SPACE guard is complete.** All four input element types covered (`input`, `textarea`, `select`, `contentEditable`). The `e.preventDefault()` only fires after all guards pass. No user typing will be intercepted.

**G4 — postWithRetry is production-grade.** 3 attempts, linear backoff (1s/2s/3s), marks `pendingSync` on failure, notifies the active tab with success/fail message. The tab can then show a toast via `SESSION_SYNCED` / `SESSION_SYNC_FAILED` message types.

**G5 — Test quality is high.** 23 new tests with proper Chrome API mocking. Tests cover both happy paths and error states (e.g., calling `startRecording` without active session throws). The 4 pre-existing test failures were also cleaned up — good housekeeping.

**G6 — Cross-track collaboration.** Track A fixed a Track B build blocker (unused vars in `counter.test.ts`) without being asked. This kind of proactive unblocking is exactly what we want.

---

## BAD

**B1 — Config fetch on every `endSession()`** (low priority)
`loadServerPort()` does a `fetch()` + JSON parse of `vigil.config.json` on every call. For a single POST at session end, this is negligible. But if we ever call it in a hot path (e.g., streaming), it would be wasteful.

**Severity:** P3 — not worth a Sprint 06 fix.
**Recommendation:** Sprint 07 — cache port on first load. One-liner: `let cachedPort: number | null = null;`

---

## UGLY

**U1 — VIGILSession is in-memory only** (deliberate tradeoff)
The vigil session lives in a module-level `vigilState` variable. If the service worker restarts mid-session (Chrome MV3 does this aggressively), the session is lost. The legacy `sessionManager` persists to Dexie — `vigilSessionManager` does not.

**Severity:** P1 for real-world usage, but **P3 for Sprint 06** — this was a deliberate scope cut per the migration strategy (no Dexie schema migration yet).
**Resolution:** **Already in Sprint 07 scope as S07-12** — VIGILSession persistence via `chrome.storage.local`. Tracked and accounted for.

---

## Quality Gate Results

| Gate | Result |
|---|---|
| `tsc --noEmit` | **PASS** |
| `npm run build` | **PASS** |
| `vitest` | **132/132 PASS** (0 failures) |
| Legacy Session untouched | **CONFIRMED** |
| No new dependencies | **CONFIRMED** |
| No hardcoded secrets | **CONFIRMED** |
| No hardcoded port | **CONFIRMED** — reads from config |

---

## Impact Assessment

| Area | Impact |
|---|---|
| Existing E2E tests | **Zero risk** — legacy paths preserved |
| Extension load time | **Zero impact** — new code only runs when vigil session created |
| Bundle size | **Minimal** — type definitions + ~200 lines of session logic |
| Track B unblocked | **Yes** — `VIGILSession` type available for session receiver |
| QA Phase 1 unblocked | **Yes** — Q601/Q602/Q603 can begin |

---

## Sign-off

**Track A: Session Model Refactor — APPROVED** ✅

All 4 deliverables match spec, code matches report, tests pass, legacy preserved. The one BAD (config caching) is low-priority. The one UGLY (in-memory session) is a known Sprint 06 tradeoff already addressed in Sprint 07 scope (S07-12).

No fixes required. Ship it.

---

*Review by: [CPTO] | 2026-02-26*

# Design Review — Track A: Session Model Refactor

**Sprint:** 06 | **Track:** A — Extension Refactor | **Role:** `[DEV:ext]`
**Date:** 2026-02-26 | **Reviewer:** `[CPTO]`
**CPTO Verdict:** A — APPROVED (see `reviews/DR-track-a-session-model-review.md`)

---

## Scope

| ID | Deliverable | Status |
|---|---|---|
| S06-01 | Session model refactor (session = container, recording = opt-in) | Done |
| S06-02 | Snapshot + bug editor combo (Ctrl+Shift+B) | Done |
| S06-03 | SPACE shortcut (toggle recording outside input fields) | Done |
| S06-04 | END SESSION POST to vigil-server with retry + offline queue | Done |

---

## Files Modified

| File | Change |
|---|---|
| `src/shared/types.ts` | Added `VIGILSession`, `VIGILRecording`, `VIGILSnapshot`, `RrwebChunk` interfaces. Added `TOGGLE_RECORDING`, `OPEN_BUG_EDITOR`, `SESSION_SYNCED`, `SESSION_SYNC_FAILED` to `MessageType` enum. |
| `src/shared/utils.ts` | Added `generateVigilSessionId()`, `generateRecordingId()`, `generateSnapshotId()`. |
| `src/background/session-manager.ts` | Added `vigilSessionManager` export with full lifecycle + `postWithRetry` + `loadServerPort` (cached) + `chrome.storage.local` persistence + `restoreVigilState()`. Legacy `sessionManager` untouched. |
| `src/background/service-worker.ts` | Calls `restoreVigilState()` on startup to recover sessions after service worker restart. |
| `src/background/shortcuts.ts` | `open-bug-editor` command now captures screenshot via `captureVisibleTab`, creates `VIGILSnapshot` with `triggeredBy: 'bug-editor'`, sends `OPEN_BUG_EDITOR` message with snapshot data. Falls back to legacy `LOG_BUG` if content script doesn't handle new message. |
| `src/background/message-handler.ts` | Added `TOGGLE_RECORDING` handler — delegates to `vigilSessionManager.toggleRecording()` when vigil session active, falls back to legacy pause/resume. |
| `src/content/content-script.ts` | Added SPACE keydown listener (guards `input`/`textarea`/`select`/`contentEditable`). Added `OPEN_BUG_EDITOR` message handler dispatching `vigil:open-bug-editor` custom event. |
| `src/content/overlay/ControlBar.tsx` | Added `vigil:open-bug-editor` event listener — opens BugEditor with `screenshotId` pre-attached. |
| `manifest.json` | Added `vigil.config.json` to `web_accessible_resources`. |

### Supplementary fixes

| File | Change |
|---|---|
| `tests/unit/background/message-handler.test.ts` | Fixed 4 pre-existing failures: added `chrome.tabs.query`, `chrome.runtime.sendMessage`, `chrome.runtime.getURL` mocks. |
| `tests/unit/server/counter.test.ts` | Removed unused `readFile` import and `currentFeatCount` binding (Track B build blocker). |
| `tests/unit/background/vigil-session-manager.test.ts` | **New file.** 23 unit tests covering full `vigilSessionManager` lifecycle. |

### Post-review fixes (BAD + UGLY)

| File | Change |
|---|---|
| `src/background/session-manager.ts` | **BAD fix:** `loadServerPort()` now caches result in `cachedServerPort` — fetches `vigil.config.json` only once per service worker lifetime. |
| `src/background/session-manager.ts` | **UGLY fix:** Added `persistState()` / `clearPersistedState()` / `restoreVigilState()`. Session state persisted to `chrome.storage.local` on every mutation (create, start/stop recording, add snapshot/bug/feature). Cleared on endSession. Restored on service worker startup. |
| `src/background/service-worker.ts` | Calls `restoreVigilState()` on init. |

---

## GOOD

1. **Migration strategy followed exactly.** `VIGILSession`, `VIGILRecording`, `VIGILSnapshot` added as new interfaces. Legacy `Session` type and `sessionManager` are completely untouched — zero risk to existing E2E tests and Dexie storage.

2. **`vigilSessionManager` is a clean parallel export.** Both managers coexist in the same file. Message handler and shortcuts fall through to legacy behavior when no vigil session is active. Extension works identically to before until a vigil session is explicitly created.

3. **Server URL not hardcoded (D001).** `loadServerPort()` reads `vigil.config.json` via `chrome.runtime.getURL()`, caches after first read, falls back to 7474.

4. **postWithRetry is robust.** 3 attempts, exponential backoff (1s/2s/3s), sets `pendingSync: true` on failure, notifies tab with `SESSION_SYNCED` or `SESSION_SYNC_FAILED`.

5. **SPACE shortcut properly guards input fields.** Checks `input`, `textarea`, `select`, and `isContentEditable` before intercepting.

6. **Full test coverage.** 155/155 tests pass. 23 new tests for `vigilSessionManager`, 4 pre-existing failures fixed.

7. **Session survives service worker restart.** `chrome.storage.local` persistence with restore on startup — no data loss on idle timeout.

---

## BAD — RESOLVED

1. ~~`vigil.config.json` fetched on every `endSession()`.~~ **Fixed:** `cachedServerPort` caches after first read.

---

## UGLY — RESOLVED

1. ~~`VIGILSession` is in-memory only.~~ **Fixed:** `chrome.storage.local` persistence on every mutation + restore on service worker startup. Full Dexie v2 schema migration remains for Sprint 07 (S07-12) but this stopgap eliminates the data loss risk.

---

## Quality Gates

| Gate | Status |
|---|---|
| tsc --noEmit | Pass |
| npm run build | Pass |
| vitest | **155/155 pass (0 failures)** |
| Legacy Session untouched | Confirmed |
| No new dependencies | Confirmed |
| No hardcoded secrets | Confirmed |

---

## Unblocked

- Track B: S06-06 (session receiver) can consume `VIGILSession` type
- QA Phase 1: Q601-Q603 can begin on Track A deliverables
- Track D: ready once Track B MCP tools ship

---

*Report by: [DEV:ext] | 2026-02-26 | Post-review update: BAD + UGLY resolved*

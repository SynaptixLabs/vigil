# BUG-FAT-011 — vigilSessionManager never created on session start (Critical)

## Status: FIXED
## Severity: P1
## Sprint: 06
## Discovered: 2026-02-27 via manual: FAT Round 2 live testing with Founder

## Steps to Reproduce

1. Start a Vigil session via the side panel "New Session" form
2. Press `Ctrl+Shift+S` to capture a screenshot
3. Check service worker console for errors

## Expected

Toast "Screenshot captured" appears. Screenshot stored in vigil session snapshots. End Session POSTs to vigil-server with session data.

## Actual

- `Ctrl+Shift+S` captured to legacy IndexedDB but **no toast** appeared
- `vigilSessionManager.hasActiveSession()` returned **false** — no vigil session existed
- End Session POST had empty snapshots, bugs, features arrays
- The entire Sprint 06 server POST feature was **dead code**

## Root Cause

`CREATE_SESSION` handler in `message-handler.ts` only called `sessionManager.createSession()` (legacy). Nobody ever called `vigilSessionManager.createSession()`. The method existed (line 360 of session-manager.ts) but was never wired into the UI flow.

Additionally:
- `TOGGLE_RECORDING` handler called `vigilSessionManager.toggleRecording()` which sent `notifyTab(START_RECORDING)` with vigil session IDs that the content script rejected (`Invalid session ID format`), causing the ControlBar to flicker on SPACE.

## Fix

**Files changed:**

1. `src/background/message-handler.ts`:
   - `CREATE_SESSION`: Added `vigilSessionManager.createSession(name, project, tabId)` after legacy session creation. Vigil session starts idle (no auto-recording).
   - `TOGGLE_RECORDING`: Removed `vigilSessionManager.toggleRecording()` — always use legacy session for rrweb control. Vigil session is data-only.

2. `src/background/shortcuts.ts`:
   - `toggle-recording`: Removed `vigilSessionManager.toggleRecording()` — same fix as above.
   - `capture-screenshot`: Moved toast outside vigil session guard so toast fires when ANY session is active.

## Regression Test

File: —
Status: Verified via FAT Round 2 (20/20 PASS)

## Resolution

Fixed during FAT Round 2. Vigil session now created alongside legacy session. Recording control is legacy-only. Vigil session is data-only (snapshots, bugs, features, POST).

*Assigned: [DEV:ext]*

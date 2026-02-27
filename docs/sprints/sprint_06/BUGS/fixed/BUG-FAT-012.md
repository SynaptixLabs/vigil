# BUG-FAT-012 — Bugs and features not included in vigil session POST

## Status: FIXED
## Severity: P2
## Sprint: 06
## Discovered: 2026-02-27 via manual: FAT Round 2 data verification

## Steps to Reproduce

1. Start a Vigil session
2. Log a bug via the bug editor (Alt+Shift+B → fill → Submit)
3. End the session (click stop button)
4. Check `.vigil/sessions/vigil-SESSION-*.json` on filesystem

## Expected

Session JSON includes bugs array with the submitted bug.

## Actual

Session JSON has `"bugs": []` — empty. Bug was stored in legacy IndexedDB but never added to `vigilSessionManager.bugs[]`.

## Root Cause

`LOG_BUG` handler in `message-handler.ts` called `addBug(bug)` (legacy IndexedDB via Dexie) but never called `vigilSessionManager.addBug(bug)`. Same gap for `LOG_FEATURE` handler.

Same dual-session-manager integration gap as BUG-FAT-011.

## Fix

**File changed:** `src/background/message-handler.ts`

- `LOG_BUG` handler: Added `vigilSessionManager.addBug(bug)` before legacy `addBug()`
- `LOG_FEATURE` handler: Added `vigilSessionManager.addFeature(feature)` before legacy `addFeature()`

## Regression Test

File: —
Status: Verified via FAT Round 2 data inspection

## Resolution

Fixed during FAT Round 2. Bugs and features now stored in both legacy IndexedDB and vigil session. POST to server includes all data.

*Assigned: [DEV:ext]*

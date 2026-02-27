# BUG-FAT-008 — Stop button label says "Stop recording" instead of "End Session"

## Status: FIXED
## Severity: P3
## Sprint: 06
## Discovered: 2026-02-26 via manual: Founder Acceptance Testing Round 1

## Steps to Reproduce

1. Start a Vigil session on any target page
2. Look at the ControlBar floating overlay
3. Hover over the ⏹ stop button

## Expected

Tooltip says "End Session". `aria-label` says "End Session".

## Actual

Tooltip says "Stop recording". `aria-label` says "Stop recording".

## Root Cause

The button labels were not updated when the session model changed from "recording-centric" to "session-centric" in Sprint 06.

## Fix

In `src/content/overlay/ControlBar.tsx`, stop button:
- `title="Stop recording"` → `title="End Session"`
- `aria-label="Stop recording"` → `aria-label="End Session"`

## Regression Test

File: tests/e2e/regression/BUG-FAT-008.spec.ts
Status: ⬜

## Assigned To

[DEV:ext]

## Resolution

Fixed in FAT Round 2. Changed `title` and `aria-label` from "Stop recording" to "End Session" in `ControlBar.tsx`. QA verified 20/20 FAT pass.

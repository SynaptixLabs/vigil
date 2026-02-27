# BUG-FAT-009 — Standalone new-session.tsx still says "Start Recording"

## Status: FIXED
## Severity: P3
## Sprint: 06
## Discovered: 2026-02-27 via code review: CPTO audit of FAT Round 1 fixes

## Steps to Reproduce

1. Open the standalone new session tab (if accessible from the extension)
2. Observe the page title, header, and submit button text

## Expected

- Page title: "Vigil — New Session"
- Header: "New Session"
- Submit button: "▶ Start Session"

## Actual

- Page title: "Refine — New Recording Session"
- Header: "New Recording Session"
- Submit button: "▶ Start Recording"

## Root Cause

BUG-FAT-005 fix only updated `src/popup/pages/NewSession.tsx` (side panel version). The standalone tab version at `src/new-session/new-session.tsx` was missed — it has duplicate labels at:
- Line 6: `<title>Refine — New Recording Session</title>`
- Line 159: `'New Recording Session'`
- Line 298: `'▶ Start Recording'`

## Fix

In `src/new-session/new-session.tsx`:
- Line 6: → `<title>Vigil — New Session</title>`
- Line 159: → `'New Session'`
- Line 298: → `'▶ Start Session'`

Also: `src/new-session/new-session.html` line 6: → `<title>Vigil — New Session</title>`

## Regression Test

File: tests/e2e/regression/BUG-FAT-009.spec.ts
Status: ⬜

## Assigned To

[DEV:ext]

## Resolution

Fixed in FAT Round 2. Updated labels in `new-session.tsx` ("New Session", "▶ Start Session") and `new-session.html` title. QA verified 20/20 FAT pass.

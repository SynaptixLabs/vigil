# BUG-031 — Projects not displayed in extension popup

## Status: OPEN
## Severity: P1
## Sprint: 08
## Discovered: 2026-03-22 via manual FAT on Papyrus app (PPTX: Bugs-22032026-1.pptx, Slide 1)
## Assigned: [DEV:ext]

## Steps to Reproduce

1. Have vigil-server running with at least one project created
2. Open a web app (e.g., Papyrus at localhost:3000)
3. Click the Vigil extension icon to open the popup
4. Look at the project list / "All Projects" filter

## Expected

- Projects created on the server are listed in the popup project selector
- User can filter sessions by project or select a project for a new session

## Actual

- Popup shows "No sessions yet" with no projects listed
- The "All Projects" filter has no individual projects to select
- Projects that exist on the server are not fetched or displayed

## Screenshot

See `test-results/Bugs-22032026-1.pptx` Slide 1 — Vigil popup open on Papyrus login page, right panel shows empty state.

## Root Cause Analysis

The `SessionList.tsx` project filter derived its project list from **existing sessions in Dexie** (`sessions.map(s => s.project)`), NOT from the server. If there were no sessions, the filter was empty — even if projects existed on the server.

The `NewSession.tsx` form fetched projects correctly from the server via `GET_PROJECTS`, but the main session list view never did.

## Fix

Added server-side project fetching to `SessionList.tsx`:
1. Added `GET_PROJECTS` fetch on mount (same pattern as `NewSession.tsx`)
2. Merged server projects with session-derived projects for the filter dropdown
3. Display project names (from server) instead of raw IDs

## Regression Test
File: tests/e2e/regression/BUG-031.spec.ts
Status: ⬜

## Fix
`src/popup/pages/SessionList.tsx` — added `serverProjects` state, `GET_PROJECTS` fetch on mount, merged with session-derived projects for filter dropdown, display project names.

## Resolution
Fixed — 2026-03-22. Awaiting FAT re-test.

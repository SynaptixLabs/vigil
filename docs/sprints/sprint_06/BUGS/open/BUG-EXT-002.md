# BUG-EXT-002 — btn-publish testid missing from SessionDetail

## Status: OPEN
## Severity: P3
## Type: bug
## Sprint: 06
## Discovered: 2026-02-26 via vigil-qa-regression-gate
## Assigned: [DEV:ext]

## Steps to Reproduce
1. Set `refineOutputPath` in `chrome.storage.local` before creating session
2. Create a session with a project name
3. Record interactions on target app, stop session
4. Open SessionDetail in popup
5. Look for "Publish" button

## Expected
A button with `data-testid="btn-publish"` should be visible in SessionDetail when the session has an `outputPath` set.

## Actual
No `btn-publish` element exists anywhere in SessionDetail. The `outputPath` is displayed as informational text only (`SessionDetail.tsx:207-208`). Grep of entire `src/` directory returns zero matches for `btn-publish`.

## Screenshot / Recording
N/A — reproducible via E2E test `project-association.spec.ts:117`

## Root Cause
The publish button was specified in the QA test contract (Q505) but never implemented by DEV:ext. This is a spec-first gap — the test was written before the feature.

## Regression Test
File: `tests/e2e/project-association.spec.ts:117`
Status: ⬜ SKIPPED (test.skip per CPTO D2)

## Fix
Commit: —
Files changed: —

## Resolution
Deferred to Sprint 07 per CPTO decision D2 (2026-02-26). Spec-first gap — feature was never in Sprint 06 scope.

## Test Decision
[x] Keep regression test (permanent guard) — unskip when feature lands

# BUG-EXT-001 — Playwright codegen generates invalid TypeScript

## Status: OPEN
## Severity: P2
## Type: bug
## Sprint: 06
## Discovered: 2026-02-26 via vigil-qa-regression-gate
## Assigned: [DEV:ext]

## Steps to Reproduce
1. Create a session via popup
2. Navigate to target app, interact with form fields (fill inputs, click buttons)
3. Stop session, open SessionDetail
4. Click "Export Playwright Spec" button
5. Save the exported `.spec.ts` file
6. Run `tsc --noEmit --skipLibCheck --target ES2020 --moduleResolution node <exported-file>.ts`

## Expected
Exported `.spec.ts` compiles without TypeScript errors.

## Actual
`tsc` fails with type errors. The generated code at `playwright-codegen.ts:110` produces `await expect(page).toHaveURL(/<regex>/)` assertions that cause TypeScript compilation failures.

## Screenshot / Recording
N/A — reproducible via E2E test `playwright-export.spec.ts:85`

## Root Cause
`actionToPlaywright()` in `src/core/playwright-codegen.ts:110` generates:
```typescript
await expect(page).toHaveURL(/http:\/\/localhost:38470\/about/)
```
Without semicolons and with regex literals that TypeScript cannot resolve in context.

## Regression Test
File: `tests/e2e/playwright-export.spec.ts:85`
Status: ⬜ SKIPPED (test.skip per CPTO D1)

## Fix
Commit: —
Files changed: —

## Resolution
Deferred to Sprint 07 per CPTO decision D1 (2026-02-26). Convenience feature, not core flow.

## Test Decision
[x] Keep regression test (permanent guard) — unskip when fix lands

# QA gate checklist

## Verify inputs
- Assigned TODO / scope
- Acceptance criteria
- Changed files / diff
- Existing reports or bug tickets

## Validate dev work
- Required tests exist
- Tests target the claimed behavior
- Regression coverage exists for bug fixes (tests/e2e/regression/BUG-XXX.spec.ts)

## Run QA stack
- `npx tsc --noEmit` — zero TS errors
- `npx vitest run` — unit/integration tests
- `npm run build` — extension builds clean
- `npm run build:server` — server builds clean
- `npx playwright test` — E2E tests (requires built dist/)
- `GET http://localhost:7474/health` — server health check
- Extension loads in Chrome without errors
- Smoke the critical user flow

## Vigil-specific
- Shadow DOM encapsulation verified (no CSS leakage)
- Session POST to localhost:7474/api/session works
- Bug/feature data persists to .vigil/ filesystem
- No MV3 violations in manifest

## Report
- PASS or FAIL at the top
- Per-layer status
- Every failure with repro + file/path evidence
- Clear re-test instructions

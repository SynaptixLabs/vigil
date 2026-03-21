# Track E — QA Integration Tests

**Sprint:** 08 | **Owner:** QA | **Priority:** P2 | **Vibes:** ~2V
**Branch:** `sprint-08/agents-integration`
**Depends on:** Track B (B01 must ship first)

---

## Mission

Validate the full round-trip: extension → vigil-server → AGENTS platform → response. Ensure graceful degradation when AGENTS is offline. Verify vigil_agent safety gates.

---

## TODO

| ID | Task | AC | Vibes | Status |
|----|------|----|-------|--------|
| E01 | Integration test: ext → server → AGENTS round-trip | Playwright test: create bug in extension → verify suggest endpoint called → verify response displayed. **Both live and mock modes tested.** | 1V | [ ] Dev [ ] QA [ ] GBU |
| E02 | Graceful degradation test: AGENTS offline | Stop AGENTS server → create bug → verify extension works normally (no error, no crash). Suggest endpoint returns mock. **D006 compliance.** | 0.5V | [ ] Dev [ ] QA [ ] GBU |
| E03 | vigil_agent safety gate validation | Run agent in dry-run → verify no files changed. Run agent with `maxIterations: 1` → verify stops after 1 cycle. Verify branch-only commit (never main). **D013 compliance.** | 0.5V | [ ] Dev [ ] QA [ ] GBU |

### E01 Details
- Test in `tests/integration/agents-roundtrip.test.ts`
- Requires: vigil-server running (port 7474), AGENTS running (port 8000)
- Steps:
  1. POST bug data to vigil-server suggest endpoint
  2. Verify response contains suggestions
  3. Verify response is valid JSON with expected schema
  4. Test with `VIGIL_LLM_MODE=mock` → verify mock response
  5. Test with `VIGIL_LLM_MODE=live` → verify real AGENTS response

### E02 Details
- Test in `tests/integration/graceful-degradation.test.ts`
- Steps:
  1. Start vigil-server with `VIGIL_LLM_MODE=live`
  2. Do NOT start AGENTS server
  3. POST to suggest endpoint → verify 200 with fallback response
  4. POST session with bugs → verify session accepted (similarity check skipped)

### E03 Details
- Test in `tests/integration/agent-safety.test.ts`
- Verify dry-run: run agent command with `--dry-run` → check no git commits, no file changes
- Verify iteration limit: set `maxIterations: 1` → verify agent stops
- Verify branch safety: check agent never commits to `main` branch

## Regression Gate

```bash
npx vitest run                     # All unit tests pass
npx playwright test                # All E2E tests pass
npx tsc --noEmit                   # TypeScript clean
```

## Commands

```bash
# Run integration tests
npx vitest run tests/integration/

# Run with both services up
npm run dev:server &               # Port 7474
cd ../nightingale && python -m uvicorn main:app --port 8000 &
npx vitest run tests/integration/agents-roundtrip.test.ts
```

---

*Track E | Sprint 08 | Owner: [QA] | Blocked by Track B*

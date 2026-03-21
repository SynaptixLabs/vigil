# Track B — Server Integration (Live LLM Mode)

**Sprint:** 08 | **Owner:** DEV:server | **Priority:** P1 | **Vibes:** ~7V
**Branch:** `sprint-08/agents-integration`
**Depends on:** Track A (A01 must ship first)

---

## Mission

Flip vigil-server from mock LLM mode to live AGENTS integration. Wire the suggest route, implement returning bug detection (semantic similarity), and add severity auto-suggest with confidence scores.

---

## TODO

| ID | Task | AC | Vibes | Status |
|----|------|----|-------|--------|
| B01 | Flip `VIGIL_LLM_MODE=live`, wire vigil-server → AGENTS API | `POST /api/vigil/suggest` proxies to AGENTS `POST /api/v1/vigil/suggest`. **Mock mode still works when AGENTS offline (D006).** Env var `VIGIL_LLM_MODE` controls behavior. | 2V | [ ] Dev [ ] QA [ ] GBU |
| B02 | Returning bug detection: semantic similarity on new bug receipt | On `POST /api/session` with bugs, check similarity against existing bugs via AGENTS. If similarity > threshold → flag as potential duplicate. **Graceful degradation: if AGENTS offline, skip similarity check.** | 3V | [ ] Dev [ ] QA [ ] GBU |
| B03 | Severity auto-suggest (confidence score shown, user overrides) | `POST /api/vigil/suggest` returns `{ severity, confidence }`. Dashboard shows suggestion with confidence %. User can override. **Stretch goal.** | 2V | [ ] Dev [ ] QA [ ] GBU |

### B01 Details
- Config: `VIGIL_LLM_MODE` env var (`mock` | `live`)
- When `live`: proxy requests to AGENTS at `http://localhost:8000` (or `VIGIL_AGENTS_URL` env var)
- When `mock`: return canned responses (existing behavior)
- Must add timeout (5s) and circuit breaker for AGENTS calls
- Graceful fallback: if AGENTS unreachable, log warning and return mock response

### B02 Details
- On receiving a new bug via `POST /api/session`:
  1. Extract bug title + description
  2. Call AGENTS similarity endpoint
  3. If confidence > 0.8 → attach `potentialDuplicate: BUG-XXX` to response
  4. Store similarity metadata in bug file
- Must not block session acceptance — run similarity async

### B03 Details
- Stretch goal (P2)
- Adds `suggestedSeverity` and `severityConfidence` fields to suggest response
- Dashboard renders as badge with confidence percentage
- User click overrides and persists their choice

## Dependency Map

```
Track A (A01) ──→ B01 (live mode) ──→ B02 (similarity)
                                  ──→ B03 (severity, stretch)
                                  ──→ Track C (extension UI)
                                  ──→ Track D (vigil_agent)
```

## Regression Gate

```bash
# vigil-server must pass all existing tests after changes
npx vitest run
npx tsc --noEmit
npm run build:server

# Health check still works
curl http://localhost:7474/health  # Must return { status: "ok" }

# Mock mode still works (D006)
VIGIL_LLM_MODE=mock npm run dev:server
# → suggest route returns mock response without AGENTS running
```

## Commands

```bash
npm run dev:server                 # Port 7474
npx vitest run                     # Unit + integration
curl http://localhost:7474/health  # Health check
```

---

*Track B | Sprint 08 | Owner: [DEV:server] | Blocked by Track A*

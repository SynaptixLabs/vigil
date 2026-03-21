# Track A — AGENTS Platform Endpoint + Prompts

**Sprint:** 08 | **Owner:** DEV:ai | **Priority:** P0 | **Vibes:** ~9V
**Branch:** `sprint-08/agents-integration`
**Repo:** nightingale (AGENTS project)

---

## Mission

Ship the `/api/v1/vigil/suggest` endpoint on AGENTS platform and the prompt templates that power bug auto-complete + similarity detection. This is the critical path — everything else in Sprint 08 depends on this track.

---

## TODO

| ID | Task | AC | Vibes | Status |
|----|------|----|-------|--------|
| A01 | Add `/api/v1/vigil/suggest` endpoint to AGENTS | Accepts `{ bugTitle, bugDescription, context }`. Returns `{ suggestions, severity, confidence }`. Health check at `/api/v1/vigil/health`. **Groq `llama-3.3-70b-versatile` as default model (D017).** | 4V | [ ] Dev [ ] QA [ ] GBU |
| A02 | `llm_core` prompt templates for bug auto-complete + similarity | Templates for: title completion, steps-to-reproduce generation, severity classification, duplicate detection. **Structured output (JSON).** | 3V | [ ] Dev [ ] QA [ ] GBU |
| A03 | `resource_manager` Vigil usage tracking | Track tokens consumed per Vigil session. Expose usage via `/api/v1/vigil/usage`. | 2V | [ ] Dev [ ] QA [ ] GBU |

### A01 Details
- Endpoint lives in AGENTS project (nightingale repo)
- Must validate request body with Pydantic
- Must return structured JSON — Vigil server parses this
- Must gracefully handle Groq rate limits (429 → retry with backoff)
- Must respect `resource_manager` token budget

### A02 Details
- Prompt templates in `nightingale/llm_core/prompts/vigil/`
- Bug auto-complete: given partial title → suggest full title + steps
- Similarity: given bug description → return similarity scores against existing bugs
- Severity classification: given bug details → P0/P1/P2/P3 with confidence

### A03 Details
- Stretch goal (P2)
- Token accounting per Vigil project
- Usage endpoint returns `{ tokensUsed, tokensRemaining, period }`

## Dependency Map

```
A01 (endpoint) ──→ A02 (prompts) ──→ Track B (server integration)
                                  ──→ Track D (vigil_agent)
A03 (usage tracking) ── independent, stretch
```

## Regression Gate

```bash
# In nightingale repo:
pytest tests/ -v                  # All AGENTS tests must pass
curl http://localhost:8000/health  # AGENTS health check
curl -X POST http://localhost:8000/api/v1/vigil/suggest \
  -H "Content-Type: application/json" \
  -d '{"bugTitle":"test","bugDescription":"test","context":{}}' # Must return 200
```

## Commands

```bash
# AGENTS project (nightingale repo)
cd ../nightingale
python -m uvicorn main:app --port 8000 --reload
pytest tests/ -v
```

---

*Track A | Sprint 08 | Owner: [DEV:ai] | Critical path*

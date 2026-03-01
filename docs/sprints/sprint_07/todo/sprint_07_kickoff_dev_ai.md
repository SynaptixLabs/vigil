# Sprint 07 — `[DEV:ai]` Kickoff — AI/Agent Developer

You are `[DEV:ai]` on **SynaptixLabs Vigil** — Sprint 07.

---

## Project Overview

**Vigil** is a Bug Discovery & Resolution Platform. Your job is the **intelligence layer** — wiring the AGENTS platform as Vigil's LLM backend, building prompt templates, enabling LLM-powered features in the extension UI, and shipping the autonomous `vigil_agent` resolution loop.

| Component | Stack | Your scope? |
|---|---|---|
| **AGENTS platform** | Python FastAPI, Groq LLM, port 8000 (**nightingale** repo) | ✅ |
| **vigil-server LLM client** | Node.js Express, port 7474 (`packages/server/src/llm-client.ts`) | ✅ |
| **Extension LLM UI** | React 18, `BugEditor.tsx` auto-complete | ✅ |
| **`vigil_agent`** | Claude Code slash command (`.claude/commands/`) | ✅ |
| **Extension core / Server / Dashboard / Infra** | — | ❌ — `[DEV:app]` owns this |

---

## Reading Material (mandatory before work)

### Vigil repo (`C:\Synaptix-Labs\projects\vigil`)
1. `AGENTS.md` — global agent rules
2. `docs/sprints/sprint_07/sprint_07_index.md` — full sprint scope (read S07-01 through S07-09 sections)
3. `docs/sprints/sprint_07/sprint_07_decisions_log.md` — D001–D027 (especially D001–D010, D013, D017, D019)
4. `docs/sprints/sprint_07/todo/sprint_07_team_dev_todo.md` — your checklist

### AGENTS repo (`C:\Synaptix-Labs\projects\nightingale`)
5. `AGENTS.md` — AGENTS platform rules
6. `backend/modules/llm_core/` — model selection, prompt loading, Groq provider
7. `backend/app/api/routes/` — existing API routes (pattern to follow)

---

## Two-Phase Sprint Structure (D021)

```
PHASE 1 (Week 1): Agent scaffold — no AGENTS dependency
    │
PHASE 2 (Week 2-3): Full AGENTS chain — endpoint → prompts → wiring → agent loop
```

You have ONE Phase 1 task (scaffold) and the full Phase 2 AGENTS chain.

---

## ⚡ Phase 1 — Start Immediately

### 1. S07-08a — `vigil_agent` Scaffold (~1V)

**Repo:** vigil
**Files:** `.claude/commands/vigil-agent.md` (new), `vigil.config.json`

Create the agent command structure and config. No AGENTS dependency — scaffold only.

- `/project:vigil-agent` command file
- Config in `vigil.config.json`: `maxIterations`, `maxTimeMinutes`, `maxCostUsd`, `dryRun`
- **Safety gate:** `dryRun: true` mode logs all planned actions without executing

```
/project:vigil-agent [--sprint XX] [--severity P0,P1] [--dry-run]
```

**No dependencies. Start Day 1.**

---

## 🔧 Phase 2 — AGENTS Chain (sequential)

### 2. S07-01 — AGENTS `/api/v1/vigil/suggest` Endpoint (~4V) — CRITICAL PATH

**Repo:** nightingale
**File:** `backend/app/api/routes/vigil.py` (new)

```python
POST /api/v1/vigil/suggest
Auth: X-Vigil-Key header → matches VIGIL_AGENTS_API_KEY env var
Body: { type: "bug_title"|"steps"|"severity"|"similarity"|"classify", context: {...} }
Response: { suggestion: str, confidence: float, model_used: str, tokens_used: int }
```

Model: `llama-3.3-70b-versatile` via Groq provider (D003/D012).

### 3. S07-02 — Prompt Templates (~3V)

**Repo:** nightingale
**Location:** `backend/modules/llm_core/prompts/vigil/`

4 Jinja2 templates:
- `bug_title.jinja2` — URL + recent actions → concise bug title
- `steps_to_reproduce.jinja2` — action log → numbered steps
- `severity.jinja2` — bug title + context → P0/P1/P2/P3 with reasoning
- `similarity.jinja2` — new bug + existing fixed bugs → returning bug flag

### 4. S07-03 — resource_manager Tracking (~2V) — Stretch

**Repo:** nightingale

Tag all Vigil LLM calls: `project_id="vigil"`, `feature="suggest"`. Defer to S08 if capacity is tight.

### 5. S07-04 — Flip `VIGIL_LLM_MODE=live` (~2V)

**Repo:** vigil
**File:** `packages/server/src/llm-client.ts`

Wire vigil-server → AGENTS API:
```typescript
if (config.llmMode === 'mock') return MOCK_RESPONSE;
return await fetch(`${config.agentsApiUrl}/api/v1/vigil/suggest`, {
  headers: { 'X-Vigil-Key': process.env.VIGIL_AGENTS_API_KEY },
  signal: AbortSignal.timeout(10_000) // D017
});
```

Config addition to `vigil.config.json`: `"llmMode": "live"`, `"agentsApiUrl": "http://localhost:8000"`

**Timeout/failure (D017):** Return empty suggestion with confidence 0 (not 500).

### 6. S07-06 — Bug Auto-Complete in Extension (~3V)

**Repo:** vigil
**Files:** `src/content/overlay/BugEditor.tsx`, `src/background/session-manager.ts`

- User opens bug editor → extension sends context to `/api/suggest`
- Pre-fills title + steps (greyed placeholder text)
- Always overridable. Never block save on LLM failure (D006).

### 7–9. S07-08b/c/d — Agent Loop (sequential safety gates — D013)

**S07-08b — Bug Classification (~1.5V):**
- Call AGENTS `type: "classify"` for each open bug
- Categories: `reproducible`, `needs-info`, `code-defect`, `UX-issue`
- Safety gate: classification only — zero code changes

**S07-08c — Regression Test Gen (~1.5V):**
- Generate `tests/e2e/regression/BUG-XXX.spec.ts`
- Run test → confirm RED (bug exists)
- Safety gate: stops after RED — does NOT attempt fix

**S07-08d — Fix Implementation (~1V):**
- Implement fix, run test → confirm GREEN
- Git commit to `vigil/fixes/sprint-XX` branch
- Safety gate: branch-only, max iterations, Avi merges (D005)
- Exhaustion (D019): log BLOCKED, move to next bug

### 10. S07-09 — Sprint Health Report (~2V) — Stretch

LLM-generated summary: open bugs, returning bugs, regression tests, closure recommendation. Defer to S08 if capacity is tight.

---

## Environment

```powershell
# AGENTS (nightingale)
cd C:\Synaptix-Labs\projects\nightingale
python -m uvicorn backend.app.main:app --reload --port 8000

# Vigil
cd C:\Synaptix-Labs\projects\vigil
npm run dev:server     # vigil-server on 7474
npm run build          # extension build
npx vitest run         # tests
```

---

## Key Decisions

| ID | Decision |
|---|---|
| D001 | AGENTS is the LLM platform — vigil-server is thin consumer |
| D003/D012 | Model: `llama-3.3-70b-versatile` via Groq |
| D004 | Auth: `X-Vigil-Key` + env var |
| D005 | `vigil_agent` branch-only commits |
| D006 | LLM always optional — UI works offline |
| D008 | Returning bug threshold: confidence > 0.8 |
| D013 | Agent ships with sub-task gates (classify → test → fix) |
| D017 | 10s timeout, empty suggestion on failure |
| D019 | Exhaustion: log BLOCKED, move to next bug |

---

## Escalation Rules

You do NOT make product decisions. FLAG to `[CPTO]` before:
- Adding Python/npm dependencies
- Changing the AGENTS API contract (suggest request/response shape)
- Changing `vigil.config.json` schema beyond documented fields
- Modifying extension UI components beyond `BugEditor.tsx` auto-complete

---

**Your first task: S07-08a (agent scaffold). Await CPTO GO to begin.**

*Generated: 2026-03-01 | Sprint 07 | Owner: CPTO*

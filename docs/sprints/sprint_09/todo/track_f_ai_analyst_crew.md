# Track F — AI Analyst Crew

**Sprint:** 09 | **Owner:** `[DEV:ai]` + AGENTS platform | **Priority:** P1 | **Vibes:** ~15V
**Branch:** `sprint-09/analyst-crew`
**Team:** AI Team
**Depends on:** Track B (auth for plan-gating), Track C (SXC for consumption)
**Release gate:** Behind feature flag / beta gate (D038)

---

## Instructions — READ BEFORE STARTING

| Role | Checkbox | Report file |
|------|----------|-------------|
| DEV | `[x] Dev` | `reports/DEV_F_{task_id}_{YYYY-MM-DD}.md` |
| QA | `[x] QA` | `reports/QA_F_{task_id}_{YYYY-MM-DD}.md` |
| GBU | `[x] GBU` | `reports/DR_F_{task_id}_{YYYY-MM-DD}.md` |

**DONE = all 3 checked + all 3 reports exist.**

---

## Mission

Implement the vigil-analyst crew: 7-agent DAG pipeline that analyzes recorded sessions, produces detailed reports, derives precise bug/feature tickets, and proactively discovers unreported issues. Background execution with dashboard notifications and chat interface (Mode 2).

**AUTHORITATIVE SPEC:** `specs/SPRINT_09_SPEC_vigil_analyst_crew.md`
**Async jobs:** `specs/ADR_S09_002_ASYNC_JOBS.md`
**Data governance:** `specs/ADR_S09_003_DATA_GOVERNANCE.md`

**This feature is behind a beta gate (D038). Developed in parallel with auth/billing but released separately.**

---

## TODO

| ID | Task | AC | Vibes | Dev | QA | GBU |
|----|------|----|-------|-----|----|-----|
| F01 | Jobs table + analysis module scaffold (vigil-server) | analysis_jobs table, analysis_results table, analysis_audit_log table. Module at `modules/analysis/`. | 2V | [ ] | [ ] | [ ] |
| F02 | Job queue API (vigil-server) | POST /api/analysis/queue (plan-gated from DB). GET /api/analysis/jobs/:id/status. Internal worker endpoint for Vercel Cron. | 2V | [ ] | [ ] | [ ] |
| F03 | Ingestor agent (AGENTS platform) | Deterministic session parser. Produces AnalysisContext artifact. Ingest Verify gate. | 1.5V | [ ] | [ ] | [ ] |
| F04 | Visual Analyst + Behavioral Analyst (AGENTS platform) | Visual: Gemini 2.5 Pro, screenshot analysis → VisualFindings. Behavioral: Auto-routed, timeline analysis → BehavioralFindings. Parallel execution. | 3V | [ ] | [ ] | [ ] |
| F05 | Composer + Ticket Deriver (AGENTS platform) | Composer: synthesize → AnalysisReport. Deriver: precise bug/feature tickets with raw data + AI analysis → DerivedTickets. | 2.5V | [ ] | [ ] | [ ] |
| F06 | Proactive Scout + Quality Judge (AGENTS platform) | Scout (Opus 4, Mode 2 only): find unreported issues → ProactiveSuggestions. Judge: 5-dimension scoring → QualityVerdict. | 2V | [ ] | [ ] | [ ] |
| F07 | Dashboard analysis views | AnalysisStatus badge on session cards. AnalysisReport viewer. ProactiveSuggestions (accept/reject/edit). AnalysisChat (Mode 2). | 2V | [ ] | [ ] | [ ] |

---

### F01 Details

**Task:** Create database tables and server-side analysis module
**Files:** `packages/server/src/modules/analysis/`, `shared/db/migrations/011_analysis.ts`
**AC:**
- [ ] analysis_jobs table per ADR S09-002 schema (id, session_id, user_id, mode, status, progress, phase, etc.)
- [ ] analysis_results table: id, job_id, session_id, report (JSONB), derived_tickets (JSONB), proactive_suggestions (JSONB), created_at
- [ ] analysis_audit_log table per ADR S09-003
- [ ] analysis_chat table: id, job_id, user_id, role ('user'|'assistant'), content, created_at
- [ ] Module scaffold: README.md, index.ts, analysis.routes.ts, analysis.service.ts, analysis.schemas.ts

### F02 Details

**Task:** Job queue API with Vercel Cron worker
**Files:** `packages/server/src/modules/analysis/analysis.routes.ts`, `analysis.service.ts`
**AC:**
- [ ] POST /api/analysis/queue `{ sessionId, mode }` (authenticated, plan-gated: Pro+ from DB not JWT)
- [ ] Checks SXC budget before queuing (mode 0: 10 SXC, mode 1: 25 SXC, mode 2: 40 SXC)
- [ ] INSERT INTO analysis_jobs → return `{ jobId, status: 'queued' }`
- [ ] Prevents duplicate: no two active jobs for same session
- [ ] GET /api/analysis/jobs/:id/status → `{ status, progress, phase }`
- [ ] GET /api/analysis/jobs/:id/result → full results (when complete)
- [ ] POST /api/internal/jobs/process (Vercel Cron, secured by VIGIL_INTERNAL_SECRET)
- [ ] PATCH /api/internal/jobs/:id/progress (AGENTS callback)
- [ ] PATCH /api/internal/jobs/:id/complete (AGENTS callback)
- [ ] vercel.json cron config added

### F03 Details

**Task:** Deterministic session ingestor (runs on AGENTS platform)
**Files:** AGENTS repo: `backend/modules/vigil_crew/src/agents/ingestor.py`
**AC:**
- [ ] Parses raw session JSON from vigil-server GET /api/sessions/:id
- [ ] Extracts: timeline events, screenshot refs (URLs, no base64), user bugs, user features, annotations, recording segment refs
- [ ] Normalizes timeline to ordered events with timestamps
- [ ] Produces AnalysisContext artifact (typed, with provenance base)
- [ ] Ingest Verify Gate: >0 events, >0 pages, valid structure
- [ ] No LLM calls — pure code (model="code")

### F04 Details

**Task:** Visual and Behavioral analyst agents
**Files:** AGENTS repo: `backend/modules/vigil_crew/src/agents/visual_analyst.py`, `behavioral_analyst.py`
**AC:**
- [ ] **Visual Analyst** (Gemini 2.5 Pro): receives sanitized screenshots (ADR S09-003), analyzes for layout breaks, responsive issues, accessibility problems, visual regressions, style inconsistencies. Produces VisualFindings artifact.
- [ ] **Behavioral Analyst** (Auto via model_router): receives timeline, analyzes for rage clicks (3+ clicks/1s), dead clicks (no DOM mutation in 500ms), confusion loops, error sequences, slow interactions, abandoned flows. Produces BehavioralFindings artifact.
- [ ] Both run in PARALLEL (Promise.all or crew_core parallel step)
- [ ] Findings Verify Gate: every finding has evidence, severity, confidence
- [ ] Screenshot sanitization per ADR S09-003 pipeline (before sending to visual analyst)

### F05 Details

**Task:** Report composer and ticket deriver agents
**Files:** AGENTS repo: `backend/modules/vigil_crew/src/agents/composer.py`, `ticket_deriver.py`
**AC:**
- [ ] **Composer** (Sonnet 4, 0.3): merges VisualFindings + BehavioralFindings → unified AnalysisReport with executive summary, quality score, sections, recommendations. Never invents findings.
- [ ] **Ticket Deriver** (Sonnet 4, 0.1): creates precise bug/feature tickets. Each bug: title, severity + justification, description, steps to reproduce, expected/actual, affected component, affected URL, user raw data, AI analysis, evidence (screenshot IDs + timeline range + finding IDs), source (user_reported | ai_derived), confidence.
- [ ] Report Verify Gate: references all findings, summary exists
- [ ] Ticket Verify Gate: every ticket has title, severity, steps, evidence, AI analysis

### F06 Details

**Task:** Proactive scout and quality judge
**Files:** AGENTS repo: `backend/modules/vigil_crew/src/agents/proactive_scout.py`, `judge.py`
**AC:**
- [ ] **Proactive Scout** (Opus 4, 0.3): Mode 2 ONLY. Reviews full session for unreported issues. Produces ProactiveSuggestions with confidence scores. `consentRequired: true` ALWAYS.
- [ ] **Quality Judge** (Sonnet 4, 0.0): scores completeness, accuracy, actionability, verbosity, proactive value — each /10. Total /50. Verdict: SHIP (>=35) / ITERATE (25-34, max 2 loops) / RESTART (<25, return partial).
- [ ] Safety guards per crew spec §7: budget ceiling, iteration cap, no auto-create, loop detection
- [ ] On SHIP: persist results to vigil-server via callback

### F07 Details

**Task:** Dashboard analysis views
**Files:** `packages/dashboard/src/modules/analysis/` (full structure)
**AC:**
- [ ] **AnalysisStatus badge**: on session cards, shows queued/running/complete/failed
- [ ] **AnalysisReport viewer**: executive summary, quality score, findings by section, derived tickets
- [ ] **ProactiveSuggestions panel**: each suggestion with Accept / Reject / Edit buttons. Accept → creates bug/feature via API. Edit → opens pre-filled editor.
- [ ] **AnalysisChat** (Mode 2, Team+ only): message input, conversation history, scoped to analysis context. Max 2000 chars/message. "Create Bug from Chat" button for provenance-preserving ticket creation.
- [ ] Feature flag check: if not enabled, show "AI Analysis coming soon" placeholder
- [ ] All plan checks from API (not JWT)

---

## Dependency Map

```
Track B (auth) + Track C (billing) ──→ F01 (schema) ──→ F02 (job queue API)
                                                     ──→ F07 (dashboard views)

F02 ready ──→ F03 (ingestor, AGENTS) ──→ F04 (visual + behavioral, parallel)
                                     ──→ F05 (composer + deriver)
                                     ──→ F06 (scout + judge)

F03-F06 are AGENTS platform work. F01-F02, F07 are vigil repo work.
Two repos, parallel teams, API contract is the boundary.
```

---

## Regression Gate

```bash
# vigil repo
npx tsc --noEmit
npx vitest run modules/analysis/
npm run build:server
curl http://localhost:7474/health

# AGENTS repo
pytest tests/ -v
curl http://localhost:8000/health

# Integration: queue job → verify status polling → verify result delivery
```

---

*Track F | Sprint 09 | Owner: [DEV:ai] + AGENTS | AI Team | BETA GATE (D038)*

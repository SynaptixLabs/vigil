# ADR S09-002 — Async Job Architecture

**Status:** APPROVED | **Date:** 2026-03-23 | **Author:** CPTO | **Trigger:** External DR finding U1

---

## Context

External review identified that the analyst crew pipeline says "queue analysis job" without defining the actual job system. On Vercel + Neon, "a queue" is infrastructure, not a metaphor. We need a concrete, implementable job execution architecture that works within our current deployment reality.

## Decision

**Postgres-backed jobs table + idempotent worker + polling status API.**

No new infrastructure. No Redis. No SQS. No Bull/BullMQ. The job system lives in the same Neon database we already have.

### Jobs Table (single source of truth)

```sql
CREATE TABLE analysis_jobs (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      TEXT NOT NULL REFERENCES sessions(id),
  user_id         TEXT NOT NULL REFERENCES users(id),
  mode            INT NOT NULL DEFAULT 1,          -- 0=quick, 1=standard, 2=deep
  status          TEXT NOT NULL DEFAULT 'queued',   -- queued | running | complete | failed | cancelled
  progress        INT DEFAULT 0,                    -- 0-100
  phase           TEXT,                             -- current pipeline phase name
  result_id       TEXT,                             -- FK to analysis_results when complete
  error_message   TEXT,                             -- if failed
  attempts        INT DEFAULT 0,                    -- retry count
  max_attempts    INT DEFAULT 3,
  sxc_consumed    INT DEFAULT 0,                    -- actual SXC used
  sxc_budget      INT NOT NULL,                     -- max SXC for this mode
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_status ON analysis_jobs(status) WHERE status IN ('queued', 'running');
CREATE INDEX idx_jobs_user ON analysis_jobs(user_id);
```

### Execution Flow

```
1. User ends session → vigil-server checks plan (DB, not JWT)
   → IF plan >= 'pro':
     INSERT INTO analysis_jobs (session_id, user_id, mode, sxc_budget)
     → Return { jobId, status: 'queued' }

2. Worker picks up job:
   → vigil-server has a /api/internal/jobs/process endpoint
   → Called by: Vercel Cron (every 30s) OR manual trigger
   → SELECT ... FROM analysis_jobs WHERE status = 'queued' ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED
   → UPDATE status = 'running', started_at = NOW()

3. Worker calls AGENTS platform:
   → POST {AGENTS_URL}/api/v1/vigil/analyze { sessionId, mode, jobId }
   → AGENTS runs the vigil-analyst crew pipeline
   → AGENTS calls back: PATCH /api/internal/jobs/:id/progress { phase, progress }
   → On completion: PATCH /api/internal/jobs/:id/complete { resultId, sxcConsumed }

4. Dashboard polls:
   → GET /api/analysis/jobs/:id/status
   → Returns { status, progress, phase }
   → When complete: GET /api/analysis/jobs/:id/result
```

### Idempotency Rules

- A job can only transition: `queued → running → complete|failed`
- If a running job has no heartbeat for 5 minutes → mark as `failed`, eligible for retry
- `attempts < max_attempts` → re-queue on failure
- Same session cannot have two `queued` or `running` jobs simultaneously (unique constraint on active jobs)

### Why Postgres, Not a Message Queue

| Consideration | Postgres Jobs | Redis/Bull | SQS |
|--------------|--------------|-----------|-----|
| New infrastructure | No (already have Neon) | Yes (Redis) | Yes (AWS) |
| Vercel compatible | Yes (HTTP + cron) | Needs persistent worker | Needs Lambda |
| Visibility/debugging | SQL queries | Redis CLI | AWS Console |
| Transactional with user data | Yes (same DB) | No (separate system) | No |
| Scale ceiling | ~100 concurrent jobs | ~10K | Unlimited |
| Our actual need (Sprint 09) | <50 concurrent jobs | Overkill | Overkill |

We can graduate to a proper queue (Redis + BullMQ) in Sprint 11+ if job volume exceeds Postgres capacity. The schema is designed so the migration is additive (add a queue in front, keep the jobs table as state store).

### Vercel Cron Configuration

```json
// vercel.json
{
  "crons": [{
    "path": "/api/internal/jobs/process",
    "schedule": "* * * * *"
  }]
}
```

Vercel Cron runs every minute. The endpoint processes one queued job per invocation. For higher throughput, the endpoint can process up to 3 jobs per invocation (within Vercel's 60s function timeout for Pro plan).

### Internal Endpoints (not user-facing)

```
POST /api/internal/jobs/process        ← Vercel Cron calls this
PATCH /api/internal/jobs/:id/progress  ← AGENTS platform calls this
PATCH /api/internal/jobs/:id/complete  ← AGENTS platform calls this
PATCH /api/internal/jobs/:id/fail      ← AGENTS platform calls this
```

All `/api/internal/*` routes are protected by a shared secret (`VIGIL_INTERNAL_SECRET` env var), not user JWT.

## Consequences

- No new infrastructure in Sprint 09
- Job state is queryable, debuggable, and transactional with user data
- AGENTS platform needs callback endpoints (defined in crew spec Track F)
- Dashboard polls job status (no WebSocket needed for V1)
- Scale limit ~100 concurrent — acceptable for launch, graduate to queue later

---

*ADR S09-002 | Async Job Architecture | CPTO | 2026-03-23*

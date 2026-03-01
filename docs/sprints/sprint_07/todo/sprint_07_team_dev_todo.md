# Sprint 07 — Team Deliverable Checklist

**Sprint goal:** Project-oriented sessions + dashboard overhaul → FAT Round 3 gate → AGENTS LLM backend, vigil_agent, Vercel + Neon
**Budget:** ~51V (core P0+P1: ~36V) | **Ports:** 7474 (vigil-server), 8000 (AGENTS) | **LLM:** live (Groq llama-3.3-70b-versatile)

**Team (D027):** `[DEV:app]` (platform) + `[DEV:ai]` (intelligence) + `[QA]`

---

## Completed (Phase 1 — Extension + Carry-Forward)

| Status | ID | Deliverable | Cost | Owner | Done |
|---|---|---|---|---|---|
| [x] | S07-12 | VIGILSession persistence (chrome.storage.local) | ~0V | `[DEV:app]` | 2026-02-28 |
| [x] | S07-16 | Project-oriented session model | ~5V | `[DEV:app]` | 2026-02-28 |
| [x] | S07-18 | Ghost session recovery | ~1V | `[DEV:app]` | 2026-02-28 |
| [x] | S07-19 | Manifest shortcut fix (Ctrl+Shift+B → Alt+Shift+B) | ~0.5V | `[DEV:app]` | 2026-02-28 |
| [x] | S07-20 | BUG-EXT-001 codegen fix | ~1V | `[DEV:app]` | 2026-02-28 |
| [x] | S07-21 | BUG-EXT-002 btn-publish testid | ~1V | `[DEV:app]` | 2026-02-28 |
| [x] | — | E2E regression fix (25→0 failures, D026) | — | `[DEV:app]` | 2026-03-01 |

---

## `[DEV:app]` — Application Developer

> Scope: Extension + Server + Dashboard + Infrastructure. All **Vigil repo** code.

### ⚡ Phase 1 — Remaining (must pass FAT Round 3)

| Status | Order | ID | Deliverable | Cost | Notes |
|---|---|---|---|---|---|
| [x] | 1 | S07-11 | Shared types package (`packages/shared/`) | ~2V | Done (prior session). Zod schemas + `z.infer<>`. |
| [x] | 2 | S07-16b | Session read API (`GET /api/sessions`, `GET /api/sessions/:id`) | ~1.5V | Done 2026-03-01. 8 new tests. D025. |
| [ ] | 3 | S07-17a | Dashboard overhaul Phase A: nav, filters, screenshots | ~3V | Blocked by S07-16b. |
| [ ] | 4 | S07-17b | Dashboard overhaul Phase B: timeline + replay | ~3V | Blocked by S07-17a. |
| [ ] | 5 | S07-13 | Dashboard vitest config + component tests | ~1V | After S07-17a ships. |

**Phase 1 remaining: ~10.5V**

### 🔧 Phase 2 — After FAT Round 3

| Status | Order | ID | Deliverable | Cost | Notes |
|---|---|---|---|---|---|
| [ ] | 6 | S07-15 | Neon PostgreSQL migration | ~4V | Can start parallel Week 2. No AGENTS dep. |
| [ ] | 7 | S07-14 | Vercel deployment | ~2V | After S07-15. |
| [ ] | 8 | S07-05 | Returning bug detection (server-side) | ~3V | After `[DEV:ai]` ships S07-04. |
| [ ] | 9 | S07-07 | Severity auto-suggest (confidence UI) | ~2V | Stretch. After S07-04. |

**Phase 2: ~11V | `[DEV:app]` grand total: ~21.5V**

---

## `[DEV:ai]` — AI/Agent Developer

> Scope: AGENTS integration + LLM features + Autonomous Agent. Cross-repo (**nightingale** + **vigil**).

### ⚡ Phase 1 — Scaffold (no AGENTS dependency)

| Status | Order | ID | Deliverable | Cost | Notes |
|---|---|---|---|---|---|
| [ ] | 1 | S07-08a | `vigil_agent` scaffold: command + config (dry-run) | ~1V | No deps. Start immediately. |

### 🔧 Phase 2 — AGENTS Chain

| Status | Order | ID | Deliverable | Cost | Notes |
|---|---|---|---|---|---|
| [ ] | 2 | S07-01 | AGENTS `/api/v1/vigil/suggest` endpoint | ~4V | **nightingale** repo. Critical path. |
| [ ] | 3 | S07-02 | Prompt templates (4 Jinja2 files) | ~3V | nightingale repo. After S07-01. |
| [ ] | 4 | S07-03 | resource_manager Vigil tracking | ~2V | Stretch — defer to S08 if tight. |
| [ ] | 5 | S07-04 | Flip `VIGIL_LLM_MODE=live`, wire → AGENTS | ~2V | vigil-server. After S07-01. |
| [ ] | 6 | S07-06 | Bug auto-complete in extension (LLM UI) | ~3V | `BugEditor.tsx`. After S07-04. |
| [ ] | 7 | S07-08b | Bug classification (via AGENTS) | ~1.5V | After S07-04. Sequential gate. |
| [ ] | 8 | S07-08c | Regression test gen + RED confirmation | ~1.5V | After S07-08b. Sequential gate. |
| [ ] | 9 | S07-08d | Fix implementation + GREEN + branch commit | ~1V | After S07-08c. Sequential gate. |
| [ ] | 10 | S07-09 | Sprint health report (LLM-generated) | ~2V | Stretch. After S07-04. |

**`[DEV:ai]` grand total: ~21V**

---

## `[QA]` — Quality Assurance

| Status | Order | ID | Deliverable | Phase | Notes |
|---|---|---|---|---|---|
| [ ] | 1 | — | Regression gate: 201 vitest + 38 E2E | Pre | Before any new testing |
| [ ] | 2 | Q712 | New Session form: project required, sprint auto-detect | 1 | Verify S07-16 |
| [ ] | 3 | Q713 | Session name auto-gen + history persistence | 1 | chrome.storage.local |
| [ ] | 4 | Q714a | Dashboard Phase A: nav, filters, screenshots | 1 | After S07-17a |
| [ ] | 5 | Q714b | Dashboard Phase B: timeline + replay | 1 | After S07-17b |
| [ ] | 6 | Q715 | Ghost session recovery flow | 1 | Verify S07-18 |
| [ ] | 7 | Q716 | Service worker restart persistence | 1 | Kill worker → verify |
| [ ] | 8 | Q717 | Carry-forward bug regression (S07-20, S07-21) | 1 | Already green |
| — | — | **FAT** | **FAT Round 3 (13 steps) — Founder sign-off** | **Gate** | |
| [ ] | 9 | S07-10 | Integration tests: ext → server → AGENTS | 2 | ~2V. After S07-04. |
| [ ] | 10 | S07-22 | HTTP route integration tests | 2 | ~1.5V. After S07-15. |
| [ ] | 11 | Q718 | LLM graceful degradation (AGENTS offline) | 2 | D006 compliance |
| [ ] | 12 | Q719 | `vigil_agent` safety gates (dry-run, branch-only) | 2 | After S07-08d |
| [ ] | 13 | Q720 | Neon PostgreSQL CRUD verification | 2 | After S07-15 |
| [ ] | 14 | Q721 | Vercel health check (cloud URL) | 2 | After S07-14 |

**`[QA]` total: ~3.5V (test code) + manual validation**

---

## Dependency Summary

```
⚡ PHASE 1 — UX First (Week 1-2):
  [DEV:app]   S07-11 → S07-16b → S07-17a → S07-17b → S07-13
  [DEV:ai]    S07-08a (scaffold, parallel)
  [QA]        Regression gate → Q712-Q717
  ──── FAT Round 3 GATE ────

🔧 PHASE 2 — Backend + LLM (Week 2-3):
  [DEV:ai]    S07-01 → S07-02 → S07-04 → S07-06 → S07-08b → S07-08c → S07-08d
                                    ↓
  [DEV:app]                   S07-05, S07-07
  [DEV:app]   S07-15 → S07-14 (parallel, no AGENTS dep)
  [QA]        S07-10, S07-22, Q718-Q721

  [DEV:ai] Track D sub-tasks are sequential:
    S07-08a (W1) → S07-08b (W3) → S07-08c (W3) → S07-08d (W3)
```

---

*Generated: 2026-02-26 | Updated: 2026-03-01 (Team restructured to 3 roles per D027. E2E regression fixed per D026. Phase 1 ext work complete: S07-12/16/18/19/20/21. 201/201 vitest, 38/38 E2E green.) | Sprint 07 | Owner: CPTO*

# CPTO Review Response — External DR on Sprint 09 Specs

**Date:** 2026-03-23 | **Reviewer:** CTO (external) | **Respondent:** CPTO

---

## Verdict Received

> GOOD enough to continue as architecture direction.
> BAD enough that implementation should not start from these docs unchanged.
> UGLY in the auth/spec consistency layer and async-ops gap.

**CPTO response: Every finding accepted. No pushback. Consolidation pass executed.**

---

## Finding-by-Finding Response

### BAD Findings

| # | Finding | Action Taken | Artifact |
|---|---------|-------------|----------|
| B1 | bcrypt vs Argon2id inconsistency | **FIXED.** Purged ALL bcrypt references from all 4 specs + HTML flows. Created ADR S09-001 as single auth source of truth. | `ADR_S09_001_AUTH_STACK.md` |
| B2 | Google OAuth in target routes vs D033 | **FIXED.** Removed Google from all S09 route contracts, target diagrams, and UI references. ADR S09-001 explicitly says "NO GOOGLE OAUTH ROUTES IN SPRINT 09." | `ADR_S09_001_AUTH_STACK.md` |
| B3 | Email-as-identity naive for cross-product | **REDESIGNED.** Replaced auto-merge with explicit identity-linking model. User consent required. No shared credentials. No auto-SXC sharing. | Updated `SPRINT_09_SPEC_production_launch.md` §3 |
| B4 | Pricing unvalidated | **ACKNOWLEDGED.** Pricing remains a draft (D030). Recommend launching with generous free tier and running usage simulation after 2 weeks of real data. Added as a Sprint 10 deliverable. | Decision log |
| B5 | Sprint sizing unrealistic at 55V | **ACKNOWLEDGED.** 55V approved by FOUNDER with lead + 3 team. Analyst crew behind feature flag (D038) reduces release risk even if implementation takes longer. | Decision log |

### UGLY Findings

| # | Finding | Action Taken | Artifact |
|---|---------|-------------|----------|
| U1 | No concrete async job system | **RESOLVED.** Created ADR S09-002: Postgres-backed jobs table + idempotent worker + Vercel Cron. Full schema, execution flow, idempotency rules, and scale analysis. | `ADR_S09_002_ASYNC_JOBS.md` |
| U2 | PII protection hand-wavy | **RESOLVED.** Created ADR S09-003: Data classification table, sanitization pipeline (3-step with confidence check), storage vs LLM matrix, retention policy, deletion cascade. | `ADR_S09_003_DATA_GOVERNANCE.md` |
| U3 | Chat security underspecified | **RESOLVED.** ADR S09-003 §4: Input containment (2K chars, rate limit), context containment (read-only on analysis), output containment (no tool calls), prompt injection defense (role separation). | `ADR_S09_003_DATA_GOVERNANCE.md` §4 |
| U4 | Mobile-responsive excluded | **REVERSED.** D041: Mobile-responsive landing IS in scope. No longer excluded. | Decision log |

### Recommendations

| # | Recommendation | Action Taken |
|---|---------------|-------------|
| R1 | JWT claims as convenience, not authority | **ADOPTED.** ADR S09-001 defines: plan/role/billing re-validated from DB on sensitive ops. JWT is UI rendering shortcut only. D042 records this. |
| R2 | Analyst crew behind feature flag | **ADOPTED.** D038: Analyst developed in parallel but released behind beta gate. Public launch spine = landing + auth + billing + dashboard auth. |
| R3 | Pricing scenario modeling | **Deferred to post-launch.** Will model 3 personas (free tester, pro solo, team QA) after 2 weeks of real usage data. |

---

## Updated Spec Package

After consolidation, the Sprint 09 spec set is:

| File | Status | Role |
|------|--------|------|
| `sprint_09_index.md` | Updated | Master index — 7 tracks, decisions D030-D042 |
| `sprint_09_decisions_log.md` | Updated | 13 decisions with ADR references |
| `specs/SPRINT_09_SPEC_production_launch.md` | Updated | bcrypt purged, identity model redesigned, Google OAuth removed from routes |
| `specs/SPRINT_09_SPEC_vigil_analyst_crew.md` | Unchanged | CTO praised as "best spec in the set" |
| `specs/SPRINT_09_SPEC_security_and_architecture.md` | Updated | bcrypt purged, Argon2id throughout |
| `specs/SPRINT_09_FLOWS.html` | Updated | All 4 bcrypt references → Argon2id |
| `specs/ADR_S09_001_AUTH_STACK.md` | **NEW** | Single source of truth for auth decisions |
| `specs/ADR_S09_002_ASYNC_JOBS.md` | **NEW** | Postgres job system architecture |
| `specs/ADR_S09_003_DATA_GOVERNANCE.md` | **NEW** | PII, retention, chat containment |

---

## Remaining Open Items

| Item | Owner | When |
|------|-------|------|
| Pricing scenario modeling (3 personas) | CPTO | Post-launch (week 2 data) |
| Re-estimate sprint vibes with coordination overhead | CPTO | Before track TODO generation |
| Define analyst crew skill files | DEV:ai | During Track F implementation |

---

## CPTO Assessment

The external DR was **correct and valuable**. The spec rot (bcrypt/Google) was a real implementation risk that would have caused team divergence. The async job gap was a genuine architectural omission. The data governance gap was a liability for a public product.

After this consolidation pass:
- **Auth is frozen** in one ADR with zero ambiguity
- **Async jobs are defined** with schema, flow, and scale analysis
- **Data governance is specified** with classification, pipeline, and containment
- **Identity linking is redesigned** from naive email-merge to explicit consent
- **All specs are internally consistent** — no bcrypt, no Google OAuth in S09

**The spec set is now implementation-safe.**

---

*CPTO Review Response | 2026-03-23 | Vigil Sprint 09*

# Sprint 09 — Index

**Goal:** Ship Vigil as a public product — branded landing page, user auth, SXC billing via Paddle, AI session analyst crew, and SynaptixLabs cross-product user integration.

**Depends on:** Sprint 08 complete (AGENTS integration, GOD MODE, dashboard)
**Version target:** `3.0.0`
**Budget:** ~55V
**Prerequisite:** vigil-server live (Vercel + Neon), AGENTS platform running (`:8000`), extension loads cleanly, Paddle sandbox account configured

---

## Context

Sprint 08 delivered the intelligence layer. Sprint 09 makes Vigil a **public product** — users can discover it, register, pay for premium features, and manage their account. This sprint also lays the foundation for the SynaptixLabs one-stop-shop: a shared user identity across Vigil, Papyrus, and future products.

Architecture patterns are adopted from Papyrus (NextAuth → Express JWT, Paddle, SXC two-tier tokens) and designed for extraction to a shared auth service in Sprint 10+.

### Spec Documents

| Spec | Purpose |
|------|---------|
| [`SPRINT_09_SPEC_production_launch.md`](specs/SPRINT_09_SPEC_production_launch.md) | Landing, auth, billing, SynaptixLabs integration |
| [`SPRINT_09_SPEC_vigil_analyst_crew.md`](specs/SPRINT_09_SPEC_vigil_analyst_crew.md) | AI session analyst crew (7 agents, 3 modes, DAG pipeline) |
| [`SPRINT_09_SPEC_security_and_architecture.md`](specs/SPRINT_09_SPEC_security_and_architecture.md) | Security architecture + modular BE/FE structure |
| [`SPRINT_09_FLOWS.html`](specs/SPRINT_09_FLOWS.html) | Interactive HTML visualization of all flows |

---

## Scope

| ID | Track | Deliverable | Priority | Cost | Owner | Phase |
|----|-------|-------------|----------|------|-------|-------|
| S09-A | Landing | Vigil-branded landing page (hero, features, pricing, CTA) | P0 | ~8V | UI/UX + `[DEV:dashboard]` | 1 |
| S09-B | Auth | User auth system (register, login, JWT, email verify, profile) | P0 | ~10V | `[DEV:server]` | 1 |
| S09-C | Billing | SXC + Paddle integration (webhook, tiers, token packs, consumption) | P1 | ~8V | `[DEV:server]` | 2 |
| S09-D | Dashboard | Auth gate on dashboard (login/register pages, session guard, settings) | P1 | ~5V | `[DEV:dashboard]` | 2 |
| S09-E | Platform | SynaptixLabs integration (synaptixlabs_id, products[], cross-product design) | P1 | ~4V | `[DEV:server]` | 2 |
| S09-F | AI Crew | vigil-analyst crew: 7 agents, session analysis, ticket derivation, proactive discovery | P1 | ~15V | `[DEV:ai]` + AGENTS | 2 |
| S09-G | QA | Integration + regression tests across all tracks | P1 | ~5V | `[QA]` | 3 |

**Core P0+P1: ~55V | Total: ~55V**

---

## 3-Checkbox + Report Protocol

Every task in every track TODO uses this lifecycle:

| Phase | Who | Checkbox | Report required | Report path |
|-------|-----|----------|-----------------|-------------|
| 1. Implement | DEV | `[x] Dev` | DEV report (files, tests, risks) | `reports/DEV_{track}_{id}_{date}.md` |
| 2. Test | QA | `[x] QA` | QA report (AC check, PASS/FAIL) | `reports/QA_{track}_{id}_{date}.md` |
| 3. Review | CPTO | `[x] GBU` | DR report (GBU, scorecard, verdict) | `reports/DR_{track}_{id}_{date}.md` |

**A task is DONE only when all 3 boxes are checked AND all 3 reports exist in `reports/`.**

---

## Dependency Chain

```
Day 1 (parallel):
  [UI/UX]         Track A — Landing page design (wireframes → mockups)
  [DEV:server]    Track B — Auth system (User schema, register, login, JWT)

After Track B:
  [DEV:server]    Track C — SXC + Paddle billing
  [DEV:dashboard] Track D — Dashboard auth gate
  [DEV:server]    Track E — SynaptixLabs integration

After Track A design approved:
  [DEV:dashboard] Track A — Landing page implementation

After Tracks A-E:
  [QA]            Track F — Full integration testing

Critical path: B → C → F
```

---

## Tracks

| Track | Name | Owner | TODO File |
|-------|------|-------|-----------|
| A | Landing Page | UI/UX + `[DEV:dashboard]` | `todo/track_a_landing_page.md` |
| B | Auth System | `[DEV:server]` | `todo/track_b_auth_system.md` |
| C | SXC + Billing | `[DEV:server]` | `todo/track_c_sxc_billing.md` |
| D | Dashboard Auth Gate | `[DEV:dashboard]` | `todo/track_d_dashboard_auth.md` |
| E | SynaptixLabs Integration | `[DEV:server]` | `todo/track_e_synaptixlabs.md` |
| F | AI Analyst Crew | `[DEV:ai]` + AGENTS | `todo/track_f_ai_analyst_crew.md` |
| G | QA + Regression | `[QA]` | `todo/track_g_qa.md` |

---

## Team

| Tag | Scope |
|-----|-------|
| `[UI/UX]` | Landing page design — wireframes, mockups, brand identity |
| `[DEV:server]` | Auth API, Paddle webhook, SXC consumption, DB schema |
| `[DEV:dashboard]` | Landing page implementation, auth UI, settings page |
| `[QA]` | Integration tests, auth flow E2E, billing flow validation |

---

## Key Decisions

| ID | Decision | Status |
|----|----------|--------|
| D001 | AGENTS is the LLM platform — vigil-server is a thin consumer | Approved (S07) |
| D030 | Vigil SXC pricing tiers (Free/Pro/Team/Enterprise) | APPROVED 2026-03-23 |
| D031 | Auth approach: Express JWT middleware (not NextAuth) | APPROVED 2026-03-23 |
| D032 | Landing page: React in dashboard app | APPROVED 2026-03-23 |
| D033 | Credentials only in S09, Google OAuth in S10 | APPROVED 2026-03-23 |
| D034 | Design for shared auth extraction, extract in S10 | APPROVED 2026-03-23 |
| D035 | Ship as-is (~55V), no sub-sprint split | APPROVED 2026-03-23 |
| D036 | Argon2id for passwords (OWASP 2025), not bcrypt | APPROVED 2026-03-23 |
| D037 | JWT: 15-min access token + 7d refresh rotation | APPROVED 2026-03-23 |
| D038 | Analyst crew behind feature flag / beta gate at release (per external DR) | APPROVED 2026-03-23 |
| D039 | Async jobs: Postgres-backed jobs table, not message queue (ADR S09-002) | APPROVED 2026-03-23 |
| D040 | Identity linking: explicit user consent, not auto-merge by email | APPROVED 2026-03-23 |
| D041 | Mobile-responsive landing page IS in scope (reversed from earlier exclusion) | APPROVED 2026-03-23 |
| D042 | JWT claims are convenience, not authority — DB re-validate on sensitive ops | APPROVED 2026-03-23 |

---

## Definition of Done

- [ ] Landing page live at `/` with Vigil brand, pricing, CTA
- [ ] User registration + login working (email/password)
- [ ] Email verification flow working (Resend)
- [ ] Dashboard behind auth gate (redirect to login if not authenticated)
- [ ] SXC balance tracking (plan tokens + purchased tokens)
- [ ] Paddle sandbox integration (subscribe, cancel, token pack purchase)
- [ ] `synaptixlabs_id` + `products[]` on User record
- [ ] GOD admin (`admin@synaptixlabs.ai`) seeded and protected
- [ ] Every task has all 3 checkboxes checked (Dev + QA + GBU)
- [ ] Every task has all 3 reports in `reports/`
- [ ] All unit tests pass (`npx vitest run`)
- [ ] TypeScript clean (`npx tsc --noEmit`)
- [ ] Extension builds and loads without errors
- [ ] Server builds and health check passes
- [ ] E2E regression tests green
- [ ] Avi sign-off

---

## Key Constraints

- Chrome Manifest V3 only — no V2 APIs
- Shadow DOM for ALL injected UI
- rrweb for recording — no custom DOM capture
- vigil-server for all auth/billing logic — extension has no direct DB access
- AGENTS platform for LLM — vigil-server never owns LLM logic
- All API keys / secrets in env vars only
- Port 7474 for vigil-server
- Paddle for payments — NOT Stripe
- Argon2id for password hashing (19 MiB, t=2, p=1 — OWASP 2025, D036)
- JWT: 15-min access token + 7d refresh with rotation + fingerprint binding (D037)

---

*Sprint 09 created: 2026-03-22 | Status: APPROVED 2026-03-23 | Depends on Sprint 08 | Owner: CPTO*

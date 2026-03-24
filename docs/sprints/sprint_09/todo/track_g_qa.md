# Track G — QA + Regression

**Sprint:** 09 | **Owner:** `[QA]` | **Priority:** P1 | **Vibes:** ~5V
**Branch:** `sprint-09/qa`
**Team:** QA Team
**Depends on:** Tracks A-F (all implementation tracks)

---

## Instructions — READ BEFORE STARTING

| Role | Checkbox | Report file |
|------|----------|-------------|
| DEV | `[x] Dev` | `reports/DEV_G_{task_id}_{YYYY-MM-DD}.md` |
| QA | `[x] QA` | `reports/QA_G_{task_id}_{YYYY-MM-DD}.md` |
| GBU | `[x] GBU` | `reports/DR_G_{task_id}_{YYYY-MM-DD}.md` |

**DONE = all 3 checked + all 3 reports exist.**

---

## Mission

Validate all Sprint 09 deliverables across security, auth, billing, landing, analysis, and cross-product integration. Produce PASS/FAIL gate reports. Ensure no regressions on existing extension + server + dashboard functionality.

---

## TODO

| ID | Task | AC | Vibes | Dev | QA | GBU |
|----|------|----|-------|-----|----|-----|
| G01 | Auth E2E suite | Full auth flow E2E: register → verify → login → refresh → forgot → reset → logout. Account lockout. Rate limiting. | 1.5V | [ ] | [ ] | [ ] |
| G02 | Billing E2E suite | SXC consumption. Paddle webhook simulation. Balance checks. Promo code redemption. Plan gating. | 1V | [ ] | [ ] | [ ] |
| G03 | Landing page validation | All sections render. Mobile responsive (375/768/1024/1440px). Links work. Lighthouse mobile >= 80. Pricing matches paddle.config.ts. | 0.5V | [ ] | [ ] | [ ] |
| G04 | Security audit | OWASP checklist verification. No secrets in code. Headers check. CSRF check. Rate limit check. Argon2id verification. JWT claim-vs-DB authority check. | 1V | [ ] | [ ] | [ ] |
| G05 | Regression suite | All existing E2E tests still pass. Extension loads. Session capture → POST → dashboard view. MCP tools work. Server health check. | 0.5V | [ ] | [ ] | [ ] |
| G06 | Analysis pipeline E2E (beta) | Queue job → status poll → result delivery. Chat interface. Proactive suggestions accept/reject. Feature flag gate working. | 0.5V | [ ] | [ ] | [ ] |

---

### G01 Details

**Task:** End-to-end auth flow testing
**Files:** `tests/e2e/auth/`
**AC:**
- [ ] Register with valid data → 201 + verification email sent
- [ ] Register with duplicate email → 409 (generic message, no email disclosure)
- [ ] Register with weak password → 400
- [ ] Verify email with valid code → email_verified = true
- [ ] Verify email with expired code → 400
- [ ] Login with valid credentials → 200 + access token + refresh cookie
- [ ] Login with unverified email → rejected with redirect
- [ ] Login with wrong password → 401 (generic message)
- [ ] 5 failed logins → account locked for 15 minutes
- [ ] Refresh token → new access token + new refresh cookie
- [ ] Logout → refresh token revoked, cookie cleared
- [ ] Forgot password → email sent (same 200 whether email exists or not)
- [ ] Reset password → password changed, all tokens revoked
- [ ] Protected route without token → 401
- [ ] Protected route with expired token → 401

### G02 Details

**Task:** Billing and SXC flow testing
**Files:** `tests/e2e/billing/`
**AC:**
- [ ] consumeToken: deducts from plan first, then purchased
- [ ] consumeToken: insufficient balance returns error
- [ ] Monthly renewal: tokens reset when month boundary crossed
- [ ] Paddle webhook: subscription.created updates plan + tokens
- [ ] Paddle webhook: invalid signature → 401
- [ ] Paddle webhook: idempotent (replay same event = no double-update)
- [ ] Balance API returns DB values (not JWT values)
- [ ] Plan-gated endpoint rejects free user (checking DB, not JWT)
- [ ] Promo code: valid code adds to purchased_tokens
- [ ] Promo code: expired/used/duplicate → rejected

### G03 Details

**Task:** Landing page visual and functional validation
**Files:** `tests/e2e/landing/`
**AC:**
- [ ] All 7 sections render without errors
- [ ] Navigation links scroll to correct sections
- [ ] Sign In / Sign Up buttons navigate to auth pages
- [ ] Pricing cards match `paddle.config.ts` values
- [ ] Mobile responsive: no horizontal scroll at 375px
- [ ] Lighthouse mobile performance >= 80
- [ ] No console errors

### G04 Details

**Task:** Security audit against OWASP and ADR S09-001
**Files:** `tests/e2e/security/`, `docs/sprints/sprint_09/reports/QA_G_G04_security_audit.md`
**AC:**
- [ ] Helmet.js headers present (CSP, HSTS, X-Frame-Options, nosniff)
- [ ] No secrets in source code (`grep -r "sk_\|pdl_\|NEXTAUTH_SECRET" src/ packages/`)
- [ ] Password stored as Argon2id hash (NOT bcrypt — verify in DB)
- [ ] JWT access token expires in 15 minutes (decode and check)
- [ ] Refresh token is HttpOnly + Secure + SameSite=Strict
- [ ] Rate limiting on auth endpoints (verify 429 response)
- [ ] Plan/role checks hit DB on sensitive operations (not JWT)
- [ ] Paddle webhook rejects invalid signature
- [ ] CORS configured correctly (only allowed origins)
- [ ] No user enumeration on register/forgot-password (generic responses)

### G05 Details

**Task:** Regression against existing functionality
**Files:** `tests/e2e/regression/`
**AC:**
- [ ] All existing Playwright tests pass
- [ ] Extension builds (`npm run build`) and loads in Chrome
- [ ] Session capture → POST /api/session → stored in DB
- [ ] Dashboard shows sessions, bugs, features
- [ ] MCP tools respond (vigil_list_bugs, vigil_read_session, etc.)
- [ ] Server health check passes (GET /health → 200)
- [ ] No TypeScript errors (`npx tsc --noEmit`)

### G06 Details

**Task:** Analysis pipeline E2E (behind beta flag)
**Files:** `tests/e2e/analysis/`
**AC:**
- [ ] POST /api/analysis/queue with Pro plan → job created
- [ ] POST /api/analysis/queue with free plan → 403
- [ ] GET /api/analysis/jobs/:id/status → returns current status
- [ ] Job processes and completes (requires AGENTS platform running)
- [ ] Results viewable in dashboard
- [ ] Chat interface sends/receives messages (Mode 2)
- [ ] Proactive suggestion accept → bug created
- [ ] Proactive suggestion reject → dismissed
- [ ] Feature flag off → shows placeholder, not analysis UI

---

## Dependency Map

```
All tracks (A-F) ──→ G01 (auth E2E)
                 ──→ G02 (billing E2E)
                 ──→ G03 (landing validation)
                 ──→ G04 (security audit)
                 ──→ G05 (regression)
                 ──→ G06 (analysis E2E, beta)

G01-G06 can run in parallel once their dependent tracks deliver.
```

---

## Regression Gate

```bash
npx tsc --noEmit
npx vitest run
npm run build
npm run build:server
npx playwright test
curl http://localhost:7474/health
```

**ALL must pass. Zero tolerance for regressions on Sprint 09 merge.**

---

*Track G | Sprint 09 | Owner: [QA] | QA Team*

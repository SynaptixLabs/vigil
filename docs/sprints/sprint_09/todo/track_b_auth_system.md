# Track B — Auth System

**Sprint:** 09 | **Owner:** `[DEV:server]` | **Priority:** P0 | **Vibes:** ~10V
**Branch:** `sprint-09/auth`
**Team:** Server Team

---

## Instructions — READ BEFORE STARTING

### Every team member MUST follow this protocol:

**When you finish your work on a task, you MUST:**

1. **Check your checkbox** in the TODO table below
2. **Create a report** in `docs/sprints/sprint_09/reports/` using the naming convention for your role
3. A task is **DONE only when all 3 checkboxes are checked and all 3 reports exist**

| Role | Checkbox | Report file |
|------|----------|-------------|
| DEV | `[x] Dev` | `reports/DEV_B_{task_id}_{YYYY-MM-DD}.md` |
| QA | `[x] QA` | `reports/QA_B_{task_id}_{YYYY-MM-DD}.md` |
| GBU | `[x] GBU` | `reports/DR_B_{task_id}_{YYYY-MM-DD}.md` |

---

## Mission

Build the complete auth module for vigil-server: registration, login, email verification, forgot/reset password, profile, and JWT middleware. This is the critical path — Tracks C, D, and E depend on it.

**AUTHORITATIVE SPEC:** `specs/ADR_S09_001_AUTH_STACK.md` — the ONLY source of truth for auth decisions. If any other doc contradicts it, the ADR wins.

---

## TODO

| ID | Task | AC | Vibes | Dev | QA | GBU |
|----|------|----|-------|-----|----|-----|
| B01 | User DB schema + migration | Users table with all fields (auth, billing, platform). Migration runs cleanly on Neon. | 1.5V | [ ] | [ ] | [ ] |
| B02 | Auth module scaffold + Argon2id password utils | Module at `modules/auth/` with README, index, schemas. `password.utils.ts` with Argon2id hash + verify. | 1.5V | [ ] | [ ] | [ ] |
| B03 | Register endpoint | POST /api/auth/register — Zod validate, duplicate check, Argon2id hash, create user, send verification email. | 2V | [ ] | [ ] | [ ] |
| B04 | Email verification | POST /api/auth/verify-email — validate code, check expiry, mark verified. EmailVerification table. | 1V | [ ] | [ ] | [ ] |
| B05 | Login + JWT issuance | POST /api/auth/login — Argon2id verify, 15-min access JWT + 7d refresh cookie + fingerprint. Lazy SXC renewal. | 2V | [ ] | [ ] | [ ] |
| B06 | Refresh + Logout + Revocation | POST /api/auth/refresh (rotate), POST /api/auth/logout (revoke). revoked_tokens table. | 1V | [ ] | [ ] | [ ] |
| B07 | Forgot/reset password | POST /api/auth/forgot-password + POST /api/auth/reset-password. Rate limited. Revoke all tokens on reset. | 1V | [ ] | [ ] | [ ] |
| B08 | Auth middleware + profile | authMiddleware (JWT verify + fingerprint), requireRole(), requirePlan(). GET/PUT /api/auth/profile. | 1V | [ ] | [ ] | [ ] |

---

### B01 Details

**Task:** Create the users table, email_verification table, and revoked_tokens table
**Files:** `packages/server/src/shared/db/schema.ts`, `packages/server/src/shared/db/migrations/009_auth.ts`
**AC:**
- [ ] Users table matches ADR S09-001 + production launch spec schema (all fields)
- [ ] email_verification table: id, code, email, userId, expiresAt, used
- [ ] revoked_tokens table: id, tokenHash (SHA-256), expiresAt
- [ ] Migration runs `npx tsx packages/server/src/db/migrate.ts` without errors
- [ ] GOD admin seed: `admin@synaptixlabs.ai` with Argon2id hash, role=super_admin, immutable

### B02 Details

**Task:** Scaffold the auth module and implement Argon2id password utilities
**Files:** `packages/server/src/modules/auth/` (full module structure)
**AC:**
- [ ] Module directory: README.md, index.ts, auth.routes.ts, auth.service.ts, auth.schemas.ts, password.utils.ts, jwt.utils.ts, auth.middleware.ts
- [ ] `password.utils.ts`: `hashPassword(plain)` → Argon2id (memoryCost=19456, timeCost=2, parallelism=1), `verifyPassword(plain, hash)` → boolean
- [ ] Unit tests for hash + verify (including timing-safe comparison)
- [ ] README.md documents module purpose, API, dependencies

### B03 Details

**Task:** Implement user registration
**Files:** `packages/server/src/modules/auth/auth.service.ts`, `auth.routes.ts`, `auth.schemas.ts`
**AC:**
- [ ] Zod schema: email (format, max 320, lowercase), password (8-128), name (1-100)
- [ ] Duplicate email check (409 Conflict if exists)
- [ ] Argon2id hash → insert user with plan='free', plan_tokens=100, role='user'
- [ ] Generate synaptixlabs_id (uuid)
- [ ] Generate 6-digit verification code (15-min expiry) → send via Resend
- [ ] Rate limit: 5 registrations per IP per hour
- [ ] Response: 201 `{ userId, emailVerified: false }`
- [ ] Never reveal whether email exists on error (generic message)

### B04 Details

**Task:** Email verification flow
**Files:** `packages/server/src/modules/auth/auth.service.ts`
**AC:**
- [ ] POST /api/auth/verify-email `{ code }` → validate code + check expiry + mark used
- [ ] User.email_verified set to true
- [ ] Expired/invalid code → 400 with generic message
- [ ] Resend verification: POST /api/auth/resend-verification `{ email }` → rate limited (3/hour)

### B05 Details

**Task:** Login with JWT issuance
**Files:** `packages/server/src/modules/auth/auth.service.ts`, `jwt.utils.ts`
**AC:**
- [ ] POST /api/auth/login `{ email, password }` → find user, Argon2id verify
- [ ] Reject if email not verified (redirect to verify page)
- [ ] Account lockout: 5 failed attempts → 15-min lock
- [ ] Generate: access JWT (15-min, RS256 or HS256), refresh token (7d, opaque, stored in DB)
- [ ] Fingerprint: random value in HttpOnly cookie, SHA-256 hash in access JWT claim
- [ ] Set-Cookie: refreshToken (HttpOnly, Secure, SameSite=Strict, Path=/api/auth)
- [ ] Lazy SXC renewal: `maybeRenewPlanTokens()` if month boundary crossed
- [ ] Response: 200 `{ accessToken, user: { id, email, name, role, plan } }`
- [ ] JWT claims are CONVENIENCE — plan/role for UI only, DB re-validate on sensitive ops (D042)

### B06 Details

**Task:** Token refresh, logout, and revocation
**Files:** `packages/server/src/modules/auth/auth.service.ts`, `jwt.utils.ts`
**AC:**
- [ ] POST /api/auth/refresh → verify refresh cookie, check not revoked, issue new access + new refresh, invalidate old refresh
- [ ] POST /api/auth/logout → revoke refresh token, clear cookie
- [ ] revoked_tokens: store SHA-256 of token, auto-expire with TTL
- [ ] Refresh rotation: old token invalidated immediately on use

### B07 Details

**Task:** Forgot and reset password flow
**Files:** `packages/server/src/modules/auth/auth.service.ts`
**AC:**
- [ ] POST /api/auth/forgot-password `{ email }` → rate limit 3/hour/email, generate 15-min reset code, send via Resend
- [ ] Response: always 200 (never reveal if email exists)
- [ ] POST /api/auth/reset-password `{ code, newPassword }` → validate code, Argon2id hash new password, update user
- [ ] On reset: revoke ALL refresh tokens for this user (force re-login everywhere)

### B08 Details

**Task:** Auth middleware and profile endpoints
**Files:** `packages/server/src/modules/auth/auth.middleware.ts`, `auth.routes.ts`
**AC:**
- [ ] `authMiddleware`: extract Bearer token, verify JWT + fingerprint cookie, attach `req.user`
- [ ] `requireRole('admin')`: reject if role not admin/super_admin
- [ ] `requirePlan('pro')`: reject if plan is free — **must check DB, not JWT** (D042)
- [ ] GET /api/auth/profile → return user from DB (not from token)
- [ ] PUT /api/auth/profile → update name, image (Zod validated)
- [ ] POST /api/auth/change-password `{ oldPassword, newPassword }` → verify old, hash new, revoke all tokens

---

## Dependency Map

```
B01 (schema) ──→ B02 (scaffold + Argon2id)
                    ──→ B03 (register) ──→ B04 (verify email)
                    ──→ B05 (login + JWT) ──→ B06 (refresh + revoke)
                    ──→ B07 (forgot password)
                    ──→ B08 (middleware + profile)

B05 unblocks: Track C (billing), Track D (dashboard auth gate), Track E (platform)
```

---

## Regression Gate

```bash
npx tsc --noEmit
npx vitest run modules/auth/
npm run build:server
curl http://localhost:7474/health
# Auth smoke: register → verify → login → access protected route → refresh → logout
```

---

*Track B | Sprint 09 | Owner: [DEV:server] | Server Team | CRITICAL PATH*

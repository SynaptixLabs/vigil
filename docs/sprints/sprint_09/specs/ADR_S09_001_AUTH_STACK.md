# ADR S09-001 — Auth Stack Freeze

**Status:** APPROVED | **Date:** 2026-03-23 | **Author:** CPTO | **Trigger:** External DR finding B1/B2

---

## Context

External review identified spec rot: bcrypt referenced in production launch spec, register flow, and module naming (`password.utils.ts` → "bcrypt helpers") while security spec mandated Argon2id. Google OAuth appeared in target route diagrams despite D033 deferring it to Sprint 10. This inconsistency would cause teams to ship different implementations from the same docs.

## Decision

**Sprint 09 auth is frozen to this single stack. No alternatives. No ambiguity.**

### Password Hashing
- **Algorithm:** Argon2id — ONLY. No bcrypt anywhere in Sprint 09.
- **Parameters:** memoryCost=19456 (19 MiB), timeCost=2, parallelism=1
- **Library:** `argon2` npm package (Node.js binding to reference C implementation)
- **File name:** `password.utils.ts` — contains Argon2id hash + verify. NOT "bcrypt helpers."

### Authentication Method
- **Sprint 09:** Email + password credentials ONLY
- **No Google OAuth in Sprint 09** — no routes, no config, no UI buttons, no env vars
- **Sprint 10:** Google OAuth added as second provider

### JWT Architecture
- **Access token:** 15-minute expiry, RS256 signed, stored in JS memory (not localStorage)
- **Refresh token:** 7-day expiry, opaque (not JWT), stored in HttpOnly/Secure/SameSite=Strict cookie
- **Fingerprint:** Random value in HttpOnly cookie, SHA-256 hash embedded in access token claim
- **Rotation:** New refresh token issued on every use, old one invalidated immediately
- **Revocation:** Postgres-backed deny list (`revoked_tokens` table) with TTL = token expiry

### JWT Claims — Convenience, NOT Authority
JWT claims (`plan`, `products`, `role`) are **read shortcuts for UI rendering only**.

**Any operation that gates on plan/role/billing MUST re-validate from the database:**
- Token consumption → DB check balance
- Feature access (analyst crew) → DB check plan
- Admin operations → DB check role
- Subscription state → DB check status

This is a PLATFORM RULE for Sprint 09. No exceptions.

### Authoritative Route Contract

```
PUBLIC (no auth):
  GET  /                          Landing page
  GET  /pricing                   Pricing page
  POST /api/auth/register         { email, password, name } → Argon2id hash → user created
  POST /api/auth/login            { email, password } → Argon2id verify → access + refresh tokens
  POST /api/auth/verify-email     { code } → mark verified
  POST /api/auth/refresh          (cookie) → new access + refresh tokens
  POST /api/auth/forgot-password  { email } → send reset code via Resend (rate-limited)
  POST /api/auth/reset-password   { code, newPassword } → verify code, hash with Argon2id, update
  POST /api/webhooks/paddle       Paddle webhook (HMAC-SHA256 verified)

AUTHENTICATED (Bearer token required):
  POST /api/auth/logout           Revoke refresh token
  GET  /api/auth/profile          User profile (from DB, not token)
  PUT  /api/auth/profile          Update profile
  POST /api/auth/change-password  { oldPassword, newPassword }
  POST /api/auth/redeem-promo     { code }
  GET  /api/billing/balance       SXC balance (from DB)
  POST /api/subscription/portal   Paddle portal URL
  GET  /api/analysis/*            Analysis results (plan-gated from DB)
  POST /api/analysis/*            Queue analysis (plan-gated from DB)
  ALL  /api/sessions/*            Existing (now auth-gated)
  ALL  /api/bugs/*                Existing (now auth-gated)
  ALL  /api/features/*            Existing (now auth-gated)
  ALL  /api/projects/*            Existing (now auth-gated)

NO GOOGLE OAUTH ROUTES IN SPRINT 09.
```

## Consequences

- Every spec in `sprint_09/specs/` must be updated to remove bcrypt and Google OAuth references
- `password.utils.ts` implements Argon2id only
- All billing/plan gates do DB lookups, never trust JWT alone
- Sprint 10 adds Google OAuth as additive change (new provider, new routes, new UI button)

---

*ADR S09-001 | Auth Stack Freeze | CPTO | 2026-03-23*

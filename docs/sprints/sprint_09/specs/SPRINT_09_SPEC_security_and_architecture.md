# Sprint 09 — Security & Modular Architecture Specification

**Doc ID:** S09-ARCH-01 | **Author:** CPTO | **Date:** 2026-03-23
**Status:** DRAFT — External DR required

---

## 1. The Story

Sprint 09 transforms Vigil from an internal tool to a **public product with user accounts and payments**. This changes the security posture fundamentally — we go from "trusted team on localhost" to "untrusted internet users with billing data." Every decision in this spec flows from that shift.

Simultaneously, the codebase must scale from 3 developers to potentially 6+ working in parallel across tracks. The modular architecture ensures each team can work independently with clear boundaries, their own tests, and their own documentation.

---

## 2. Security Architecture

### 2.1 Threat Model

| Threat | Vector | Impact | Sprint 09 Mitigation |
|--------|--------|--------|---------------------|
| Credential theft | Brute force login | Account takeover | Argon2id (19 MiB, t=2, p=1) per OWASP 2025, rate limiting (10 req/min/IP), account lockout (5 failures → 15 min) |
| Session hijacking | XSS, network sniffing | Impersonation | HttpOnly + Secure + SameSite=Strict cookies, HTTPS only, short JWT expiry (15-min access + 7d refresh with rotation) |
| CSRF | Malicious form submission | Unauthorized actions | Double-submit CSRF token, SameSite=Strict |
| SQL injection | Malformed input | Data breach | Parameterized queries (Neon serverless driver), Zod input validation on every endpoint |
| XSS | User-generated content | Cookie theft, phishing | CSP headers, output encoding, no `dangerouslySetInnerHTML` without sanitization |
| Paddle webhook forgery | Fake payment events | Free premium access | HMAC-SHA256 signature verification on every webhook |
| API abuse | Automated requests | DoS, cost abuse | Rate limiting per IP + per user, request size limits |
| PII exposure | Session data contains user PII | Privacy violation | PII scrubbing before AI analysis, no PII in logs |
| Privilege escalation | Role manipulation | Admin access | Role checks server-side (never trust client), GOD admin immutable |
| Token theft | JWT stolen from storage | Account takeover | Access token in memory (not localStorage), refresh token in HttpOnly cookie |

### 2.2 Authentication Flow

```
REGISTER:
  Client → POST /api/auth/register { email, password, name }
    → Server: validate (Zod), check duplicate, hash (Argon2id), create user
    → Server: generate 15-min verification code, send via Resend
    → Response: 201 { userId, emailVerified: false }

VERIFY EMAIL:
  Client → POST /api/auth/verify-email { code }
    → Server: validate code, check expiry, mark user verified
    → Response: 200 { emailVerified: true }

LOGIN:
  Client → POST /api/auth/login { email, password }
    → Server: find user, verify Argon2id, check email verified
    → Server: generate access JWT (15 min) + refresh JWT (7d)
    → Response: 200 { accessToken } + Set-Cookie: refreshToken (HttpOnly, Secure, SameSite=Strict)

REFRESH:
  Client → POST /api/auth/refresh (cookie auto-sent)
    → Server: verify refresh token, check not revoked, issue new access + refresh
    → Response: 200 { accessToken } + Set-Cookie: new refreshToken

FORGOT PASSWORD:
  Client → POST /api/auth/forgot-password { email }
    → Server: rate limit (3 req/hour/email), find user
    → Server: generate 15-min reset code, send via Resend
    → Response: 200 (always — never reveal if email exists)

  Client → POST /api/auth/reset-password { code, newPassword }
    → Server: validate code + expiry, hash new password (Argon2id)
    → Server: update user, revoke ALL existing refresh tokens
    → Response: 200 { message: 'Password reset. Please log in.' }

LOGOUT:
  Client → POST /api/auth/logout
    → Server: revoke refresh token, clear cookie
    → Response: 200
```

### 2.3 JWT Structure

```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "user",
  "plan": "pro",
  "products": ["vigil"],
  "synaptixlabsId": "sl_xxx",
  "iat": 1711152000,
  "exp": 1711155600
}
```

- Access token: **15 minutes** (OWASP 2025, D037), stored in memory (React state), sent as `Authorization: Bearer` header
- Refresh token: 7 days, HttpOnly cookie, **rotated on each use** (prevents replay)
- Token fingerprint: random value in HttpOnly cookie, SHA-256 hash in JWT claim (sidejacking defense)
- No sensitive data in JWT (no password hash, no SXC balance — fetch from DB)

### 2.4 Authorization Middleware

```
Every protected route → authMiddleware:
  1. Extract Bearer token from Authorization header
  2. Verify JWT signature + expiry
  3. Attach user to request: req.user = { id, email, role, plan, products }
  4. Continue to route handler

Role-based access:
  requireRole('admin')     → 403 if role !== 'admin' && role !== 'super_admin'
  requirePlan('pro')       → 403 if plan is 'free'
  requirePlan('team')      → 403 if plan is 'free' or 'pro'
```

### 2.5 OWASP Top 10 Compliance

| # | OWASP Risk | Vigil Mitigation |
|---|-----------|-----------------|
| A01 | Broken Access Control | Server-side role + plan checks on every route, no client-trust |
| A02 | Cryptographic Failures | **Argon2id** for passwords (D036), JWT with RS256+rotation+fingerprint, HTTPS only |
| A03 | Injection | Zod validation on all inputs, parameterized queries, no eval/template literals |
| A04 | Insecure Design | Threat model above, defense-in-depth, principle of least privilege |
| A05 | Security Misconfiguration | Helmet.js for headers, CORS restricted, no debug in prod |
| A06 | Vulnerable Components | npm audit in CI, dependabot alerts, no unmaintained deps |
| A07 | Auth Failures | Rate limiting, account lockout, email verification, short token expiry |
| A08 | Data Integrity Failures | Paddle webhook signature verification, input validation |
| A09 | Logging & Monitoring | Structured logging (no PII), auth event audit log |
| A10 | SSRF | No user-controlled URLs in server-side fetches |

### 2.6 Security Headers (Helmet.js)

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0 (rely on CSP instead)
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 3. Modular Architecture

### 3.1 Design Principles

1. **Each module = independent team surface** — one team can work on one module without touching others
2. **Each module has its own README.md** — purpose, API, dependencies, examples
3. **Each module has its own tests/** — unit, integration, and E2E where applicable
4. **Module documentation is the source of truth** — not code comments, not external docs
5. **No file > 300 lines** — split when approaching. Functions > 50 lines are suspects.
6. **One export per concern** — barrel files (`index.ts`) for clean imports, internal files private

### 3.2 Backend Module Structure (vigil-server)

```
packages/server/src/
├── modules/                            # Domain modules
│   ├── auth/                           # NEW: Authentication & authorization
│   │   ├── README.md                   # Module docs
│   │   ├── index.ts                    # Public exports
│   │   ├── auth.middleware.ts          # JWT verification, role/plan guards
│   │   ├── auth.routes.ts             # /api/auth/* routes
│   │   ├── auth.service.ts            # Business logic (register, login, verify, forgot/reset password)
│   │   ├── auth.schemas.ts            # Zod validation schemas
│   │   ├── password.utils.ts          # Argon2id hash + verify (ADR S09-001)
│   │   ├── jwt.utils.ts              # Token generation/verification
│   │   └── tests/
│   │       ├── auth.service.test.ts
│   │       ├── auth.routes.test.ts
│   │       └── auth.middleware.test.ts
│   │
│   ├── billing/                        # NEW: SXC + Paddle
│   │   ├── README.md
│   │   ├── index.ts
│   │   ├── billing.routes.ts          # /api/billing/*, /api/webhooks/paddle
│   │   ├── billing.service.ts         # Token consumption, balance
│   │   ├── paddle.webhook.ts          # Webhook handler + signature verification
│   │   ├── paddle.config.ts           # Price IDs, tier mappings
│   │   ├── token-consumption.ts       # consumeToken(), renewPlanTokens()
│   │   ├── billing.schemas.ts
│   │   └── tests/
│   │       ├── billing.service.test.ts
│   │       ├── paddle.webhook.test.ts
│   │       └── token-consumption.test.ts
│   │
│   ├── sessions/                       # EXISTING: refactored from routes/
│   │   ├── README.md
│   │   ├── index.ts
│   │   ├── sessions.routes.ts
│   │   ├── sessions.service.ts
│   │   ├── sessions.schemas.ts
│   │   └── tests/
│   │
│   ├── bugs/                           # EXISTING: refactored from routes/
│   │   ├── README.md
│   │   ├── index.ts
│   │   ├── bugs.routes.ts
│   │   ├── bugs.service.ts
│   │   └── tests/
│   │
│   ├── features/                       # EXISTING: refactored from routes/
│   │   ├── README.md
│   │   ├── index.ts
│   │   ├── features.routes.ts
│   │   ├── features.service.ts
│   │   └── tests/
│   │
│   ├── projects/                       # EXISTING: refactored from routes/
│   │   ├── README.md
│   │   ├── index.ts
│   │   ├── projects.routes.ts
│   │   ├── projects.service.ts
│   │   └── tests/
│   │
│   ├── analysis/                       # NEW: AI analysis orchestration
│   │   ├── README.md
│   │   ├── index.ts
│   │   ├── analysis.routes.ts         # /api/analysis/* (queue, status, results)
│   │   ├── analysis.service.ts        # Job management, AGENTS API proxy
│   │   ├── analysis.schemas.ts
│   │   └── tests/
│   │
│   └── mcp/                            # EXISTING: MCP tools
│       ├── README.md
│       ├── index.ts
│       ├── server.ts
│       ├── tools/                      # One file per tool
│       └── tests/
│
├── shared/                             # Cross-cutting concerns
│   ├── middleware/                      # Express middleware
│   │   ├── error-handler.ts
│   │   ├── rate-limiter.ts
│   │   ├── cors.ts
│   │   └── security-headers.ts
│   ├── db/                             # Database (Neon)
│   │   ├── client.ts
│   │   ├── schema.ts                  # Single source of truth for DB schema
│   │   └── migrate.ts
│   ├── logger/
│   │   └── index.ts                   # Structured logging, PII redaction
│   └── config.ts                      # vigil.config.json + env vars
│
├── app.ts                              # Express app setup (imports modules)
└── index.ts                            # Server entry point
```

### 3.3 Frontend Module Structure (dashboard)

```
packages/dashboard/src/
├── modules/                            # Feature modules
│   ├── landing/                        # NEW: Public landing page
│   │   ├── README.md
│   │   ├── index.ts
│   │   ├── pages/
│   │   │   └── LandingPage.tsx
│   │   ├── components/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── PricingSection.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── IntegrationSection.tsx
│   │   │   ├── CTASection.tsx
│   │   │   ├── LandingNav.tsx
│   │   │   └── Footer.tsx
│   │   └── tests/
│   │
│   ├── auth/                           # NEW: Auth UI
│   │   ├── README.md
│   │   ├── index.ts
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── VerifyEmailPage.tsx
│   │   ├── components/
│   │   │   ├── AuthForm.tsx
│   │   │   └── AuthGuard.tsx          # Route protection wrapper
│   │   ├── hooks/
│   │   │   └── useAuth.ts            # Auth context + token management
│   │   └── tests/
│   │
│   ├── billing/                        # NEW: Billing UI
│   │   ├── README.md
│   │   ├── index.ts
│   │   ├── pages/
│   │   │   └── SettingsPage.tsx
│   │   ├── components/
│   │   │   ├── PlanCard.tsx
│   │   │   ├── SXCBalance.tsx
│   │   │   ├── TokenPackPurchase.tsx
│   │   │   └── SubscriptionManager.tsx
│   │   └── tests/
│   │
│   ├── analysis/                       # NEW: AI Analysis views
│   │   ├── README.md
│   │   ├── index.ts
│   │   ├── components/
│   │   │   ├── AnalysisStatus.tsx     # Badge + progress indicator
│   │   │   ├── AnalysisReport.tsx     # Full report viewer
│   │   │   ├── ProactiveSuggestions.tsx # Accept/reject/edit suggestions
│   │   │   └── AnalysisChat.tsx       # Chat interface
│   │   └── tests/
│   │
│   ├── sessions/                       # EXISTING: refactored
│   │   ├── README.md
│   │   ├── pages/
│   │   ├── components/
│   │   └── tests/
│   │
│   └── projects/                       # EXISTING: refactored
│       ├── README.md
│       ├── pages/
│       ├── components/
│       └── tests/
│
├── shared/                             # Cross-cutting UI
│   ├── components/                     # Reusable UI components
│   ├── hooks/                          # Shared hooks
│   ├── api/                            # API client (single source of truth)
│   │   └── client.ts                  # Axios/fetch wrapper with auth interceptor
│   ├── styles/                         # Tailwind config, theme tokens
│   └── types/
│
├── App.tsx                             # Router + providers
└── main.tsx                            # Entry point
```

### 3.4 Module Contract

Every module MUST have:

| File | Purpose | Required? |
|------|---------|-----------|
| `README.md` | Purpose, public API, dependencies, examples, ownership | YES |
| `index.ts` | Public exports (barrel file) — only way to import from module | YES |
| `tests/` | Unit tests minimum, integration where applicable | YES |
| `*.schemas.ts` | Zod validation schemas for inputs/outputs | If has API routes |
| `*.service.ts` | Business logic (no Express req/res — pure functions) | If has logic |
| `*.routes.ts` | Express route handlers (thin — delegates to service) | If has HTTP API |

### 3.5 Anti-Monolith Rules

| Rule | Enforcement |
|------|------------|
| No file > 300 lines | Linting rule + GBU review check |
| No function > 50 lines | GBU review check |
| No module imports another module's internal files | Only import from `index.ts` |
| No circular dependencies | `madge --circular` in CI |
| Routes are thin | Route handlers < 20 lines — delegate to service |
| Services are pure | No `req`/`res` in service files — accept typed params, return typed results |
| One concern per file | `auth.service.ts` doesn't handle billing. `billing.routes.ts` doesn't validate auth. |

---

## 4. Database Schema — Single Source of Truth

All schema definitions live in `packages/server/src/shared/db/schema.ts` — this is the canonical source. No schema definitions elsewhere. `1-source-of-truth`

Migration files in `packages/server/src/shared/db/migrations/` — versioned, never edited after deployment.

---

## 5. Module Documentation Standard

Each module's `README.md` must contain:

```markdown
# Module Name

## Purpose
[1-2 sentences]

## Owner
[team tag, e.g., [DEV:server]]

## Public API
[exported functions/classes with signatures]

## Dependencies
[which other modules this imports from]

## Environment Variables
[env vars this module reads, if any]

## Testing
[how to run tests for this module]
\`\`\`bash
npx vitest run modules/auth/
\`\`\`

## Changelog
[notable changes by sprint]
```

---

*S09-ARCH-01 | Security & Modular Architecture Spec v1.0 | CPTO | 2026-03-23*

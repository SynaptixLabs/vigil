# Sprint 09 Spec — Production Launch: Landing, Auth, SXC, SynaptixLabs Integration

**Author:** CPTO | **Date:** 2026-03-22 | **Status:** DRAFT — awaiting FOUNDER approval

---

## 1. Vision

Ship Vigil as a **public product** with its own branded landing page, user registration, SXC-based payment, and integration with the SynaptixLabs ecosystem. Users register on Vigil (or any SynaptixLabs product) and can add themselves to other products — making SynaptixLabs the one-stop-shop for dev tooling.

---

## 2. Architecture Context

### Current State (Sprint 08)
```
vigil-ext (Chrome Extension)
  └── captures bugs/sessions → POST to vigil-server

vigil-server (Express, port 7474 / Vercel)
  ├── REST API (sessions, bugs, features, projects)
  ├── MCP tools for Claude Code
  ├── React dashboard at /dashboard (authenticated: NO)
  └── Neon PostgreSQL

AGENTS (FastAPI, port 8000)
  └── LLM inference for bug auto-complete
```

### Target State (Sprint 09)
```
vigil-server (Express, port 7474 / Vercel)
  ├── PUBLIC routes
  │   ├── /               ← Landing page (React, unique Vigil brand)
  │   ├── /pricing        ← Pricing tiers + SXC packs
  │   ├── /auth/login     ← Sign in (credentials only — ADR S09-001)
  │   ├── /auth/register  ← Sign up
  │   └── /auth/verify    ← Email verification
  │
  ├── AUTHENTICATED routes
  │   ├── /dashboard/*    ← Existing dashboard (now behind auth)
  │   ├── /settings       ← Profile, subscription, SXC balance
  │   └── /billing        ← Paddle portal, token pack purchase
  │
  ├── AUTH API (new)
  │   ├── POST /api/auth/register     ← Argon2id + email verification (ADR S09-001)
  │   ├── POST /api/auth/login        ← JWT session
  │   ├── POST /api/auth/verify-email
  │   ├── GET  /api/auth/profile
  │   ├── POST /api/auth/change-password
  │   └── POST /api/auth/redeem-promo
  │
  ├── BILLING API (new)
  │   ├── POST /api/webhooks/paddle   ← Paddle webhook handler
  │   ├── POST /api/subscription/portal
  │   └── GET  /api/billing/balance   ← SXC balance + usage
  │
  ├── EXISTING API (unchanged)
  │   ├── /api/session, /api/sessions, /api/bugs, etc.
  │   └── MCP tools
  │
  └── Neon PostgreSQL (extended schema)
        ├── Users (auth, profile, plan, SXC balance)
        ├── EmailVerification
        ├── TokenTransaction (SXC audit log)
        ├── PromoCode / PromoCodeRedemption
        └── Existing tables (sessions, bugs, features, projects)
```

### Reference: Papyrus Patterns Being Adopted

| Pattern | Papyrus Implementation | Vigil Adaptation |
|---------|----------------------|------------------|
| Auth | NextAuth.js (JWT + credentials + Google) | Express middleware (JWT + Argon2id, credentials only in S09 — ADR S09-001) |
| Password | bcryptjs, 12 rounds (Papyrus) | **Argon2id** (19 MiB, t=2, p=1) — OWASP 2025, ADR S09-001 |
| Email verification | Resend, 15-min code | Same provider + flow |
| Payment | Paddle (sandbox + prod) | Same provider, Vigil-specific price IDs |
| SXC tokens | Plan tokens (monthly reset) + purchased tokens (never expire) | Same two-tier model |
| Token consumption | `consumeToken()` — plan first, then purchased | Same logic |
| Monthly renewal | Lazy renewal on API call | Same pattern |
| Promo codes | Code → purchased tokens, max uses, expiry | Same schema |
| User schema | Prisma User model with SXC fields | Drizzle/raw SQL on Neon with equivalent fields |
| Webhook | HMAC-SHA256 signature verification | Same |
| GOD admin | `admin@synaptixlabs.ai` immutable | Same |

---

## 3. SynaptixLabs One-Stop-Shop Design

### Cross-Product User Model

> **Updated per external DR:** Email equality is NOT safe as identity merge strategy.
> Sprint 09 uses explicit identity linking, not automatic email matching.

```
User registers on Vigil
  → User record created with: email, password, name, plan='free'
  → synaptixlabs_id generated (unique, product-agnostic)
  → product_enrollments = [{ product: 'vigil', enrolled_at, local_plan: 'free' }]

User later registers on Papyrus (SAME email)
  → Papyrus creates its OWN local user record
  → No automatic merge. No shared credentials. No shared SXC.
  → User sees: "Link your SynaptixLabs account?" prompt in Papyrus settings
  → Explicit link flow:
    1. User clicks "Link account"
    2. Papyrus redirects to Vigil's /api/auth/link-verify
    3. User confirms with Vigil password
    4. Both records get same synaptixlabs_id
    5. Product enrollments updated on both sides
  → SXC sharing happens ONLY after explicit link + both products enrolled
```

**Why not auto-merge by email:**
- Different auth methods per product (credentials vs OAuth vs SSO)
- Different password hashes (Vigil=Argon2id, Papyrus=bcrypt today)
- Enterprise SSO in future may use different email domains
- Privacy: user may want separate identities per product
- Security: compromised email shouldn't cascade across products

### Schema Design (extraction-ready)

The User table includes a `synaptixlabsId` field and a `products` JSON array. When the shared auth service is extracted (Sprint 10+), these fields become the foreign key to the central user store.

```sql
-- Sprint 09: Vigil-local, designed for extraction
CREATE TABLE users (
  id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  synaptixlabs_id       TEXT UNIQUE,          -- future: FK to central user store
  email                 TEXT UNIQUE NOT NULL,
  password_hash         TEXT NOT NULL,
  name                  TEXT,
  image                 TEXT,
  role                  TEXT DEFAULT 'user',   -- user | admin | super_admin
  email_verified        BOOLEAN DEFAULT FALSE,
  products              JSONB DEFAULT '["vigil"]',  -- cross-product registry

  -- SXC Billing
  plan                  TEXT DEFAULT 'free',
  plan_tokens           INT DEFAULT 100,       -- monthly SXC allocation
  purchased_tokens      INT DEFAULT 0,         -- one-time packs
  total_tokens_used     INT DEFAULT 0,         -- lifetime counter
  tokens_renewed_at     TIMESTAMPTZ DEFAULT NOW(),

  -- Paddle
  paddle_customer_id    TEXT UNIQUE,
  paddle_subscription_id TEXT,
  subscription_status   TEXT,                  -- active | past_due | cancelled | trialing
  subscription_ends_at  TIMESTAMPTZ,
  billing_period        TEXT,                  -- monthly | annual

  -- Metadata
  login_count           INT DEFAULT 0,
  last_login_at         TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Vigil SXC Pricing (DRAFT — requires FOUNDER approval)

### Subscription Tiers

| Tier | Price | SXC/month | Sessions/month | Features |
|------|-------|-----------|----------------|----------|
| **Free** | €0 | 100 SXC | 10 | Extension + dashboard, manual bugs |
| **Pro** | €19/mo (€15/mo annual) | 500 SXC | Unlimited | + AI bug auto-complete, severity suggest |
| **Team** | €49/mo (€39/mo annual) | 2,000 SXC | Unlimited | + vigil_agent auto-fix, team sharing |
| **Enterprise** | Custom | Custom | Unlimited | + self-hosted, SLA, SSO |

### SXC Token Costs

| Action | SXC Cost |
|--------|----------|
| Session capture + upload | 5 SXC |
| Bug auto-complete (AI) | 2 SXC |
| Severity auto-suggest (AI) | 1 SXC |
| vigil_agent fix attempt | 10 SXC |
| Session report generation | 1 SXC |
| MCP tool invocation | 0 (API access included in plan) |

### Token Packs (one-time purchase, via Paddle)

| Pack | SXC | Price |
|------|-----|-------|
| Spark | 200 SXC | €9 / $10 |
| Flow | 1,000 SXC | €29 / $32 |
| Surge | 5,000 SXC | €99 / $109 |

---

## 5. Landing Page Requirements

### Design
- **Unique Vigil brand** — NOT a copy of Papyrus. Dark theme, developer-focused, bug-hunting aesthetic
- Designed by UI/UX designer (ARIA or external) → implemented by DEV:dashboard
- Must feel like a **developer tool**, not an academic platform

### Sections (inspired by Papyrus, Vigil-specific content)

1. **Navigation** — Logo, Features, Pricing, Docs, Sign In / Sign Up
2. **Hero** — "Find bugs before your users do" + demo video/GIF of extension in action
3. **How It Works** — 3-step: Record → Capture → Resolve (with visuals)
4. **Features** — Session recording, inline bug capture, AI auto-complete, vigil_agent, MCP, dashboard
5. **Pricing** — Tier cards (Free / Pro / Team / Enterprise) + Token packs
6. **Integration** — "Works with Claude Code, Playwright, and your existing workflow"
7. **CTA** — "Start free — no credit card required"
8. **Footer** — SynaptixLabs branding, links, legal

### Technical
- React components in `packages/dashboard/src/pages/landing/`
- Served from vigil-server at `/` (public, no auth)
- SSR not required (SPA is fine for V1 — Vercel serves static)

---

## 6. Tracks

| Track | Name | Owner | Priority | Vibes | Dependencies |
|-------|------|-------|----------|-------|-------------|
| A | Landing Page Design | UI/UX + `[DEV:dashboard]` | P0 | ~8V | None (can start Day 1) |
| B | Auth System | `[DEV:server]` | P0 | ~10V | None (can start Day 1) |
| C | SXC + Paddle Billing | `[DEV:server]` | P1 | ~8V | Track B (needs User model) |
| D | Dashboard Auth Gate | `[DEV:dashboard]` | P1 | ~5V | Track B (needs auth API) |
| E | SynaptixLabs Integration | `[DEV:server]` | P1 | ~4V | Track B (needs User schema) |
| F | QA + Regression | `[QA]` | P1 | ~5V | Tracks A-E |

**Core P0+P1: ~40V | Total: ~40V**

---

## 7. Dependency Chain

```
Day 1 (parallel):
  [UI/UX]         Track A — Landing page design (wireframes → mockups)
  [DEV:server]    Track B — Auth system (User schema, register, login, JWT)

After Track B:
  [DEV:server]    Track C — SXC + Paddle billing (webhook, token consumption)
  [DEV:dashboard] Track D — Dashboard auth gate (login/register pages, session guard)
  [DEV:server]    Track E — SynaptixLabs integration (synaptixlabs_id, products[])

After Track A design approved:
  [DEV:dashboard] Track A — Landing page implementation

After Tracks A-E:
  [QA]            Track F — Full integration testing

Critical path: Track B → Track C → Track F
Parallel:       Track A (design) runs independently until implementation
```

---

## 8. Key Decisions Required (FOUNDER)

| ID | Decision | Options | Recommendation |
|----|----------|---------|----------------|
| D030 | Vigil SXC pricing tiers | As proposed in §4 / Different structure | Approve draft, iterate after launch |
| D031 | Auth approach | Express JWT (proposed) / Next.js app / Shared service | Express JWT — stays in vigil-server |
| D032 | Landing page framework | React in dashboard (proposed) / Separate Next.js / Static HTML | React in dashboard — simplest |
| D033 | Google OAuth in V1? | Yes / No (credentials only first) | Credentials only in S09, Google in S10 |
| D034 | One-stop-shop timeline | Design for extraction in S09, extract in S10 / Build shared now | Design now, extract later |
| D035 | Founding Partner program for Vigil? | Yes (like Papyrus) / No (not yet) | No — launch with standard tiers first |

---

## 9. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Paddle integration takes longer than estimated | Blocks billing track | Use sandbox for S09, live in S10 |
| Landing page design delays | Blocks implementation | DEV can start with wireframes, polish later |
| Cross-product user schema is wrong | Painful migration later | Review with FOUNDER before implementing |
| SXC pricing is wrong for Vigil | Revenue impact | Launch with generous free tier, adjust based on usage |
| Auth in Express is more work than NextAuth | Scope creep | Use passport.js + established patterns, keep minimal |

---

## 10. Out of Scope (Sprint 10+)

- Google OAuth (S10)
- Shared SynaptixLabs auth service extraction (S10)
- synaptixlabs.ai website integration page (S10)
- Team/organization management (S10)
- SSO / SAML for Enterprise (S11+)
- Mobile-responsive landing page optimization (S10)

---

*Sprint 09 Spec v1.0 | CPTO | 2026-03-22 | Status: DRAFT*

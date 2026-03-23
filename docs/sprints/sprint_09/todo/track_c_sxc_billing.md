# Track C — SXC + Paddle Billing

**Sprint:** 09 | **Owner:** `[DEV:server]` | **Priority:** P1 | **Vibes:** ~8V
**Branch:** `sprint-09/billing`
**Team:** Server Team
**Depends on:** Track B (User schema + auth middleware)

---

## Instructions — READ BEFORE STARTING

| Role | Checkbox | Report file |
|------|----------|-------------|
| DEV | `[x] Dev` | `reports/DEV_C_{task_id}_{YYYY-MM-DD}.md` |
| QA | `[x] QA` | `reports/QA_C_{task_id}_{YYYY-MM-DD}.md` |
| GBU | `[x] GBU` | `reports/DR_C_{task_id}_{YYYY-MM-DD}.md` |

**DONE = all 3 checked + all 3 reports exist.**

---

## Mission

Implement the SXC credit system and Paddle payment integration. Two-tier token model (plan tokens + purchased tokens), subscription management, token pack purchases, promo codes, and consumption tracking.

**Refs:** `specs/SPRINT_09_SPEC_production_launch.md` §4, `specs/ADR_S09_001_AUTH_STACK.md` (JWT claims = convenience, DB = authority)

---

## TODO

| ID | Task | AC | Vibes | Dev | QA | GBU |
|----|------|----|-------|-----|----|-----|
| C01 | Billing module scaffold + DB tables | Module at `modules/billing/`. Tables: token_transactions, promo_codes, promo_code_redemptions. | 1.5V | [ ] | [ ] | [ ] |
| C02 | Token consumption engine | `consumeToken()` — plan first then purchased, audit log, threshold warning. `maybeRenewPlanTokens()` — lazy monthly reset. | 2V | [ ] | [ ] | [ ] |
| C03 | Paddle webhook handler | POST /api/webhooks/paddle — HMAC-SHA256 verify. Handle subscription.created/updated/canceled/past_due + transaction.completed. | 2V | [ ] | [ ] | [ ] |
| C04 | Subscription portal + balance API | POST /api/subscription/portal → Paddle portal URL. GET /api/billing/balance → SXC balance from DB. | 1V | [ ] | [ ] | [ ] |
| C05 | Promo code system | POST /api/auth/redeem-promo — validate code, check expiry/uses, add to purchased_tokens. | 1V | [ ] | [ ] | [ ] |
| C06 | Paddle config + price mappings | `paddle.config.ts` — price IDs, tier mappings, token pack mappings. Single source of truth. | 0.5V | [ ] | [ ] | [ ] |

---

### C01 Details

**Task:** Scaffold billing module and create database tables
**Files:** `packages/server/src/modules/billing/` (full structure), `shared/db/migrations/010_billing.ts`
**AC:**
- [ ] Module: README.md, index.ts, billing.routes.ts, billing.service.ts, billing.schemas.ts, paddle.webhook.ts, paddle.config.ts, token-consumption.ts
- [ ] token_transactions table: id, userId, actionType, amount, balance, articleId, metadata (JSONB), createdAt
- [ ] promo_codes table: id, code (unique), tokenAmount, maxUses, usedCount, expiresAt
- [ ] promo_code_redemptions table: id, userId, promoCodeId, redeemedAt (unique userId+promoCodeId)
- [ ] Migration runs cleanly

### C02 Details

**Task:** Implement SXC token consumption and renewal engine
**Files:** `packages/server/src/modules/billing/token-consumption.ts`
**AC:**
- [ ] `consumeToken(userId, amount, actionType, metadata?)` → deduct plan_tokens first, then purchased_tokens. Return `{ success, remaining: { plan, purchased }, thresholdReached }`
- [ ] If insufficient balance → return `{ success: false, reason: 'insufficient_balance' }`
- [ ] Log every transaction to token_transactions table
- [ ] Threshold warning at 85% plan consumption
- [ ] `maybeRenewPlanTokens(userId)` → if month boundary crossed, reset plan_tokens to tier allocation, log 'plan_renewal' transaction
- [ ] All balance checks from DB (not JWT) — D042
- [ ] Unit tests for: consume from plan, consume across plan+purchased, insufficient, renewal

### C03 Details

**Task:** Paddle webhook handler with signature verification
**Files:** `packages/server/src/modules/billing/paddle.webhook.ts`
**AC:**
- [ ] POST /api/webhooks/paddle — public endpoint (no auth, signature-verified)
- [ ] HMAC-SHA256 signature verification using `PADDLE_WEBHOOK_SECRET`
- [ ] Handle `subscription.created` → update user plan + plan_tokens + subscriptionStatus + paddleCustomerId
- [ ] Handle `subscription.updated` → update plan tier + billing period
- [ ] Handle `subscription.canceled` → mark canceled, subscriptionEndsAt = period end
- [ ] Handle `subscription.past_due` → flag payment issue
- [ ] Handle `transaction.completed` → identify token pack by priceId, add to purchased_tokens, log transaction
- [ ] User lookup by paddleCustomerId OR customData.user_email
- [ ] All state changes are idempotent (safe to replay same webhook)
- [ ] Log all webhook events for audit

### C04 Details

**Task:** Subscription portal and balance API
**Files:** `packages/server/src/modules/billing/billing.routes.ts`, `billing.service.ts`
**AC:**
- [ ] POST /api/subscription/portal (authenticated) → call Paddle API, return portal URL
- [ ] GET /api/billing/balance (authenticated) → `{ planTokens, purchasedTokens, totalUsed, plan, renewsAt }`
- [ ] Balance returned from DB, NOT from JWT claims

### C05 Details

**Task:** Promo code redemption system
**Files:** `packages/server/src/modules/billing/billing.service.ts`
**AC:**
- [ ] POST /api/auth/redeem-promo `{ code }` (authenticated)
- [ ] Validate: code exists (case-insensitive), not expired, usedCount < maxUses, user hasn't redeemed before
- [ ] On success: add tokenAmount to purchased_tokens (NOT plan_tokens), increment usedCount, log transaction
- [ ] GOD admin can create promo codes via admin endpoint (future, not S09 scope — seed in migration for now)

### C06 Details

**Task:** Paddle configuration — single source of truth for price IDs
**Files:** `packages/server/src/modules/billing/paddle.config.ts`
**AC:**
- [ ] Maps Paddle price IDs (from env vars) to Vigil plan tiers
- [ ] Maps Paddle price IDs to token pack amounts
- [ ] `planFromPriceId(priceId)` → { plan, tokens, period }
- [ ] `tokenPackFromPriceId(priceId)` → { name, tokens }
- [ ] All price IDs come from env vars (PADDLE_PRICE_PRO_MONTHLY, etc.)

---

## Dependency Map

```
Track B (auth) ──→ C01 (scaffold) ──→ C02 (consumption engine)
                                  ──→ C03 (Paddle webhook) ──→ C04 (portal + balance)
                                  ──→ C05 (promo codes)
                   C06 (config) ── independent, can start Day 1
```

---

## Regression Gate

```bash
npx tsc --noEmit
npx vitest run modules/billing/
npm run build:server
# Smoke: consume token → check balance → webhook simulation → verify plan update
```

---

*Track C | Sprint 09 | Owner: [DEV:server] | Server Team*

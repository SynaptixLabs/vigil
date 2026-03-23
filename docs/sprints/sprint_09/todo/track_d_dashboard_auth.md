# Track D — Dashboard Auth Gate

**Sprint:** 09 | **Owner:** `[DEV:dashboard]` | **Priority:** P1 | **Vibes:** ~5V
**Branch:** `sprint-09/dashboard-auth`
**Team:** Dashboard Team
**Depends on:** Track B (auth API endpoints)

---

## Instructions — READ BEFORE STARTING

| Role | Checkbox | Report file |
|------|----------|-------------|
| DEV | `[x] Dev` | `reports/DEV_D_{task_id}_{YYYY-MM-DD}.md` |
| QA | `[x] QA` | `reports/QA_D_{task_id}_{YYYY-MM-DD}.md` |
| GBU | `[x] GBU` | `reports/DR_D_{task_id}_{YYYY-MM-DD}.md` |

**DONE = all 3 checked + all 3 reports exist.**

---

## Mission

Add authentication UI to the dashboard: login page, register page, email verify page, forgot password page, AuthGuard route wrapper, and settings page with profile + subscription management. All dashboard routes behind auth except landing and pricing.

**Refs:**
- `specs/ADR_S09_001_AUTH_STACK.md` (route contract)
- `specs/SPRINT_09_SPEC_security_and_architecture.md` §3.3
- **`docs/ui/UI_KIT.md`** — Design tokens, auth form patterns, empty states (MUST READ)
- **`docs/ui/VIGIL_UI_KIT.html`** — Visual reference for auth forms, inputs, buttons

---

## TODO

| ID | Task | AC | Vibes | Dev | QA | GBU |
|----|------|----|-------|-----|----|-----|
| D01 | Auth module scaffold + useAuth hook | Module at `modules/auth/`. `useAuth.ts` hook: token in memory, refresh via cookie, user context. API client auth interceptor. | 1.5V | [ ] | [ ] | [ ] |
| D02 | Login + Register + Verify pages | Login form (email/password), Register form (email/password/name), Verify email (code input). Error handling, loading states. | 1.5V | [ ] | [ ] | [ ] |
| D03 | Forgot/reset password pages | Forgot password (email input → "check your email"), Reset password (code + new password). | 0.5V | [ ] | [ ] | [ ] |
| D04 | AuthGuard + routing | `AuthGuard.tsx` wrapper. Redirect unauthenticated users to /auth/login. Redirect authenticated users away from auth pages. | 0.5V | [ ] | [ ] | [ ] |
| D05 | Settings page (profile + billing) | Profile section (name, email, change password). Billing section (current plan, SXC balance, "Manage Subscription" button → Paddle portal, token pack purchase CTA). | 1V | [ ] | [ ] | [ ] |

---

### D01 Details

**Task:** Scaffold auth module and implement auth state management
**Files:** `packages/dashboard/src/modules/auth/` (full structure), `shared/api/client.ts`
**AC:**
- [ ] `useAuth()` hook: `{ user, isAuthenticated, isLoading, login(), register(), logout(), refreshToken() }`
- [ ] Access token stored in React state / ref (NEVER localStorage)
- [ ] Refresh token handled automatically via HttpOnly cookie (browser sends it)
- [ ] API client interceptor: attach `Authorization: Bearer` header, auto-refresh on 401
- [ ] Auth context provider wraps entire app
- [ ] Module README.md with API docs

### D02 Details

**Task:** Login, register, and email verification pages
**Files:** `packages/dashboard/src/modules/auth/pages/LoginPage.tsx`, `RegisterPage.tsx`, `VerifyEmailPage.tsx`
**AC:**
- [ ] Login: email + password fields, "Forgot password?" link, "Don't have an account? Register" link, error display, loading spinner
- [ ] Register: email + password + name fields, password strength indicator, "Already have an account? Sign in" link
- [ ] Verify: 6-digit code input, "Resend code" button (rate limited), auto-redirect on success
- [ ] All forms use Zod validation (client-side matches server schemas)
- [ ] Accessible: labels, aria, keyboard nav, focus management

### D03 Details

**Task:** Forgot and reset password pages
**Files:** `packages/dashboard/src/modules/auth/pages/ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`
**AC:**
- [ ] Forgot: email input → submit → "Check your email for a reset code" (always, even if email doesn't exist)
- [ ] Reset: code + new password + confirm password → submit → redirect to login with success message
- [ ] Password validation: 8-128 chars, match confirmation

### D04 Details

**Task:** AuthGuard route protection
**Files:** `packages/dashboard/src/modules/auth/components/AuthGuard.tsx`, `App.tsx`
**AC:**
- [ ] `<AuthGuard>` wraps protected routes → redirect to /auth/login if not authenticated
- [ ] Auth pages (/auth/login, /auth/register) redirect to /dashboard if already authenticated
- [ ] Public routes (/, /pricing) accessible without auth
- [ ] Loading state while checking auth (don't flash login page)

### D05 Details

**Task:** Settings page with profile and billing sections
**Files:** `packages/dashboard/src/modules/billing/pages/SettingsPage.tsx`, `components/PlanCard.tsx`, `SXCBalance.tsx`
**AC:**
- [ ] Profile section: display name, email (read-only), change password button
- [ ] Billing section: current plan card, SXC balance (plan + purchased), renewal date
- [ ] "Manage Subscription" button → calls /api/subscription/portal → opens Paddle portal
- [ ] Token pack purchase section (or CTA linking to pricing)
- [ ] Balance fetched from API (not JWT) — D042

---

## Dependency Map

```
Track B (auth API) ──→ D01 (hook + client) ──→ D02 (login/register/verify)
                                            ──→ D03 (forgot/reset)
                                            ──→ D04 (AuthGuard)
                   Track C (billing API) ──→ D05 (settings page)
```

---

## Regression Gate

```bash
npx tsc --noEmit
npx vitest run
npm run build
# E2E: register → verify → login → access dashboard → settings → logout → redirect to login
```

---

*Track D | Sprint 09 | Owner: [DEV:dashboard] | Dashboard Team*

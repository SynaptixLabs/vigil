# Track E — SynaptixLabs Integration

**Sprint:** 09 | **Owner:** `[DEV:server]` | **Priority:** P1 | **Vibes:** ~4V
**Branch:** `sprint-09/platform`
**Team:** Server Team
**Depends on:** Track B (User schema)

---

## Instructions — READ BEFORE STARTING

| Role | Checkbox | Report file |
|------|----------|-------------|
| DEV | `[x] Dev` | `reports/DEV_E_{task_id}_{YYYY-MM-DD}.md` |
| QA | `[x] QA` | `reports/QA_E_{task_id}_{YYYY-MM-DD}.md` |
| GBU | `[x] GBU` | `reports/DR_E_{task_id}_{YYYY-MM-DD}.md` |

**DONE = all 3 checked + all 3 reports exist.**

---

## Mission

Implement the SynaptixLabs cross-product user identity model with explicit identity linking (NOT auto-merge by email — D040). Design for extraction to a shared auth service in Sprint 10+.

**Ref:** `specs/SPRINT_09_SPEC_production_launch.md` §3 (updated identity model)

---

## TODO

| ID | Task | AC | Vibes | Dev | QA | GBU |
|----|------|----|-------|-----|----|-----|
| E01 | synaptixlabs_id + product_enrollments schema | synaptixlabs_id (UUID) on users table. product_enrollments JSONB array. Migration. | 1V | [ ] | [ ] | [ ] |
| E02 | Identity linking API | POST /api/auth/link-request → initiate link. POST /api/auth/link-verify → confirm with password. | 2V | [ ] | [ ] | [ ] |
| E03 | Cross-product enrollment query | GET /api/auth/enrollments → list products this user is linked to. Designed for future dashboard widget. | 0.5V | [ ] | [ ] | [ ] |
| E04 | GOD admin protection | admin@synaptixlabs.ai immutable: cannot delete, cannot downgrade role, cannot unlink. Enforced in service layer. | 0.5V | [ ] | [ ] | [ ] |

---

### E01 Details

**Task:** Add cross-product fields to users table
**Files:** `packages/server/src/shared/db/schema.ts`, migration
**AC:**
- [ ] `synaptixlabs_id` TEXT UNIQUE DEFAULT gen_random_uuid() — generated on registration
- [ ] `product_enrollments` JSONB DEFAULT `[{"product":"vigil","enrolledAt":"...","localPlan":"free"}]`
- [ ] Migration additive (no breaking changes to existing users)

### E02 Details

**Task:** Explicit identity linking flow
**Files:** `packages/server/src/modules/auth/auth.service.ts`, `auth.routes.ts`
**AC:**
- [ ] POST /api/auth/link-request `{ targetProduct, targetEmail }` → generates a link code, stores in DB
- [ ] POST /api/auth/link-verify `{ code, password }` → user confirms with their Vigil password, both records get same synaptixlabs_id
- [ ] Link code expires in 15 minutes
- [ ] User can unlink: POST /api/auth/unlink `{ product }` → removes from product_enrollments
- [ ] No auto-merge by email. No shared credentials. No shared SXC until explicitly linked.
- [ ] After linking: product_enrollments updated on Vigil side. Other product handles its own side.

### E03 Details

**Task:** Enrollment query endpoint
**Files:** `packages/server/src/modules/auth/auth.routes.ts`
**AC:**
- [ ] GET /api/auth/enrollments (authenticated) → `{ synaptixlabsId, enrollments: [{ product, enrolledAt, localPlan }] }`
- [ ] Data from DB (not JWT)

### E04 Details

**Task:** GOD admin immutability enforcement
**Files:** `packages/server/src/modules/auth/auth.service.ts`
**AC:**
- [ ] `admin@synaptixlabs.ai` seeded with role=super_admin in migration
- [ ] Service layer checks: deleteUser() rejects if GOD admin, updateRole() rejects if target is GOD admin
- [ ] unlinkProduct() rejects if GOD admin
- [ ] Unit tests verify immutability

---

## Dependency Map

```
Track B (user schema) ──→ E01 (platform fields) ──→ E02 (linking API)
                                                ──→ E03 (enrollments query)
                                                ──→ E04 (GOD admin)
```

---

## Regression Gate

```bash
npx tsc --noEmit
npx vitest run modules/auth/  # linking tests live in auth module
npm run build:server
```

---

*Track E | Sprint 09 | Owner: [DEV:server] | Server Team*

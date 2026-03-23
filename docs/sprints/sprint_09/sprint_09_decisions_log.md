# Sprint 09 — Decisions Log

| ID | Decision | Date | Approved By | Notes |
|----|----------|------|-------------|-------|
| D030 | Vigil SXC pricing: Free (100 SXC) / Pro €19 (500 SXC) / Team €49 (2,000 SXC) / Enterprise (custom) | 2026-03-23 | FOUNDER | Token packs: Spark €9/200, Flow €29/1000, Surge €99/5000 |
| D031 | Auth: Express JWT middleware (not NextAuth) — JWT in vigil-server | 2026-03-23 | FOUNDER | Keeps auth in vigil-server, no new framework |
| D032 | Landing page: React routes in dashboard app (not separate Next.js) | 2026-03-23 | FOUNDER | Served from vigil-server at / |
| D033 | Credentials only in S09, Google OAuth deferred to S10 | 2026-03-23 | FOUNDER | Reduces scope, OAuth is additive |
| D034 | Design for shared auth extraction now, extract to shared service in S10 | 2026-03-23 | FOUNDER | synaptixlabs_id + products[] on User record |
| D035 | Sprint ships as-is (~55V), no sub-sprint split | 2026-03-23 | FOUNDER | Lead + 3 team |
| D036 | Password hashing: Argon2id (OWASP 2025 first choice), not bcrypt | 2026-03-23 | FOUNDER | 19 MiB memory, 2 iterations, 1 parallelism |
| D037 | JWT access token: 15-min expiry (OWASP recommendation), not 1h | 2026-03-23 | FOUNDER | With refresh token rotation (7d) |

| D038 | Analyst crew behind feature flag / beta gate at public launch | 2026-03-23 | CPTO (per external DR) | Developed in parallel, released separately from auth/billing spine |
| D039 | Async jobs: Postgres-backed jobs table + idempotent worker + polling API | 2026-03-23 | CPTO (per external DR) | No Redis/SQS. ADR S09-002 defines schema + flow |
| D040 | Cross-product identity: explicit linking, not auto-merge by email | 2026-03-23 | CPTO (per external DR) | Email equality is not safe identity merge strategy |
| D041 | Mobile-responsive landing page IS in scope for Sprint 09 | 2026-03-23 | CPTO (per external DR) | Reversed earlier exclusion — public SaaS needs mobile |
| D042 | JWT claims are convenience only — DB re-validate on plan/role/billing ops | 2026-03-23 | CPTO (per external DR) | ADR S09-001 defines the rule |

---

## ADR References

| ADR | Title | Resolves |
|-----|-------|----------|
| [ADR S09-001](specs/ADR_S09_001_AUTH_STACK.md) | Auth Stack Freeze | bcrypt/Argon2id inconsistency, Google OAuth confusion, JWT-as-authority risk |
| [ADR S09-002](specs/ADR_S09_002_ASYNC_JOBS.md) | Async Job Architecture | Missing job system definition |
| [ADR S09-003](specs/ADR_S09_003_DATA_GOVERNANCE.md) | Data Governance for AI Analysis | PII protection, chat containment, retention policy |

---

*Sprint 09 Decisions | Owner: CPTO + FOUNDER | 2026-03-23*

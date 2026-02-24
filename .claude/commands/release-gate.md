# /project:release-gate — Pre-Release Checklist

Run before any production deployment or public demo.

## Gate Checklist

### Code Quality
```
[ ] All tests pass (unit + integration + E2E)
[ ] No regressions vs previous release
[ ] TypeScript/Python type errors: NONE
[ ] Lint: CLEAN
[ ] Code coverage meets minimum (80%+)
```

### Security
```
[ ] No hardcoded secrets in codebase
[ ] .env files not committed
[ ] Dependencies audited (npm audit / pip audit)
[ ] Auth flows tested (login, registration, session expiry)
[ ] Rate limiting in place (if public-facing)
```

### Infrastructure
```
[ ] Environment variables set in prod (not just local)
[ ] Database migrations applied
[ ] Health endpoint responding: /health
[ ] Rollback plan defined
```

### Documentation
```
[ ] CHANGELOG.md updated
[ ] README accurate
[ ] API docs current (if applicable)
[ ] CLAUDE.md reflects current architecture
```

### Demo Readiness
```
[ ] Demo script written and tested
[ ] Test data seeded (if needed)
[ ] Screenshots/recordings taken
[ ] No debug logs or console.logs in output
```

## Final Sign-off

**Avi must explicitly approve before proceeding to production.**

Output: Full checklist with ✅/❌ + blockers list + GO/NO-GO recommendation.

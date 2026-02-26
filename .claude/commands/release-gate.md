# /project:release-gate — Vigil Pre-Release Checklist

Run before any sprint closure, public demo, or version tag. All items must be green.

## Gate Checklist

### Code Quality
```
[ ] npx vitest run → all pass
[ ] npx tsc --noEmit → clean across all tsconfigs
[ ] npm run build → succeeds, dist/ produced
[ ] npm run build:server → succeeds
[ ] npx eslint . → clean (warnings OK, errors NOT OK)
[ ] Code coverage ≥80% business logic, ≥60% infra
```

### Vigil-Specific Gates
```
[ ] Extension loads without errors: chrome://extensions → Vigil shows no errors
[ ] vigil-server health: GET localhost:7474/health → { status: "ok" }
[ ] MCP tools reachable by Claude Code (test vigil_list_bugs)
[ ] Dashboard loads: GET localhost:7474/dashboard → React SPA renders
[ ] Regression suite: npx playwright test tests/e2e/regression/ → all green
[ ] Full E2E suite: npx playwright test → all green
[ ] VIGILSession POST accepted: extension → vigil-server round-trip verified
[ ] Bug counter increments correctly (no duplicate IDs)
[ ] Bug files written to correct sprint folder with correct format
```

### Security
```
[ ] No hardcoded secrets: git grep -i "api_key\|secret\|token\|password" -- "*.ts" "*.tsx" "*.json"
[ ] vigil.config.json contains no API keys (secrets via env vars only)
[ ] .env files not staged: git status
[ ] .vigil/ is in .gitignore (runtime data must never commit)
```

### Documentation
```
[ ] CHANGELOG.md updated with version + date
[ ] README.md reflects current state
[ ] CLAUDE.md sprint number current
[ ] CODEX.md sprint status current
[ ] docs/03_MODULES.md current (no new capabilities undocumented)
[ ] docs/01_ARCHITECTURE.md matches actual implementation
```

### Demo Readiness
```
[ ] Demo script tested end-to-end (see sprint index §demo)
[ ] vigil.config.json.example committed with placeholder values
[ ] No console.log debug output in vigil-server routes
[ ] No TODO/FIXME without linked sprint item
```

### Sprint Closure Gate
```
[ ] All P0 and P1 bugs closed (sprint-review gate passed)
[ ] All regression tests: keep/archive decisions logged in BUG-XXX.md
[ ] Sprint decisions log complete (sprint_XX_decisions_log.md)
[ ] Next sprint index created (at minimum: sprint_XX+1_index.md skeleton)
```

## Final Sign-off

**Output:** Full checklist with ✅/❌ per item + list of blockers + **GO / NO-GO** recommendation.

**Avi ([FOUNDER]) must explicitly say GO before sprint is closed or a version tag is cut.**

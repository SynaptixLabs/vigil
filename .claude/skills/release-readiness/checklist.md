# Release gate checklist

## Code quality
- Unit tests green (npx vitest run)
- E2E / Playwright green (npx playwright test)
- Type checks clean (npx tsc --noEmit)
- Lint clean (npx eslint .)
- Build succeeds — extension (npm run build) + server (npm run build:server)

## Extension readiness
- Extension loads in Chrome without errors
- Manifest V3 compliance verified
- Shadow DOM for all injected UI
- rrweb recording starts/stops cleanly
- Session POST to vigil-server works end-to-end
- Bug/feature capture flow works

## Server readiness
- Health endpoint responds (GET /health → 200)
- Session ingestion works (POST /api/session)
- MCP tools respond correctly
- Dashboard serves at /dashboard
- Filesystem writes to .vigil/ work correctly

## Security
- No hardcoded secrets in codebase
- No committed .env files
- API keys in env vars only
- vigil.config.json contains no secrets

## Documentation / operations
- Sprint docs current
- Bug tracker up to date
- Latest QA + sprint report available

## Decision
- GO only if no critical blockers remain
- Avi approval mandatory for production

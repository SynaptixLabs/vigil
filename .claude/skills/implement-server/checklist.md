# Server implementation checklist

## Preflight
- Confirm assigned TODO / acceptance criteria
- Confirm affected areas (routes, MCP tools, filesystem, config)
- Search for reusable filesystem modules, route patterns
- Flag API contract changes, MCP tool changes, config schema changes

## Implementation
- Keep logic in existing module boundaries (routes/, mcp/, filesystem/)
- Use config.ts for all paths and settings — no hardcoded values
- Use logger, not console.log
- Typed interfaces on public functions and route handlers
- vigil-server never owns LLM logic — proxy to AGENTS platform at port 8000

## Testing
- `npx tsc --noEmit` — zero TS errors
- `npx vitest run` — unit tests pass
- `npm run build:server` — clean build
- `GET /health → 200` — server health check passes
- Regression tests green for any bug fix

## Handoff
- Files changed
- Tests added/updated
- Commands run + pass/fail
- Health check status
- Risks / blockers
- Suggested QA scope

# Dashboard implementation checklist

## Preflight
- Confirm assigned TODO / acceptance criteria
- Identify reusable components, hooks, API clients
- Flag routing/layout/dependency changes before editing

## Implementation
- Reuse existing React components and hooks
- API calls through vigil-server REST API only (port 7474)
- No direct filesystem access
- Keep API wiring inside approved client layers
- Preserve existing UX patterns unless the TODO changes them

## Testing
- `npx tsc --noEmit` — zero TS errors
- Playwright coverage for new/changed user-facing flows
- Verify no console errors on exercised flows
- Screenshot baselines for visual deliverables when relevant

## Handoff
- Files changed
- Flows validated
- Tests/screenshots added
- Commands run + result
- Risks / blockers

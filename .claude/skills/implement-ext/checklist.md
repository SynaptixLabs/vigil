# Extension implementation checklist

## Preflight
- Confirm assigned TODO / acceptance criteria
- Confirm affected areas (background, content, popup, shared)
- Search for reusable types, constants, protocol messages
- Flag messaging protocol changes, manifest changes, storage schema changes

## Implementation
- Shadow DOM for ALL injected UI (control bar, bug editor, popups)
- MV3 compliance — no V2 APIs
- rrweb for recording — never build custom DOM capture
- Dexie.js for IndexedDB — never use raw IDB API
- Use shared types from `src/shared/`
- Use message protocol from `src/shared/protocol`
- No CSS leakage — all styles inside Shadow DOM

## Testing
- `npx tsc --noEmit` — zero TS errors
- `npx vitest run` — unit tests pass
- `npm run build` — clean build to dist/
- Extension loads in Chrome without console errors
- Regression tests green for any bug fix

## Handoff
- Files changed
- Tests added/updated
- Commands run + pass/fail
- Chrome load status
- Risks / blockers
- Suggested QA scope

# Track C — Extension UX (Bug Auto-Complete)

**Sprint:** 08 | **Owner:** DEV:ext | **Priority:** P1 | **Vibes:** ~3V
**Branch:** `sprint-08/agents-integration`
**Depends on:** Track B (B01 must ship first)

---

## Mission

Wire the bug editor's auto-complete to use live LLM suggestions from vigil-server. User types partial bug title → LLM pre-fills title + steps-to-reproduce. Must work gracefully when LLM is unavailable.

---

## TODO

| ID | Task | AC | Vibes | Status |
|----|------|----|-------|--------|
| C01 | Bug auto-complete in BugEditor (title + steps pre-fill from LLM) | User types ≥3 chars in title → debounced call to `/api/vigil/suggest` → dropdown shows suggestions. Tab/Enter accepts. **If AGENTS offline: no dropdown, no error — silent fallback (D006).** | 3V | [ ] Dev [ ] QA [ ] GBU |

### C01 Details
- Modify `BugEditor.tsx` (or equivalent bug editor component)
- Debounce: 500ms after last keystroke
- Request: `POST localhost:7474/api/vigil/suggest` with `{ bugTitle: partialText }`
- Response: `{ suggestions: [{ title, steps, severity, confidence }] }`
- UI: dropdown below title input, max 3 suggestions
- Accept: Tab/Enter fills title + steps fields
- Graceful degradation:
  - If fetch fails → no dropdown, no error message
  - If response empty → no dropdown
  - Loading indicator while waiting (subtle spinner)
- Shadow DOM: auto-complete dropdown must be inside Shadow DOM (existing pattern)
- `data-testid`: `bug-autocomplete-dropdown`, `bug-autocomplete-item-{N}`

## Regression Gate

```bash
npx vitest run                     # All extension tests pass
npx tsc --noEmit                   # TypeScript clean
npm run build                      # Extension builds, dist/ produced
# Load extension in Chrome → create bug → type title → verify no crash
```

## Commands

```bash
npm run dev                        # Watch build (CRXJS)
npm run build                      # Production build → dist/
npx vitest run                     # Unit tests
```

---

*Track C | Sprint 08 | Owner: [DEV:ext] | Blocked by Track B*

# Refine Content Module — AGENTS.md (Tier-3)

> **Module:** `src/content/`
> **Tag:** `[DEV:content]`
> **Owner:** Extension Dev agent

---

## Scope

The Content module is the Chrome Extension **content script**. It runs in the context of the target web page and provides:
- rrweb DOM recording (start/stop/pause)
- Floating control bar (Record/Pause/Stop/Screenshot/Bug buttons)
- Inline bug/feature editor with auto-context capture
- Action tracking (extracting user intent from rrweb events)
- Re-injection on page navigation within the same session

## Owns

- `src/content/content-script.ts` — Main entry point, rrweb lifecycle
- `src/content/recorder.ts` — rrweb injection + control
- `src/content/action-extractor.ts` — rrweb event → action extraction
- `src/content/selector-engine.ts` — Smart CSS selector generation
- `src/content/overlay/mount.ts` — Shadow DOM container management
- `src/content/overlay/ControlBar.tsx` — Floating overlay component (Shadow DOM)
- `src/content/overlay/BugEditor.tsx` — Inline bug/feature form (Shadow DOM)
- `src/content/styles/overlay.css` — Scoped CSS for Shadow DOM components

## Dependencies

- **Imports from:** `src/shared/` (types, messages, constants)
- **Imported by:** None (injected by Chrome into target pages)
- **Chrome APIs:** `chrome.runtime` (messaging to background)
- **External:** `rrweb` (recording), `react` + `react-dom` (overlay UI)

## Constraints

- ALL UI must be inside Shadow DOM — zero CSS leakage into target app
- Must re-inject on SPA navigation (listen for URL changes)
- rrweb recording must persist across page navigations within session
- Content script size matters — keep bundle lean
- No direct IndexedDB access — send data to Background via messages
- Must handle target app interference gracefully (z-index, event bubbling)

## Testing

- Unit tests for action-extractor (event → action extraction)
- Unit tests for selector-engine logic
- E2E tests via Playwright for control bar + bug editor (ADR-008)

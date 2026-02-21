# Refine Background Module — AGENTS.md (Tier-3)

> **Module:** `src/background/`
> **Tag:** `[DEV:background]`
> **Owner:** Extension Dev agent

---

## Scope

The Background module is the Chrome Extension **service worker**. It is the central hub for:
- Session lifecycle management (create, pause, resume, stop)
- Message routing between Popup ↔ Content Script
- Screenshot capture via `chrome.tabs.captureVisibleTab()`
- Service worker keep-alive during active recording sessions

## Owns

- `src/background/service-worker.ts` — Main entry point
- `src/background/session-manager.ts` — Session state machine
- `src/background/message-handler.ts` — Chrome message handling
- `src/background/screenshot.ts` — Screenshot capture wrapper
- `src/background/keep-alive.ts` — chrome.alarms-based keep-alive

## Dependencies

- **Imports from:** `src/core/` (storage layer), `src/shared/` (types, messages, constants)
- **Imported by:** None (entry point only; communicates via Chrome messaging)
- **Chrome APIs:** `chrome.runtime`, `chrome.tabs`, `chrome.alarms`, `chrome.action`

## Constraints

- Service worker may go idle after 30 seconds — use `chrome.alarms` for keep-alive during active sessions
- No DOM access — service worker runs in isolated context
- All state persisted to IndexedDB (via Core storage) — service worker restart must recover state
- Message handling must be synchronous return or use `sendResponse` with `return true`

## Testing

- Unit tests for session state machine logic
- Unit tests for message routing
- Integration test for session lifecycle (create → record → pause → stop → report)

# Refine Popup Module — AGENTS.md (Tier-3)

> **Module:** `src/popup/`
> **Tag:** `[DEV:popup]`
> **Owner:** Extension Dev agent

---

## Scope

The Popup module is the Chrome Extension **popup UI** (React app). It provides:
- Session list (view all sessions with metadata)
- New session creation form (name, description, auto-generated ID)
- Session actions (delete, export, view replay)
- Extension status indicator

## Owns

- `src/popup/popup.html` — Popup HTML shell + React mount point
- `src/popup/index.tsx` — React 18 createRoot entry
- `src/popup/App.tsx` — Root React component
- `src/popup/pages/` — SessionList, NewSession, SessionReport, Settings
- `src/popup/components/` — SessionCard, Timeline, ExportButtons

## Dependencies

- **Imports from:** `src/shared/` (types, messages, constants)
- **Imported by:** None (entry point, communicates via Chrome messaging)
- **Chrome APIs:** `chrome.runtime` (messaging to background)
- **External:** `react`, `react-dom`, `lucide-react` (icons)

## Constraints

- Popup closes when user clicks away — all state must be persisted via Background/Core
- Popup size: ~400px wide, scrollable height
- Communicate with Background via `chrome.runtime.sendMessage` — never access IndexedDB directly
- Keep it fast: popup must load < 200ms
- Use Tailwind for styling — no custom CSS files

## Testing

- Component tests for SessionList, NewSessionForm, SessionCard (Vitest + Testing Library)

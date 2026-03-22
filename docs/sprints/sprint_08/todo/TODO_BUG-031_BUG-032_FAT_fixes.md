# TODO — BUG-031 + BUG-032 FAT Fixes

> Sprint 08 | Assigned: [DEV:ext] | Priority: P1 (FAT blockers)
> Created: 2026-03-22 by [CPTO]

---

## BUG-031 — Projects not displayed in popup

### Task
Investigate and fix the extension popup not showing projects from vigil-server.

### AC
- [ ] When vigil-server is running with projects, popup lists them in the project selector
- [ ] When server is unreachable, popup shows clear error message
- [ ] When no projects exist, popup shows "No projects yet" with dashboard link

### Investigation checklist
1. Check if `fetchProjects()` in `src/popup/pages/NewSession.tsx` is called on popup open
2. Check if `GET_PROJECTS` message reaches background handler (`src/background/message-handler.ts`)
3. Check if `GET /api/projects` response is correct format from server
4. Check if popup main view (session list) also needs project fetch — or only NewSession form has it
5. Check `vigil.config.json` has correct `serverUrl` / `serverPort` for the running server

### Files
- `src/popup/pages/NewSession.tsx` — project fetch logic
- `src/popup/` — all popup components (check main view too)
- `src/background/message-handler.ts` — GET_PROJECTS handler
- `packages/server/src/routes/projects.ts` — server endpoint
- `vigil.config.json` — server URL config

### Checkboxes
- [ ] Dev — fix committed
- [ ] QA — tested against AC
- [ ] GBU — quality reviewed

---

## BUG-032 — Control bar hidden behind app modals (GOD MODE)

### Task
Ensure the Vigil control bar ALWAYS remains visible on top of everything the host app renders — modals, dialogs, overlays, full-screen elements. This is "GOD MODE" monitoring.

### AC
- [ ] Control bar stays visible when app shows modal dialogs
- [ ] Control bar stays visible when app uses `<dialog>.showModal()` (top-layer API)
- [ ] Control bar stays visible when app has full-viewport overlays with high z-index
- [ ] MutationObserver re-appends host element when new overlay elements appear
- [ ] Popup has fallback controls (at minimum: a "resurface control bar" button)

### Implementation plan
1. **MutationObserver on body** — detect new children with high z-index or `<dialog>` elements, re-append `#refine-root` as last child of body
2. **Periodic DOM check** — every few seconds, verify `#refine-root` is the last positioned element in body; if not, re-append
3. **Popup resurface button** — add a button in the popup that sends a message to content script to forcefully re-mount the overlay

### Files
- `src/content/overlay/mount.ts` — host element creation + mounting
- `src/content/content-script.ts` — message handling, lifecycle
- `src/content/styles/overlay.css` — z-index styling
- `src/popup/` — add resurface button

### Checkboxes
- [ ] Dev — fix committed
- [ ] QA — tested against AC
- [ ] GBU — quality reviewed

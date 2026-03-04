# Sprint 07 — Founder Acceptance Testing Walkthrough

**For:** Avi ([FOUNDER])
**Date:** 2026-03-03
**Prepared by:** [CPTO]
**Sprint goal:** Project-oriented sessions + dashboard overhaul + Neon/Vercel infrastructure

---

## What's New in Sprint 07

| Area | Change | Ticket |
|---|---|---|
| **Extension** | Project-oriented sessions: required project field, auto-sprint, persistent history | S07-16 |
| **Extension** | Session persistence — survives service worker restart via `chrome.storage.local` | S07-12 |
| **Extension** | Ghost session recovery — end orphaned sessions from side panel | S07-18 |
| **Extension** | Shortcut fix: bug editor is now **Alt+Shift+G** (was Ctrl+Shift+B, conflicted with Chrome) | S07-19 |
| **Extension** | BUG-EXT-001 codegen fix + BUG-EXT-002 btn-publish testid | S07-20, S07-21 |
| **Server** | Shared types package (`@synaptix/vigil-shared`) — single source for all schemas | S07-11 |
| **Server** | Session read API: `GET /api/sessions` (list + detail) | S07-16b |
| **Server** | Neon PostgreSQL backend — bugs, features, sessions, sprints in managed Postgres | S07-15 |
| **Infra** | Vercel deployment — `vigil-two.vercel.app` (serverless, storage=neon) | S07-14 |
| **Dashboard** | Complete overhaul: project/sprint/session nav, filters, screenshot display | S07-17a |
| **Dashboard** | Session timeline + recording replay viewer | S07-17b |
| **Tests** | 354 total (266 root vitest + 88 dashboard vitest), 44 new HTTP integration tests | S07-13, S07-22 |

---

## Prerequisites

**Cloud backend:** vigil-server is deployed to Vercel at **https://vigil-two.vercel.app** with Neon PostgreSQL. The extension POSTs session data **directly to Vercel** (configured via `serverUrl` in `vigil.config.json`). No local server needed for the core capture+POST flow.

**Local server only needed for dashboard:** The management dashboard at `localhost:7474/dashboard` requires `npm run dev:server`. Dashboard is NOT available on Vercel (static files aren't bundled in serverless).

**You need 1-2 terminals** and Chrome. (1 for demo app; optionally 1 for local server if testing dashboard.)

**Config check:** Verify `vigil.config.json` has `"sprintCurrent": "07"` and `"serverUrl": "https://vigil-two.vercel.app"`.

If `dist/` is stale, rebuild:
```powershell
cd C:\Synaptix-Labs\projects\vigil
npm run build              # Extension -> dist/
```

---

## Step 0 — Verify Vercel Is Live

Open browser -> `https://vigil-two.vercel.app/health`

Expected:
```json
{ "status": "ok", "version": "2.0.0", "storage": "neon", "llmMode": "mock", "port": 7474 }
```

---

## Step 1 — Start Demo App "TaskPilot" (Terminal 1)

```powershell
cd C:\Synaptix-Labs\projects\vigil\demos\refine-demo-app
npm run dev
```

Wait for: `Local: http://localhost:39000/`

> **Note:** Port is `39000` (not 3900).

Open browser -> `http://localhost:39000`
- You'll see a **login page** — click Login (any credentials, it's a mock)
- You'll see a task management dashboard with sidebar, task list, settings
- **This is your test target** — the app you'll test Vigil against

---

## Step 2 — Load Extension in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (toggle top-right)
3. Click **Load unpacked**
4. Select: `C:\Synaptix-Labs\projects\vigil\dist`
5. Vigil extension should appear with the icon in toolbar

---

## Keyboard Shortcuts Reference

| Shortcut | Action | Notes |
|---|---|---|
| **SPACE** | Toggle recording on/off | Only when NOT focused on input/textarea/select |
| **Alt+Shift+V** | Toggle recording on/off | Works globally (Chrome command) |
| **Ctrl+Shift+S** | Capture screenshot | Saves to session snapshots |
| **Alt+Shift+G** | Open bug editor | **CHANGED from Sprint 06** (was Ctrl+Shift+B) |

---

## Step 4 — Test the Full Flow

### 4A — Create a Project-Oriented Session (NEW in S07)

1. Navigate to `http://localhost:39000` (TaskPilot demo)
2. Click the **Vigil extension icon** in toolbar — the **side panel** should open
3. Click **New Session**
4. Fill in the session form:

```
Project: TaskPilot
Session Name: FAT Round 3
Description: Founder acceptance testing Sprint 07
```

> **What's new:** The session now requires a **project field**. Sprint is auto-detected from `vigil.config.json`. Session history persists across browser restarts (chrome.storage.local).

5. Submit — you should see the **control bar** appear on the page

**Verify in side panel:**
- [ ] Session appears in session history list
- [ ] Session shows project name and sprint
- [ ] Timer is running

### 4B — Test Recording (SPACE toggle + Alt+Shift+V)

1. Make sure you're on the TaskPilot page, **not** focused on an input field
2. Press **SPACE** -> recording should start (control bar shows recording indicator)
3. Click around TaskPilot — navigate to Dashboard, Tasks, open a task detail
4. Press **SPACE** again -> recording should pause
5. **SPACE guard test:** Click into a text input field on TaskPilot -> press SPACE -> should type a space normally (no recording toggle)
6. Click outside the input -> press **Alt+Shift+V** -> recording should toggle

### 4C — Test Screenshots + Bug Editor

1. While session is active, navigate to a TaskPilot page
2. Press **Ctrl+Shift+S** -> screenshot captured (check side panel for snapshot count)
3. Now press **Alt+Shift+G** -> bug editor should open
4. Bug editor should show:
   - Screenshot of current page attached
   - URL pre-filled
   - Fields for title, description, severity
5. Fill in a test bug:
   - Title: `FAT3 test bug from acceptance testing`
   - Severity: P2
   - Description: `Testing Sprint 07 acceptance flow`
6. Submit the bug

### 4D — Test Feature Logging

1. In the side panel, find the option to log a feature request
2. Log a test feature:
   - Title: `FAT3 test feature request`
   - Type: ENHANCEMENT
   - Description: `Testing feature capture flow`
3. Submit

### 4E — End Session -> POST to Vercel

1. Click **End Session** in the side panel / control bar
2. The session data (including your test bug and feature) is POSTed directly to `vigil-two.vercel.app/api/session`

### 4F — Verify Data Persistence

After ending session, verify data landed in Neon via the Vercel API:

```
https://vigil-two.vercel.app/api/sessions
https://vigil-two.vercel.app/api/bugs?sprint=07
```

Your new session and bug should appear in the results.

---

## Step 5 — Test the Dashboard (Overhauled in S07)

**Requires local server.** Start it first if you haven't:
```powershell
cd C:\Synaptix-Labs\projects\vigil
npm run dev:server   # → http://localhost:7474 (storage: neon)
```

Then open `http://localhost:7474/dashboard`.

> Dashboard is local-only — not available on Vercel (static files aren't bundled in serverless). P2 follow-up.

### 5A — Navigation & Layout

- [ ] Dashboard loads (no blank page, no console errors)
- [ ] Health indicator shows green dot with `v2.0.0` / `mock` / storage type
- [ ] Sprint selector shows available sprints (including `sprint_07`)
- [ ] Navigation works: Bugs, Features, Sessions tabs

### 5B — Bug Management

- [ ] Bug table shows your test bug
- [ ] Severity badge shows correct level (P2)
- [ ] Severity dropdown — change from P2 to P1 (should PATCH to server)
- [ ] Status toggle — mark as fixed (if supported)

### 5C — Session Browser (NEW in S07)

- [ ] Sessions list shows your acceptance test session
- [ ] Click session to see detail view
- [ ] Session detail shows: timeline, recordings, snapshots, bugs, features
- [ ] Screenshot thumbnails display correctly
- [ ] Recording replay viewer works (if recordings were captured)

### 5D — Feature Management

- [ ] Features tab shows your test feature
- [ ] Feature details display correctly

---

## Step 6 — Test Ghost Session Recovery (NEW in S07)

1. Start a new session (step 4A)
2. Start recording
3. **Kill the service worker:** Go to `chrome://extensions` -> find Vigil -> click "service worker" link -> click "terminate" in DevTools
4. Wait a moment, then click the Vigil extension icon again
5. Side panel should show the **orphaned session** with option to recover or end it
6. End the ghost session — it should POST to server

---

## Step 7 — Test MCP Tools (Optional — Claude Code Integration)

Requires local vigil-server running (`npm run dev:server`).

1. In a Claude Code session in this repo, try:
   - `/project:bug-log` — should be able to interact with bugs
   - Ask Claude: "List all vigil bugs for sprint 07"
   - Claude should use `vigil_list_bugs` MCP tool

---

## Step 8 — Dashboard Dev Mode (Optional)

If you want to see the dashboard with hot reload:

```powershell
npm run dev:dashboard
```

Opens at `http://localhost:5173/dashboard/` with Vite HMR.
Proxies API calls to `:7474` automatically (requires local server).

---

## Acceptance Checklist

| # | Test | Pass? |
|---|---|---|
| | **Server (Vercel — vigil-two.vercel.app)** | |
| 1 | `GET /health` returns 200 with `{ status: "ok", version: "2.0.0", storage: "neon" }` | [ ] |
| 2 | `/api/bugs`, `/api/sessions`, `/api/sprints` all return data from Neon | [ ] |
| | **Extension — Basics** | |
| 3 | Extension loads in Chrome without errors (no red badge on `chrome://extensions`) | [ ] |
| 4 | Clicking extension icon opens **side panel** (not popup) | [ ] |
| | **Extension — Project Sessions (S07-16)** | |
| 5 | New Session form requires project name | [ ] |
| 6 | Sprint auto-detected from config | [ ] |
| 7 | Session appears in side panel history after creation | [ ] |
| 8 | Control bar appears on target page | [ ] |
| | **Recording** | |
| 9 | SPACE toggles recording (not in input fields) | [ ] |
| 10 | SPACE types normally when focused on input field (guard works) | [ ] |
| 11 | Alt+Shift+V toggles recording (alternative shortcut) | [ ] |
| | **Bug Capture** | |
| 12 | Ctrl+Shift+S captures screenshot | [ ] |
| 13 | **Alt+Shift+G** opens bug editor (NEW shortcut) | [ ] |
| 14 | Bug editor shows screenshot preview + pre-filled URL | [ ] |
| 15 | Bug submission works (fill title, severity, description -> submit) | [ ] |
| | **Session End** | |
| 16 | End Session POSTs to Vercel -> Neon | [ ] |
| 17 | Session visible at `vigil-two.vercel.app/api/sessions` after POST | [ ] |
| 18 | Bug visible at `vigil-two.vercel.app/api/bugs?sprint=07` after POST | [ ] |
| | **Session Persistence (S07-12)** | |
| 19 | Session survives service worker restart (Step 6) | [ ] |
| 20 | Ghost session recovery works (orphaned session can be ended) | [ ] |
| | **Dashboard (S07-17 — requires local server)** | |
| 21 | Dashboard loads at `localhost:7474/dashboard` (no blank page) | [ ] |
| 22 | Health indicator shows green + version + storage type | [ ] |
| 23 | Sprint selector shows available sprints | [ ] |
| 24 | Bug table shows your test bug with correct severity | [ ] |
| 25 | Sessions list shows your test session | [ ] |
| 26 | Session detail view: timeline, snapshots, recordings | [ ] |
| 27 | Screenshot thumbnails display | [ ] |
| | **Cloud already verified in Step 0** | |
| 28 | Vercel `/health` returns `storage: "neon"` | [ ] |

---

## Sprint 06 Known Issues — Verify Fixed

These were noted in Sprint 06 FAT. Verify they're resolved:

| Issue | Sprint 06 Note | Expected Fix |
|---|---|---|
| SPACE in bug editor text fields | Started/stopped recording while typing in Title/Description | S07 guard should prevent toggle in input fields |
| Ctrl+Shift+B conflicted with Chrome | Browser intercepted the shortcut | Now **Alt+Shift+G** (S07-19) |
| No "End Session" button | Only had "STOP RECORD" | Session end should be explicit in side panel |
| Session not visible in dashboard | Data stayed in extension only | Session POST to server + dashboard session browser (S07-16b, S07-17a) |

---

## If Something Breaks

| Problem | Check |
|---|---|
| Vercel `/health` fails | Check https://vercel.com/synaptixlabs-projects/vigil — Deployment Protection must be disabled |
| Vercel returns HTML instead of JSON | Deployment Protection is enabled — disable in Project Settings |
| Extension won't load | Rebuild: `npm run build`. Check `chrome://extensions` for errors |
| Dashboard blank (local) | Rebuild: `npm run build:dashboard`. Is local server running? Check browser console |
| Local server won't start | Is port 7474 already in use? `netstat -ano \| findstr 7474` |
| POST fails on End Session | Check extension is configured to POST to correct server URL |
| Demo app won't start | `cd demos\refine-demo-app && npm install && npm run dev` |
| Alt+Shift+G not working | Check `chrome://extensions/shortcuts` — may need manual assignment |
| SPACE not working | Make sure you're not focused on an input/textarea/select/contentEditable |

---

## What You Have

| Component | Location | Notes |
|---|---|---|
| **vigil-server (cloud)** | `vigil-two.vercel.app` | Primary — Neon PostgreSQL backend |
| **Demo app (TaskPilot)** | `demos/refine-demo-app/` | Local, port 39000 |
| **Extension** | `dist/` (load unpacked) | Chrome extension |
| **Config** | `vigil.config.json` | sprintCurrent, serverPort, llmMode |
| **Dashboard** | `localhost:7474/dashboard` | Requires local server (`npm run dev:server`) |
| **Neon DB** | Neon console | Cloud PostgreSQL |
| **Vercel project** | `vercel.com/synaptixlabs-projects/vigil` | Deployment management |

---

*Walkthrough prepared: 2026-03-03 | [CPTO]*

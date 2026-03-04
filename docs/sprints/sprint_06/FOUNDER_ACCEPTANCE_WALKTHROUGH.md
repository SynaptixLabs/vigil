---- 27/02/2026
🟦 1. [DEV:ext] — Extension Developer
🟦 2. [DEV:server] — Server Developer
🟦 3. [DEV:dashboard] — Dashboard Developer
🟦 7. [INFRA] — Infrastructure
NS
🟦 6. [CTO] — Chief Technology Officer / Architecture
🟦 5. [QA] — Quality Assurance
🟦 4. [DEV:agents] — AGENTS Platform Developer

# Sprint 06 — Founder Acceptance Testing Walkthrough

**For:** Avi ([FOUNDER])
**Date:** 2026-02-26
**Prepared by:** [CPTO]

---

## Prerequisites

You need **3 terminals** open, all in `C:\Synaptix-Labs\projects\vigil`.

---

## Step 0 — Verify Builds Are Clean

```powershell
cd C:\Synaptix-Labs\projects\vigil

# Type check
npx tsc --noEmit

# Unit tests (should be 169/169)
npx vitest run

# Extension is already built (dist/ exists)
# Dashboard is already built (packages/server/public/ exists)
```

If `dist/` is stale, rebuild:
```powershell
npm run build              # Extension → dist/
npm run build:dashboard    # Dashboard → packages/server/public/
```

---

## Step 1 — Start vigil-server (Terminal 1)

```powershell
npm run dev:server
```

Wait for:
```
[vigil-server] running on http://localhost:7474
[vigil-server] health: http://localhost:7474/health
[vigil-server] LLM mode: mock
```

**Quick verify:** Open browser → `http://localhost:7474/health`
Expected:
```json
{ "status": "ok", "version": "2.0.0", "llmMode": "mock", "port": 7474 }
```

---

## Step 2 — Start Demo App "TaskPilot" (Terminal 2)

```powershell
cd demos\refine-demo-app
npm run dev
```

Wait for: `Local: http://localhost:39000/`

Open browser → `http://localhost:39000`
- You'll see a **login page** — click Login (any credentials, it's a mock)
- You'll see a task management dashboard with sidebar, task list, settings
- **This is your test target** — the app you'll test Vigil against

---

## Step 3 — Load Extension in Chrome

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
| **Ctrl+Shift+R** | Toggle recording on/off | Works globally (Chrome command) |
| **Ctrl+Shift+S** | Capture screenshot | Saves to session snapshots |
| **Ctrl+Shift+B** | Screenshot + open bug editor | Most common QA shortcut |

---

```
Avidor Notes: In bug reports POPUP - "SPACE" starts and stops recording when in the edit boxes - i.e. in Title / Description
```

## Step 4 — Test the Full Flow

### 4A — Create a Session

1. Navigate to `http://localhost:39000` (TaskPilot demo)
2. Click the **Vigil extension icon** in toolbar (popup opens)
3. Click **New Session** (or equivalent start button)
4. Fill in session name (e.g. "Acceptance Test 1"), optionally add description
5. Submit — you should see the **control bar** appear at the top/bottom of the page

```
Name: TaskPilot
Session Name: Acceptance Test 1
Description: Acceptance  testing for Vigil 
Tags: vigil, Acceptance  
```

### 4B — Test Recording (SPACE toggle + Ctrl+Shift+R)

1. Make sure you're on the TaskPilot page, **not** focused on an input field
2. Press **SPACE** → recording should start (control bar shows recording indicator)
3. Click around TaskPilot — navigate to Dashboard, Tasks, open a task detail
4. Press **SPACE** again → recording should pause
5. **SPACE guard test:** Click into a text input field on TaskPilot → press SPACE → should type a space normally (no recording toggle)
6. Click outside the input → press **Ctrl+Shift+R** → recording should toggle (alternative shortcut)

### 4C — Test Screenshots (Ctrl+Shift+S and Ctrl+Shift+B)

1. While session is active, navigate to a TaskPilot page
2. Press **Ctrl+Shift+S** → screenshot captured silently (stored in session snapshots)
3. Now press **Ctrl+Shift+B** → screenshot captured AND bug editor opens
4. Bug editor should show:
   - Screenshot of current page attached
   - URL pre-filled
   - Fields for title, description, severity, steps to reproduce
5. Fill in a test bug:
   - Title: `Test bug from acceptance testing`
   - Severity: P2
   - Description: anything
6. Submit the bug

```
Avidor Notes: Seems like CTRL+SHIFT+S STILL doesn't capture and Ctrl+Shift+B only opens the bug editor but doesn't capture (I see NO indication for capture - like when I use the capture key)
In LOG BUG/FEATURE I would change SAVE to SUBMIT
```


### 4D — End Session → POST to Server

1. Click **End Session** in the Vigil controls
2. Watch **Terminal 1** (vigil-server) — you should see the POST request logged
3. The session data (including your test bug) is sent to the server

```
Avidor Notes: 
(1) I don't have **End Session** button - just "STOP RECORD" 
(2) I see session information in the chrome extension with the ability to play and load data - this is the OLD uysability; I don't see the session in Vigil dashboard 
```

### 4E — Verify Filesystem Writes

After ending session, check these locations:

```powershell
# Session JSON (raw artifact)
ls .vigil\sessions\
# → Should contain a .json file with your session ID

# Bug file
ls docs\sprints\sprint_06\BUGS\open\
# → Should contain BUG-001.md (or next available ID)

# Check bug content
cat docs\sprints\sprint_06\BUGS\open\BUG-001.md
# → Should show your test bug with correct format
```

Expected bug format:
```markdown
# BUG-001 — Test bug from acceptance testing
## Status: OPEN
## Severity: P2
## Sprint: 06
## Discovered: 2026-02-26 via vigil-session: [session-id]
...
```

---

## Step 5 — Test the Dashboard

1. Open browser → `http://localhost:7474/dashboard`
2. **What to verify:**
   - [ ] Dashboard loads (no blank page, no errors)
   - [ ] Sprint selector shows "sprint_06" (top of page)
   - [ ] Bug table shows your test bug (BUG-001)
   - [ ] Health indicator shows green dot with `v2.0.0` / `mock`
   - [ ] Severity badge shows P2 for your bug

### 5A — Test Row Actions

1. In the bug table, find your test bug
2. **Severity dropdown** — change from P2 to P1
   - Should update immediately (PATCH request to server)
3. **Status toggle** — click "Mark Fixed"
   - Bug status should change
   - File should move from `BUGS/open/` to `BUGS/fixed/`

### 5B — Verify Server-Side

```powershell
# After marking fixed:
ls docs\sprints\sprint_06\BUGS\fixed\
# → BUG-001.md should be here now

ls docs\sprints\sprint_06\BUGS\open\
# → BUG-001.md should be gone
```

---

## Step 6 — Test MCP Tools (Optional — Claude Code Integration)

If you want to verify MCP tools work with Claude Code:

1. vigil-server must be running (Terminal 1)
2. In a Claude Code session in this repo, try:
   - `/project:bug-log` — should be able to interact with bugs
   - Ask Claude: "List all vigil bugs for sprint 06"
   - Claude should use `vigil_list_bugs` MCP tool

---

## Step 7 — Dashboard Dev Mode (Optional)

If you want to see the dashboard with hot reload:

```powershell
# Terminal 3
npm run dev:dashboard
```

Opens at `http://localhost:5173/dashboard/` with Vite HMR.
Proxies API calls to `:7474` automatically.

---

## Acceptance Checklist

| # | Test | Pass? |
|---|---|---|
| | **Server** | |
| 1 | `GET /health` returns 200 with `{ status: "ok", version: "2.0.0", llmMode: "mock" }` | [ ] |
| | **Extension** | |
| 2 | Extension loads in Chrome without errors (no red badge on `chrome://extensions`) | [ ] |
| 3 | New Session creates successfully (popup → New Session → form → submit) | [ ] |
| 4 | Control bar appears on target page after session created | [ ] |
| | **Recording** | |
| 5 | SPACE toggles recording (not in input fields) | [ ] |
| 6 | SPACE types normally when focused on input field (guard works) | [ ] |
| 7 | Ctrl+Shift+R toggles recording (alternative shortcut) | [ ] |
| | **Bug Capture** | |
| 8 | Ctrl+Shift+S captures screenshot silently | [ ] |
| 9 | Ctrl+Shift+B captures screenshot + opens bug editor | [ ] |
| 10 | Bug editor shows screenshot preview + pre-filled URL | [ ] |
| 11 | Bug submission works (fill title, severity, description → submit) | [ ] |
| | **Session End** | |
| 12 | End Session POSTs to vigil-server (watch Terminal 1 for request) | [ ] |
| 13 | Session JSON written to `.vigil/sessions/` | [ ] |
| 14 | Bug file written to `BUGS/open/` with correct markdown format | [ ] |
| | **Dashboard** | |
| 15 | Dashboard loads at `localhost:7474/dashboard` (no blank page) | [ ] |
| 16 | Health indicator shows green + version `2.0.0` + `mock` | [ ] |
| 17 | Sprint selector shows sprint_06 | [ ] |
| 18 | Bug table shows your test bug | [ ] |
| 19 | Severity dropdown updates bug (PATCH to server) | [ ] |
| 20 | "Mark Fixed" moves bug file from `BUGS/open/` → `BUGS/fixed/` | [ ] |

---

## If Something Breaks

| Problem | Check |
|---|---|
| Server won't start | Is port 7474 already in use? `netstat -ano \| findstr 7474` |
| Extension won't load | Rebuild: `npm run build`. Check `chrome://extensions` for errors |
| Dashboard blank | Rebuild: `npm run build:dashboard`. Check browser console for errors |
| POST fails on End Session | Is vigil-server running? Check Terminal 1 for errors |
| No bug files created | Check `.vigil/` exists. Check `vigil.config.json` has `sprintCurrent: "06"` |
| Demo app won't start | `cd demos\refine-demo-app && npm install && npm run dev` |
| SPACE not working | Make sure you're not focused on an input/textarea/select/contentEditable |

---

## What You Have

| Component | Location | Port |
|---|---|---|
| **Demo app (TaskPilot)** | `demos/refine-demo-app/` | 39000 |
| **vigil-server** | `packages/server/` | 7474 |
| **Dashboard** | `localhost:7474/dashboard` | (served by server) |
| **Extension** | `dist/` (load unpacked) | N/A |
| **Config** | `vigil.config.json` | — |

---

*Walkthrough prepared: 2026-02-26 | [CPTO]*

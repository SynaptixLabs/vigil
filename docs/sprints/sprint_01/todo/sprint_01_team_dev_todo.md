# Sprint 01 — Team DEV Todo: Recording Engine

**Owner:** `[DEV:recording]`
**Sprint:** 01
**Depends on:** Sprint 00 scaffold (complete)
**Budget:** ~37V (DEV share of 47V sprint)

---

## Reading Order (before writing ANY code)

1. `AGENTS.md` (root Tier-1)
2. `src/background/AGENTS.md`, `src/content/AGENTS.md`, `src/core/AGENTS.md`, `src/popup/AGENTS.md`
3. `docs/01_ARCHITECTURE.md` §3 Data Model, §4 Data Flows
4. `docs/03_MODULES.md` — capability registry + "Do NOT re-implement" rules
5. `src/shared/types.ts` — all types already defined
6. `src/shared/messages.ts` — message protocol (types only)
7. This file

---

## Phase 1 — Storage + Messaging (~10V)

### D101: Dexie Database (`src/core/db.ts`) — 3V

**What:** Dexie database with 5 normalized tables. The `Session` interface in `shared/types.ts` has inline `actions[]`, `bugs[]`, `features[]` — in Dexie these are **separate tables** with `sessionId` FK. The interface is the hydrated view; db.ts handles join/flatten.

**Schema:**
```
sessions:     &id, status, startTime
events:       ++autoId, sessionId, timestamp
screenshots:  ++autoId, sessionId, timestamp
bugs:         &id, sessionId, timestamp
features:     &id, sessionId, timestamp
```

**CRUD to implement:**
- `createSession(name, description, url)` → auto-ID via `generateSessionId()`
- `updateSessionStatus(id, status)`
- `addEvent(sessionId, rrwebEvent)` → append rrweb event blob
- `addScreenshot(sessionId, dataUrl, url)` → store screenshot
- `addBug(sessionId, bug)` → ID via `generateBugId()`
- `addFeature(sessionId, feature)`
- `getSession(id)` → hydrated Session (joins all child tables)
- `getAllSessions()` → Session[] metadata only (no events array)
- `deleteSession(id)` → cascading delete (session + all children)

**Acceptance:**
- [ ] All CRUD work with `fake-indexeddb` in unit tests
- [ ] `getSession()` returns object matching `Session` interface
- [ ] Cascading delete removes all related records
- [ ] Export as singleton from `@core/db`

---

### D102: Message Handler (`src/background/message-handler.ts`) — 2V

**What:** Central message router. Switch on `MessageType`, dispatch to session-manager / db / screenshot.

**Pattern:**
```typescript
export function handleMessage(msg, sender, sendResponse): boolean {
  switch (msg.type) {
    case MessageType.START_RECORDING:   → sessionManager.start(msg.payload)
    case MessageType.STOP_RECORDING:    → sessionManager.stop()
    case MessageType.PAUSE_RECORDING:   → sessionManager.pause()
    case MessageType.RESUME_RECORDING:  → sessionManager.resume()
    case MessageType.CAPTURE_SCREENSHOT:→ screenshot.capture(sender.tab.id)
    case MessageType.LOG_BUG:           → db.addBug(activeSessionId, msg.payload)
    case MessageType.LOG_FEATURE:       → db.addFeature(activeSessionId, msg.payload)
    default:                            → { ok: false, error: 'Unknown type' }
  }
  return true; // async response channel
}
```

**Acceptance:**
- [ ] Routes all `MessageType` enum values
- [ ] Returns `ChromeResponse` on every path (no silent failures)
- [ ] Unit testable with mocked dependencies

---

### D103: Session Manager (`src/background/session-manager.ts`) — 3V

**What:** State machine for the active session. Only ONE session can be active at a time.

**States:** `IDLE → RECORDING ↔ PAUSED → STOPPED → COMPLETED`

**API:**
- `start(payload: {name, description, url})` → creates session in DB, sends START to content script, returns sessionId
- `pause()` → sends PAUSE to content script, updates DB status
- `resume()` → sends RESUME to content script, updates DB status
- `stop()` → sends STOP to content script, updates DB status to STOPPED then COMPLETED
- `getActiveSession()` → current session or null

**Critical rules:**
- `start()` while already active → error (must stop first)
- `pause()` while not RECORDING → error
- `stop()` while IDLE → error
- All state transitions update DB via `db.updateSessionStatus()`

**Acceptance:**
- [ ] State machine enforces valid transitions only
- [ ] Invalid transitions return `ChromeResponse { ok: false, error }`
- [ ] `start()` creates DB record via `db.createSession()`
- [ ] `stop()` calculates duration and stores in session

---

### D104: Keep-Alive (`src/background/keep-alive.ts`) — 1V

**What:** MV3 service workers die after ~30s idle. Use `chrome.alarms` to keep alive during active recording.

```typescript
export function startKeepAlive() {
  chrome.alarms.create('refine-keep-alive', { periodInMinutes: 0.4 }); // every 24s
}
export function stopKeepAlive() {
  chrome.alarms.clear('refine-keep-alive');
}
// In service-worker.ts:
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'refine-keep-alive') { /* no-op ping */ }
});
```

**Acceptance:**
- [ ] Alarm created when session starts
- [ ] Alarm cleared when session stops
- [ ] Service worker stays alive during 2+ min recording

---

### D105: Wire service-worker.ts — 1V

**What:** Replace hello-world with imports from message-handler, keep-alive, session-manager.

```typescript
import { handleMessage } from './message-handler';
import './keep-alive'; // alarm listener side effect

chrome.runtime.onMessage.addListener(handleMessage);
```

**Acceptance:**
- [ ] No more inline `console.log` echo handler
- [ ] All imports resolve cleanly
- [ ] Existing Sprint 00 E2E test `extension-loads.spec.ts` still passes

---

## Phase 2 — Recording Engine (~11V)

### D107: rrweb Recorder Wrapper (`src/content/recorder.ts`) — 5V

**What:** Wraps `rrweb.record()` with session lifecycle management. This is the biggest single task.

**API:**
```typescript
export class Recorder {
  start(sessionId: string): void    // init rrweb.record(), begin capturing
  pause(): void                      // stop rrweb emission (keep DOM observer alive)
  resume(): void                     // resume emission
  stop(): rrwebEvent[]               // stop recording, return final events
  isRecording(): boolean
}
```

**rrweb config:**
```typescript
rrweb.record({
  emit: (event) => { /* batch → send to background via chrome.runtime.sendMessage */ },
  checkoutEveryNms: 30000,      // full snapshot every 30s (S01-001)
  maskAllInputs: false,          // we WANT to capture form input for test generation
  maskInputOptions: { password: true }, // but mask passwords
  recordCanvas: false,           // skip canvas — not needed for form/nav recording
});
```

**Critical:**
- Events are sent to background in batches (e.g. every 500ms or 50 events) via message
- Background stores them via `db.addEvent(sessionId, event)`
- Recorder does NOT store events locally — background is the single source

**Acceptance:**
- [ ] rrweb.record() initializes without errors on target app
- [ ] Events flow to background via Chrome messaging
- [ ] Pause/resume actually pauses/resumes event emission
- [ ] Passwords masked, other inputs captured
- [ ] Stop returns accumulated events (for any final flush)

---

### D108: Action Extractor (`src/content/action-extractor.ts`) — 3V

**What:** Converts rrweb `IncrementalSnapshot` events into human-readable `Action` objects.

**Extracts:**
- `click` → element selector + coordinates
- `input` → field selector + new value (masked for passwords)
- `navigation` → source URL → destination URL
- Uses selector-engine (D109) for smart selectors

**Acceptance:**
- [ ] Click events produce `Action { type: 'click', selector, url }`
- [ ] Input events produce `Action { type: 'input', selector, value }`
- [ ] Navigation events produce `Action { type: 'navigation', url }`
- [ ] Unit testable with mock rrweb events

---

### D109: Selector Engine (`src/content/selector-engine.ts`) — 2V

**What:** Given a DOM element, produce the best selector following `SELECTOR_PRIORITIES` from constants.

**Priority:** `data-testid` → `aria-label` → `id` → CSS (shortest unique path)

```typescript
export function getBestSelector(element: Element): string {
  if (element.getAttribute('data-testid')) return `[data-testid="${...}"]`;
  if (element.getAttribute('aria-label')) return `[aria-label="${...}"]`;
  if (element.id) return `#${element.id}`;
  return getCssSelector(element); // fallback: tag + nth-child path
}
```

**Acceptance:**
- [ ] Returns `data-testid` selector when present
- [ ] Falls through priority chain correctly
- [ ] CSS fallback produces unique selector (verify via `document.querySelector`)
- [ ] Unit testable with JSDOM

---

### D110: Wire content-script.ts — 1V

**What:** Replace hello-world with recorder + message listener setup.

```typescript
import { Recorder } from './recorder';
import { MessageType } from '@shared/index';

const recorder = new Recorder();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {
    case MessageType.START_RECORDING:  recorder.start(msg.payload.sessionId); break;
    case MessageType.PAUSE_RECORDING:  recorder.pause(); break;
    case MessageType.RESUME_RECORDING: recorder.resume(); break;
    case MessageType.STOP_RECORDING:   recorder.stop(); break;
  }
  sendResponse({ ok: true });
});

console.log(`[Refine] Content script loaded on: ${window.location.href}`);
```

**Acceptance:**
- [ ] Content script initializes recorder on START_RECORDING
- [ ] Existing E2E test `content-script-injects.spec.ts` still passes (console log preserved)

---

## Phase 3 — Overlay UI (~9V)

### D112: Shadow DOM Mount (`src/content/overlay/mount.ts`) — 2V

**What:** Creates an isolated Shadow DOM host element and renders React inside it.

```typescript
export function mountOverlay(): ShadowRoot {
  const host = document.createElement('div');
  host.id = 'refine-overlay-host';
  host.style.cssText = 'all: initial; position: fixed; z-index: 2147483647;';
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });
  // Inject overlay.css into shadow
  // createRoot(shadow) → render ControlBar
  return shadow;
}
```

**Critical:**
- `z-index: 2147483647` (max) — overlay must always be on top
- `all: initial` on host — reset inherited styles from target page
- Shadow DOM isolates all Refine CSS from target app (ADR-006)

**Acceptance:**
- [ ] Host element appended to document.body
- [ ] Shadow root contains React root
- [ ] No CSS leaks between overlay and target page

---

### D113: ControlBar Component (`src/content/overlay/ControlBar.tsx`) — 3V

**What:** Floating bar at bottom-center: Record ● / Pause ⏸ / Stop ⏹ / Screenshot 📸 / Bug 🐛

**States:**
- **Recording:** Red pulse indicator, Pause + Stop + Screenshot + Bug visible
- **Paused:** Amber indicator, Resume + Stop visible
- **Idle:** Hidden (before start or after stop)

**Each button sends Chrome message:**
- Pause → `{ type: MessageType.PAUSE_RECORDING }`
- Resume → `{ type: MessageType.RESUME_RECORDING }`
- Stop → `{ type: MessageType.STOP_RECORDING }`
- Screenshot → `{ type: MessageType.CAPTURE_SCREENSHOT }`
- Bug → opens BugEditor (local state toggle, no message)

**Acceptance:**
- [ ] Bar appears when recording starts
- [ ] Bar disappears when recording stops
- [ ] Red pulse during RECORDING, amber during PAUSED
- [ ] All buttons send correct message types
- [ ] Bar is fixed at bottom-center, does not scroll with page

---

### D114: BugEditor Component (`src/content/overlay/BugEditor.tsx`) — 3V

**What:** Inline form that opens from ControlBar. Pre-fills context automatically.

**Fields:**
- Type toggle: Bug / Feature (default: Bug)
- Priority: P0-P3 dropdown (default: P2)
- Title: text input (required)
- Description: textarea (optional)
- Auto-filled (read-only display): URL, timestamp, last-clicked selector

**On Save:**
- Takes auto-screenshot
- Sends `{ type: MessageType.LOG_BUG, payload: { title, description, priority, url, selector, screenshotUrl } }`
- Closes form, returns to ControlBar

**Acceptance:**
- [ ] Form opens from ControlBar bug button
- [ ] URL and selector pre-filled from current context
- [ ] Save sends message + auto-screenshot + closes form
- [ ] Cancel closes without saving

---

### D115: Overlay CSS (`src/content/styles/overlay.css`) — 1V

**What:** Styles for ControlBar + BugEditor inside Shadow DOM. Use Tailwind utility classes or plain CSS.

**Acceptance:**
- [ ] Styles injected into Shadow DOM (not global)
- [ ] No visual conflict with target app

---

## Phase 4 — Popup + Screenshot (~8V)

### D116: Screenshot Capture (`src/background/screenshot.ts`) — 2V

**What:** Uses `chrome.tabs.captureVisibleTab()` to capture PNG, stores via `db.addScreenshot()`.

```typescript
export async function captureScreenshot(tabId: number, sessionId: string): Promise<string> {
  const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
  await db.addScreenshot(sessionId, dataUrl, /* url from tab */);
  return dataUrl;
}
```

**Acceptance:**
- [ ] Returns base64 PNG data URL
- [ ] Stored in Dexie `screenshots` table with sessionId + timestamp
- [ ] Works on localhost pages (test with target app)

---

### D117: NewSession Form (`src/popup/pages/NewSession.tsx`) — 2V

**What:** Form: Session name (required), Description (optional), "Start Recording" button.

**On submit:**
- Gets active tab URL via `chrome.tabs.query()`
- Sends `{ type: MessageType.START_RECORDING, payload: { name, description, url } }`
- Receives sessionId in response
- Navigates popup to session list view

**Acceptance:**
- [ ] Form validates name is non-empty
- [ ] Start Recording sends correct message
- [ ] Active tab URL is auto-captured

---

### D118: SessionList (`src/popup/pages/SessionList.tsx`) — 2V

**What:** List all sessions from Dexie. Show: name, date, duration, status (color-coded), bug count.

**Note:** Popup cannot keep long-lived connections — query Dexie on mount. For Sprint 01, direct Dexie access from popup is OK (Core is a library). If perf becomes an issue, refactor to messaging in Sprint 02.

**Acceptance:**
- [ ] Lists all sessions sorted by startTime desc
- [ ] Status badge: 🔴 RECORDING, 🟡 PAUSED, ✅ COMPLETED
- [ ] "New Session" button navigates to NewSession form
- [ ] Shows "No sessions yet" when empty

---

### D119: Update App.tsx — 1V

**What:** Simple state-based routing: SessionList (default) ↔ NewSession. No React Router needed for popup.

**Acceptance:**
- [ ] Default view is SessionList
- [ ] "New Session" button shows NewSession form
- [ ] Back button returns to list

---

### D120: Branded Icons — 1V

**What:** Replace 1×1 placeholder PNGs with SynaptixLabs-branded icons.

**Spec:** Orange #F97316 + Blue #3B82F6 circle with "R" lettermark. Sizes: 16, 32, 48, 128px.

**Acceptance:**
- [ ] 4 valid PNG files in `public/icons/`
- [ ] Chrome shows proper icon (not puzzle piece)

---

## Phase 5 — Unit + Integration Tests (~6V for DEV)

### D106: Unit Tests — Storage + Background (~2V)

| Test file | Tests |
|---|---|
| `tests/unit/core/db.test.ts` | CRUD ops, cascading delete, hydrated getSession, getAllSessions metadata-only |
| `tests/unit/background/session-manager.test.ts` | State machine transitions (valid + invalid), start/stop lifecycle |
| `tests/unit/background/message-handler.test.ts` | Routes correct MessageType → correct handler, returns error for unknown |

### D111: Unit Tests — Content (~2V)

| Test file | Tests |
|---|---|
| `tests/unit/content/action-extractor.test.ts` | Click → Action, Input → Action, Navigation → Action, mock rrweb events |
| `tests/unit/content/selector-engine.test.ts` | Priority chain: data-testid > aria-label > id > CSS, edge cases |

### D121: Integration Test — Full Pipeline (~2V)

| Test file | Tests |
|---|---|
| `tests/integration/session-pipeline.test.ts` | Create session → add events → add bug → add screenshot → stop → verify DB contains all data → delete cascades cleanly |

---

## Definition of Done

```
✅ npm run build — succeeds
✅ npx vitest run — all unit + integration tests pass (Sprint 00 + 01)
✅ npx tsc --noEmit — clean
✅ Extension loads in Chrome without errors
✅ Create session from popup → control bar appears on page
✅ rrweb records DOM events during navigation
✅ Screenshot button captures and stores image
✅ Bug button opens editor with auto-context → saves to DB
✅ Stop → session COMPLETED in popup
✅ IndexedDB contains session + events + screenshots + bugs (verify in DevTools)
✅ Branded icons visible in Chrome toolbar
```

---

*Last updated: 2026-02-21*

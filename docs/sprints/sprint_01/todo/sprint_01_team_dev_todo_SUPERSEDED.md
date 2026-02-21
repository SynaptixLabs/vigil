# sprint_01 — Team DEV Todo: Recording Engine

**Owner:** `[DEV:recording]`
**Sprint scope:** R001 (Session), R002 (Recording), R003 (Control Bar), R004 (Screenshot), R005 (Bug Editor)

## Sprint Goals (DEV)

- Implement the full Chrome messaging layer (popup ↔ background ↔ content)
- Build session lifecycle management (create/pause/resume/stop)
- Integrate rrweb for DOM recording with cross-page persistence
- Build Shadow DOM overlay: control bar + bug/feature editor
- Implement screenshot capture via chrome.tabs API
- Build action extractor + selector engine for Playwright export prep
- Implement Dexie storage layer for all session data
- Unit + integration tests for all new modules

## Reading Order (MANDATORY before writing code)

1. `AGENTS.md` (root Tier-1) — project-wide rules
2. `src/background/AGENTS.md` — background module scope
3. `src/content/AGENTS.md` — content module scope
4. `src/popup/AGENTS.md` — popup module scope
5. `src/core/AGENTS.md` — core module scope
6. `src/shared/AGENTS.md` — shared module scope
7. `docs/01_ARCHITECTURE.md` — system diagram, data flows
8. `docs/03_MODULES.md` — capability registry, "Do NOT re-implement" rules
9. `docs/04_TESTING.md` — test patterns, TDD discipline

## Tasks

### Phase 1: Infrastructure Upgrades (~4V)

| ID | Task | Acceptance Criteria | Files | Status |
|---|---|---|---|---|
| D101 | **Message handler** — type-safe router in background | Routes messages by `MessageType` enum. Responds to popup and content. Uses types from `@shared/messages.ts`. | `src/background/message-handler.ts` | ☐ |
| D102 | **Content messaging** — onMessage integration in content script | Content script listens for background commands (START_RECORDING, STOP_RECORDING, TAKE_SCREENSHOT). Sends events back (ACTION_RECORDED, BUG_LOGGED). | `src/content/content-script.ts` (update) | ☐ |
| D103 | **Keep-alive** — chrome.alarms for active sessions | Create alarm on session start, clear on stop. `chrome.alarms.onAlarm` listener pings to prevent SW shutdown. 25-second interval. | `src/background/keep-alive.ts` | ☐ |
| D104 | **Branded icons** — SynaptixLabs palette | Replace 1×1 placeholders with proper 16/32/48/128px icons. Orange #F97316 + blue #3B82F6 gradient or simple "R" lettermark. | `public/icons/icon-{16,32,48,128}.png` | ☐ |
| D105 | **Storage layer** — Dexie schema + CRUD | Tables: `sessions`, `recordings` (rrweb chunks), `bugs`, `features`, `screenshots`. Auto-increment where needed, `&id` for sessions (string PK). CRUD methods for each table. | `src/core/db.ts` (rewrite from stub) | ☐ |

### Phase 2: Session Lifecycle — R001 (~5V)

| ID | Task | Acceptance Criteria | Files | Status |
|---|---|---|---|---|
| D106 | **Session manager** — state machine | States: `idle` → `recording` → `paused` → `stopped`. `createSession(name, desc)` → generates ID (`ats-YYYY-MM-DD-NNN`), saves to Dexie, sets state to `recording`. `pauseSession()` / `resumeSession()` / `stopSession()` transitions. Emits state changes via messaging. | `src/background/session-manager.ts` | ☐ |
| D107 | **New Session page** — popup form | Fields: name (required), description (optional). Auto-generated session ID shown (read-only). "Start Recording" button sends `CREATE_SESSION` message to background. On success: closes popup (recording starts on active tab). | `src/popup/pages/NewSession.tsx` | ☐ |
| D108 | **Session list page** — basic popup view | Lists sessions from Dexie: name, date, duration, status badge (recording/paused/stopped), bug count. "New Session" button navigates to form. Active session shown at top with pulsing indicator. | `src/popup/pages/SessionList.tsx` | ☐ |
| D109 | **Popup routing** — page navigation | Update `App.tsx`: default view = SessionList, "New Session" → NewSession form, back navigation. Use simple React state routing (no react-router — popup is tiny). | `src/popup/App.tsx` (update) | ☐ |

### Phase 3: Recording Engine — R002 (~15V)

| ID | Task | Acceptance Criteria | Files | Status |
|---|---|---|---|---|
| D110 | **rrweb recorder** — start/stop/pause | `startRecording()`: initializes rrweb with `emit` callback that buffers events. `pauseRecording()`: calls rrweb snapshot pause (or detach observer). `stopRecording()`: finalizes, flushes buffer to Dexie via background. Config: mask `input[type=password]`, capture scroll, mouse movement sampling at 50ms. | `src/content/recorder.ts` | ☐ |
| D111 | **Event buffer + flush** | Buffer rrweb events in memory (max 500 events or 5MB). On buffer full OR on pause/stop: serialize and send to background via message. Background writes chunk to Dexie `recordings` table with session ID + page URL + chunk index. | `src/content/recorder.ts` (buffer logic), `src/background/session-manager.ts` (storage handler) | ☐ |
| D112 | **Cross-page persistence** | When user navigates: content script unloads → new page loads → content script re-injects. On injection: check with background if session is active. If yes: resume rrweb recording with new full snapshot. Background stitches chunks by session ID + chunk index. Navigation event logged as Action. | `src/content/content-script.ts` (update), `src/background/session-manager.ts` (update) | ☐ |
| D113 | **Action extractor** | Processes rrweb events to extract high-level actions: `click(selector)`, `type(selector, value)`, `navigate(from, to)`, `scroll(direction)`. Each Action has: timestamp, type, selector (from selector engine), value (if input), pageUrl. Actions stored in Dexie `sessions.actions[]` or separate table. | `src/content/action-extractor.ts` | ☐ |
| D114 | **Selector engine** | Given a DOM element, produce the best available selector. Priority: (1) `[data-testid="X"]` (2) `[aria-label="X"]` (3) `#id` (4) CSS selector (tag + class + nth-child). Returns `{ strategy: string, selector: string, confidence: 'high'|'medium'|'low' }`. High = data-testid/id, Medium = aria-label, Low = CSS. | `src/content/selector-engine.ts` | ☐ |

### Phase 4: Control Bar + Capture — R003, R004, R005 (~18V)

| ID | Task | Acceptance Criteria | Files | Status |
|---|---|---|---|---|
| D115 | **Shadow DOM mount** | On content script inject (when session active): create `<div id="refine-root">` → attach Shadow DOM → mount React tree inside. Shadow DOM isolates Refine CSS from target page. Tear down on session stop. | `src/content/overlay/mount.ts` | ☐ |
| D116 | **Control bar component** | Fixed bottom-center overlay. Buttons: Record ● (red pulse when active) / Pause ⏸ / Stop ⏹ / Screenshot 📸 / Bug 🐛. Timer showing session duration. Session name displayed. State synced with background via messaging. | `src/content/overlay/ControlBar.tsx` | ☐ |
| D117 | **Screenshot capture** | Screenshot button → sends `TAKE_SCREENSHOT` message to background → `chrome.tabs.captureVisibleTab()` → returns base64 PNG → store in Dexie `screenshots` table with session ID, timestamp, URL, dimensions. Show brief "✓ Captured" toast on control bar. | `src/background/screenshot.ts` | ☐ |
| D118 | **Bug/feature editor** | Bug 🐛 button opens inline form below control bar. Pre-filled: current URL, auto-screenshot (captured on open), last-clicked element selector. User fills: type toggle (Bug/Feature), priority (P0-P3, default P1), title (required), description (optional). Save → stored in Dexie `bugs` or `features` table → form closes → recording continues. | `src/content/overlay/BugEditor.tsx` | ☐ |
| D119 | **Overlay styles** | Shadow DOM scoped CSS. NOT Tailwind (Tailwind needs build step, Shadow DOM is isolated). Clean hand-written CSS: dark semi-transparent bar, white text, hover states, transitions. Z-index: 2147483647 (max). Responsive width (max 600px centered). | `src/content/styles/overlay.css` | ☐ |

### Phase 5: Unit + Integration Tests (~5V)

| ID | Task | Acceptance Criteria | Files | Status |
|---|---|---|---|---|
| D120 | **Unit: db.ts** | Test all CRUD operations using `fake-indexeddb`. Create session → read → update status → delete. Verify schema migrations. | `tests/unit/core/db.test.ts` | ☐ |
| D121 | **Unit: session-manager.ts** | Test state machine: idle→recording→paused→recording→stopped. Invalid transitions throw. Session ID format verified. Duration tracked correctly (excluding paused time). | `tests/unit/background/session-manager.test.ts` | ☐ |
| D122 | **Unit: action-extractor.ts** | Given mock rrweb events → verify correct Action[] output. Click events → click action with selector. Input events → type action with value. Navigation → navigate action with URLs. | `tests/unit/content/action-extractor.test.ts` | ☐ |
| D123 | **Unit: selector-engine.ts** | Mock DOM elements with various attributes. Verify priority: data-testid wins, aria-label second, id third, CSS fallback. Verify confidence levels. Edge case: element with no useful attributes → low confidence CSS. | `tests/unit/content/selector-engine.test.ts` | ☐ |
| D124 | **Integration: session lifecycle** | Create session → start recording (mock rrweb) → log bug → take screenshot → pause → resume → stop. Verify all data in Dexie: session record, recording chunks, bug record, screenshot record. | `tests/integration/session-lifecycle.test.ts` | ☐ |
| D125 | **All tests green** | `npx vitest run` — all unit + integration pass. Coverage ≥ 80% for core/, ≥ 70% for background/, content/ extractors. | — | ☐ |

### Phase 6: Verification

| ID | Task | Acceptance Criteria | Files | Status |
|---|---|---|---|---|
| D126 | `npm run build` — clean | No TS errors, no build warnings, `dist/` produced | — | ☐ |
| D127 | `npx tsc --noEmit` — clean | Zero type errors | — | ☐ |
| D128 | `npx eslint src/` — clean | Zero lint errors | — | ☐ |
| D129 | Manual smoke test on TaskPilot | Load extension → open TaskPilot (3900) → create session → record for 2 min → navigate 3 pages → take screenshot → log a bug → stop session → verify data in popup | — | ☐ |

---

## Data Model Reference (for Dexie schema)

```typescript
// Sessions table
interface Session {
  id: string;               // ats-YYYY-MM-DD-NNN
  name: string;
  description: string;
  status: SessionStatus;    // recording | paused | stopped
  startedAt: number;        // Unix ms
  stoppedAt?: number;
  duration: number;         // ms (excluding paused time)
  pages: string[];          // URLs visited
  actionCount: number;
  bugCount: number;
  featureCount: number;
  screenshotCount: number;
}

// Recordings table (rrweb event chunks)
interface RecordingChunk {
  id?: number;              // auto-increment
  sessionId: string;
  chunkIndex: number;
  pageUrl: string;
  events: any[];            // rrweb serialized events
  createdAt: number;
}

// Bugs table
interface Bug {
  id: string;               // bug-XXXXXXXX
  sessionId: string;
  type: 'bug';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  title: string;
  description: string;
  url: string;
  screenshotId?: string;
  elementSelector?: string;
  timestamp: number;
}

// Features table
interface Feature {
  id: string;               // feat-XXXXXXXX
  sessionId: string;
  type: 'feature';
  featureType: 'enhancement' | 'new' | 'ux';
  title: string;
  description: string;
  url: string;
  screenshotId?: string;
  elementSelector?: string;
  timestamp: number;
}

// Screenshots table
interface Screenshot {
  id: string;               // ss-XXXXXXXX
  sessionId: string;
  dataUrl: string;          // base64 PNG
  url: string;              // page URL when captured
  timestamp: number;
  width: number;
  height: number;
}
```

---

## Critical Rules

1. **Chrome API isolation:** `chrome.runtime`, `chrome.tabs`, `chrome.alarms` ONLY in `src/background/` and `src/content/`. Never in `src/core/` or `src/shared/`.
2. **Message-based communication:** Popup ↔ Background ↔ Content via `chrome.runtime.sendMessage`. No direct imports across execution contexts.
3. **Shadow DOM isolation:** All Refine UI in content script goes inside Shadow DOM. Zero CSS leakage to target page.
4. **rrweb config:** Mask `input[type=password]`. Sample mouse at 50ms. Checkpoint every 30s.
5. **Path aliases:** Use `@shared/`, `@core/`, `@background/`, `@content/`, `@popup/` — never relative `../../`.
6. **Do NOT modify configs:** `package.json`, `tsconfig.json`, `vite.config.ts`, `manifest.json` — FLAG if changes needed.
7. **Barrel imports:** Import from `@shared/` (not `@shared/types` directly) — uses the barrel.

## Definition of Done (DEV)

```
✅ Session can be created from popup with name + auto-ID
✅ rrweb records DOM activity on any localhost / synaptixlabs page
✅ Recording persists across page navigations (3+ pages)
✅ Control bar visible and functional: Record/Pause/Stop/Screenshot/Bug
✅ Screenshot capture stores base64 PNG with metadata
✅ Bug editor pre-fills URL + screenshot + selector, saves to Dexie
✅ Service worker stays alive during recording (chrome.alarms)
✅ npx vitest run — all pass, coverage targets met
✅ npx tsc --noEmit — clean
✅ npx eslint src/ — clean
✅ npm run build — clean
✅ Manual smoke test on TaskPilot — full recording loop works
```

## Risks / Blockers

- **rrweb + Shadow DOM conflict:** rrweb records the target page DOM. If rrweb tries to record Refine's own Shadow DOM overlay, it creates recursive noise. **Mitigation:** Configure rrweb `blockSelector` to exclude `#refine-root`.
- **Content script re-injection timing:** On SPA navigation (pushState), content script may not re-fire. **Mitigation:** Listen for `chrome.webNavigation.onHistoryStateUpdated` in background, send message to content script.
- **Base64 screenshot size:** `captureVisibleTab` returns full-res PNG. A 1920×1080 screenshot is ~2-5MB base64. **Mitigation:** Compress to JPEG quality 80% or resize to max 1280px width.
- **Dexie storage limits:** IndexedDB has browser-managed quotas (~50% of free disk). **Mitigation:** Warn user if total storage exceeds 500MB. Show storage usage in popup.

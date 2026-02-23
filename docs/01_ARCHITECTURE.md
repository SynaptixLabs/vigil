# SynaptixLabs Refine â€” Architecture

> **System Design & Technical Architecture**
> Owner: CTO

---

## Overview

Refine (Acceptance Test Recorder) is a Chrome Extension built on Manifest V3 that records manual acceptance testing sessions on any web application. It captures DOM state via rrweb, extracts user actions for Playwright test generation, and provides inline bug/feature logging â€” all without any changes to the target application.

### Architecture Style
- [x] Chrome Extension (Manifest V3) â€” client-side only
- [ ] No server component
- [ ] No database (IndexedDB for local persistence)

---

## System Diagram

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Chrome Extension: SynaptixLabs Refine                                  â”‚
â”‚                                                                       â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚  Popup UI      â”‚    â”‚  Content Script â”‚    â”‚  Background        â”‚  â”‚
â”‚  â”‚  (React App)   â”‚    â”‚  (per tab)      â”‚    â”‚  Service Worker    â”‚  â”‚
â”‚  â”‚                â”‚    â”‚                 â”‚    â”‚                    â”‚  â”‚
â”‚  â”‚ â€¢ Session list â”‚â—„â”€â”€â–ºâ”‚ â€¢ rrweb inject  â”‚â—„â”€â”€â–ºâ”‚ â€¢ Session state    â”‚  â”‚
â”‚  â”‚ â€¢ New session  â”‚    â”‚ â€¢ Action logger â”‚    â”‚ â€¢ Message router   â”‚  â”‚
â”‚  â”‚ â€¢ Report view  â”‚    â”‚ â€¢ Control bar   â”‚    â”‚ â€¢ Screenshot API   â”‚  â”‚
â”‚  â”‚ â€¢ Export UI    â”‚    â”‚   (Shadow DOM)  â”‚    â”‚ â€¢ Export engine    â”‚  â”‚
â”‚  â”‚                â”‚    â”‚ â€¢ Bug editor    â”‚    â”‚ â€¢ IndexedDB (via   â”‚  â”‚
â”‚  â”‚                â”‚    â”‚   (Shadow DOM)  â”‚    â”‚   Dexie.js)        â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚           â”‚                     â”‚                       â”‚              â”‚
â”‚           â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜              â”‚
â”‚                        chrome.runtime.sendMessage                      â”‚
â”‚                        chrome.storage.session (hot state)              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚                        â”‚                        â”‚
         â”‚            â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”             â”‚
         â”‚            â”‚  ANY Target Web App  â”‚             â”‚
         â”‚            â”‚  (no modifications)  â”‚             â”‚
         â”‚            â”‚                      â”‚             â”‚
         â”‚            â”‚  localhost:338470      â”‚             â”‚
         â”‚            â”‚  localhost:3000       â”‚             â”‚
         â”‚            â”‚  app.example.com      â”‚             â”‚
         â”‚            â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜             â”‚
         â”‚                                                  â”‚
         â–¼                                                  â–¼
  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
  â”‚  IndexedDB   â”‚                                â”‚  Exports (files) â”‚
  â”‚              â”‚                                â”‚                  â”‚
  â”‚ â€¢ Sessions   â”‚                                â”‚ â€¢ replay.html    â”‚
  â”‚ â€¢ Events     â”‚                                â”‚ â€¢ report.json    â”‚
  â”‚ â€¢ rrweb data â”‚                                â”‚ â€¢ report.md      â”‚
  â”‚ â€¢ Screenshotsâ”‚                                â”‚ â€¢ regression.ts  â”‚
  â”‚ â€¢ Bugs       â”‚                                â”‚ â€¢ screenshots/   â”‚
  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Tech Stack

### Extension Runtime
| Component | Technology | Version |
|-----------|------------|---------|
| Platform | Chrome Manifest V3 | Latest |
| Build | Vite + CRXJS | Vite ^5.4, CRXJS 2.0.0-beta |
| Language | TypeScript | 5.x |
| UI Framework | React 18 | ^18.3 |
| Styling | Tailwind CSS | ^3.4 |

### Core Libraries
| Component | Technology | Version | Size (gzip) |
|-----------|------------|---------|-------------|
| DOM Recording | rrweb | ^2.x | ~15KB |
| Visual Replay | rrweb-player | ^2.x | ~30KB |
| Local Storage | Dexie.js | ^4.x | ~25KB |
| Icons | lucide-react | ^0.x | Tree-shakeable |

### Dev Tooling
| Tool | Purpose |
|------|---------|
| Vite | Build + HMR (via CRXJS plugin) |
| Vitest | Unit testing |
| TypeScript | Type safety |
| ESLint + Prettier | Code quality |

### No Backend
Refine is **fully client-side**. No API server, no database server, no cloud storage. All data lives in the browser's IndexedDB via Dexie.js.

---

## Extension Architecture (Manifest V3)

Chrome extensions have 3 execution contexts. Understanding these is critical.

### Background Service Worker (`src/background/`)
- **Lifecycle:** Runs in an isolated context, no DOM access. Goes idle after ~30s of inactivity (Manifest V3 constraint).
- **Responsibilities:**
  - Session state machine (idle â†’ recording â†’ paused â†’ completed)
  - Message routing between popup and content scripts
  - Screenshot capture via `chrome.tabs.captureVisibleTab()`
  - IndexedDB read/write (Dexie.js instance lives here)
  - Export generation (Playwright codegen, report builder)
- **Keep-alive strategy:** Use `chrome.alarms.create()` with 25-second intervals during active recording to prevent idle shutdown.

### Content Script (`src/content/`)
- **Lifecycle:** Injected into every tab matching the configured URL patterns. Re-injected on page navigation.
- **Responsibilities:**
  - Inject rrweb and start/stop recording based on messages from background
  - Render floating control bar (inside Shadow DOM to prevent CSS conflicts)
  - Render bug/feature editor overlay (inside Shadow DOM)
  - Extract action metadata (clicked element selector, typed text, navigation URL)
  - Forward rrweb events and extracted actions to background via `chrome.runtime.sendMessage()`
- **Shadow DOM isolation:** All overlay UI renders inside a Shadow DOM root to prevent:
  - Target app CSS affecting overlay styling
  - Overlay CSS affecting target app
  - Target app JS interfering with overlay behavior

### Popup (`src/popup/`)
- **Lifecycle:** Opens when user clicks extension icon. Closes when user clicks elsewhere.
- **Responsibilities:**
  - Session CRUD (create, list, delete)
  - Start/stop recording (sends message to background â†’ content script)
  - View session reports
  - Trigger exports (Playwright, replay, ZIP)
  - Settings configuration

---

## Module Architecture

```
src/
â”œâ”€â”€ background/
â”‚   â”œâ”€â”€ service-worker.ts           # Service worker entry point
â”‚   â”œâ”€â”€ session-manager.ts          # Session state machine
â”‚   â”œâ”€â”€ message-handler.ts          # chrome.runtime message router
â”‚   â”œâ”€â”€ screenshot.ts               # chrome.tabs.captureVisibleTab wrapper
â”‚   â””â”€â”€ keep-alive.ts               # chrome.alarms-based keep-alive
â”‚
â”œâ”€â”€ content/
â”‚   â”œâ”€â”€ content-script.ts           # Content script entry point
â”‚   â”œâ”€â”€ recorder.ts                 # rrweb injection + control
â”‚   â”œâ”€â”€ action-extractor.ts         # DOM events â†’ structured actions
â”‚   â”œâ”€â”€ selector-engine.ts          # Smart CSS selector generation
â”‚   â”œâ”€â”€ overlay/
â”‚   â”‚   â”œâ”€â”€ mount.ts                # Shadow DOM mount point
â”‚   â”‚   â”œâ”€â”€ ControlBar.tsx          # Floating record/pause/stop bar
â”‚   â”‚   â””â”€â”€ BugEditor.tsx           # Inline bug/feature form
â”‚   â””â”€â”€ styles/
â”‚       â””â”€â”€ overlay.css             # Overlay-specific styles (inside Shadow DOM)
â”‚
â”œâ”€â”€ popup/
â”‚   â”œâ”€â”€ popup.html                  # Popup entry HTML
│   ├── index.tsx                   # React 18 createRoot mount
â”‚   â”œâ”€â”€ App.tsx                     # Popup React app root
â”‚   â”œâ”€â”€ pages/
â”‚   â”‚   â”œâ”€â”€ SessionList.tsx         # Session management
â”‚   â”‚   â”œâ”€â”€ NewSession.tsx          # Session creation form
â”‚   â”‚   â”œâ”€â”€ SessionReport.tsx       # Report viewer
â”‚   â”‚   â””â”€â”€ Settings.tsx            # Extension settings
â”‚   â””â”€â”€ components/
â”‚       â”œâ”€â”€ SessionCard.tsx         # Session list item
â”‚       â”œâ”€â”€ Timeline.tsx            # Session event timeline
â”‚       â””â”€â”€ ExportButtons.tsx       # Export action buttons
â”‚
├── core/                           # Business logic (no Chrome API deps)
│   ├── db.ts                       # Dexie.js schema + database instance
│   ├── playwright-codegen.ts       # Action log → Playwright .spec.ts
│   ├── report-generator.ts         # Session → JSON + Markdown report
│   ├── replay-bundler.ts           # rrweb chunks → self-contained HTML (decompresses on-the-fly)
│   ├── zip-bundler.ts              # ZIP bundle export
│   ├── dashboard-generator.ts      # Project index.html dashboard
│   ├── compression.ts              # CompressionStream gzip encode/decode
│   └── publish.ts                  # Multi-file chrome.downloads export
│
├── reporter/                       # Playwright CI reporter (Node.js, not extension)
│   └── refine-reporter.ts          # Reporter interface implementation
│
├── options/
│   ├── options.html                # Options page entry HTML
│   └── options.tsx                 # Global settings (output path)
│
├── replay-viewer/
│   ├── replay-viewer.html          # Replay viewer entry HTML
│   └── replay-viewer.tsx           # CSP-compliant rrweb-player page
│
└── shared/                         # Types, constants, utilities (leaf module)
    ├── types.ts                    # All TypeScript interfaces + enums
    ├── constants.ts                # Extension-wide constants
    ├── messages.ts                 # Chrome message type definitions + helpers
    └── utils.ts                    # ID generation, timestamp formatting
```

---

## Data Flow

### Recording Flow
```
User clicks in target app
        â”‚
        â–¼
Content Script: rrweb captures DOM mutation
Content Script: action-extractor logs {type: 'click', selector, elementText, url, timestamp}
        â”‚
        â–¼ chrome.runtime.sendMessage
        â”‚
Background Service Worker: stores rrweb event chunk in IndexedDB
Background Service Worker: stores action event in IndexedDB
        â”‚
        â–¼ (periodic, every 5s)
        â”‚
Background: flush buffered events to IndexedDB (batched write)
```

### Screenshot Flow
```
User clicks ðŸ“· in control bar
        â”‚
        â–¼ chrome.runtime.sendMessage({type: 'screenshot'})
        â”‚
Background: chrome.tabs.captureVisibleTab()
Background: store PNG blob in IndexedDB with timestamp + session ID
Background: respond with screenshot ID
        â”‚
        â–¼ response
        â”‚
Content Script: show brief "âœ“ Captured" flash in control bar
```

### Bug Entry Flow
```
User clicks ðŸ› in control bar
        â”‚
        â–¼
Content Script: auto-capture screenshot (same as ðŸ“· flow)
Content Script: read last-clicked element selector from action log
Content Script: open BugEditor overlay (Shadow DOM)
        â”‚
User fills: type, priority, description
User clicks "Save"
        â”‚
        â–¼ chrome.runtime.sendMessage({type: 'log-issue', ...})
        â”‚
Background: store bug/feature in IndexedDB
Background: associate with session, timestamp, screenshot, URL, selector
```

### Export Flow
```
User clicks "Export Playwright" in popup
        â”‚
        â–¼
Popup: sends message to background
        â”‚
Background: reads session actions from IndexedDB
Background: playwright-codegen.ts transforms actions â†’ .spec.ts string
Background: creates download via chrome.downloads.download()
        â”‚
        â–¼
File saved to user's Downloads folder
```

---

## Data Model (IndexedDB via Dexie.js)

```typescript
// Database schema (Dexie v4, db name: 'refine-db')
const db = new Dexie('refine-db')
db.version(1).stores({
  sessions:        '&id, name, status, startedAt, project',
  actions:         '++id, sessionId, timestamp, type',
  recordingChunks: '++id, sessionId, chunkIndex',  // compressed?: boolean, data?: string
  screenshots:     '++id, sessionId, timestamp',
  bugs:            '++id, sessionId, timestamp, type, priority, bugStatus',
  features:        '++id, sessionId, timestamp, featureType',
  inspectedElements: '++id, sessionId, timestamp',
})
```

### Table: sessions
| Field | Type | Index | Description |
|-------|------|-------|-------------|
| id | string | PK | Auto-generated: `ats-YYYY-MM-DD-NNN` |
| name | string | | User-provided session name |
| description | string | | User-provided description |
| projectUrl | string | Yes | Base URL of target app |
| status | enum | Yes | `recording` / `paused` / `completed` |
| startedAt | Date | Yes | Session start timestamp |
| endedAt | Date | | Session end timestamp |
| pagesVisited | string[] | | Array of URLs navigated during session |
| actionsCount | number | | Total recorded actions |
| screenshotsCount | number | | Total screenshots taken |
| bugsCount | number | | Total bugs logged |
| featuresCount | number | | Total features logged |

### Table: events (action log)
| Field | Type | Index | Description |
|-------|------|-------|-------------|
| id | auto | PK | Auto-increment |
| sessionId | string | Yes | FK to sessions |
| timestamp | number | Yes | ms from session start |
| type | enum | Yes | `navigation` / `click` / `input` / `scroll` / `resize` / `custom` |
| url | string | | Current page URL |
| selector | string | | CSS selector of target element |
| selectorStrategy | enum | | `data-testid` / `aria-label` / `role` / `css` |
| elementText | string | | Visible text of element (for click actions) |
| inputValue | string | | Value typed (for input actions) |
| metadata | object | | Additional context (scroll position, viewport size, etc.) |

### Table: recordings (rrweb chunks)
| Field | Type | Index | Description |
|-------|------|-------|-------------|
| id | auto | PK | Auto-increment |
| sessionId | string | Yes | FK to sessions |
| chunkIndex | number | Yes | Order of chunk in session |
| events | Blob | | Serialized rrweb events (can be large) |

### Table: screenshots
| Field | Type | Index | Description |
|-------|------|-------|-------------|
| id | string | PK | `ss-{timestamp}` |
| sessionId | string | Yes | FK to sessions |
| timestamp | number | Yes | ms from session start |
| url | string | | Page URL at capture time |
| blob | Blob | | PNG image data |

### Table: issues (bugs + features)
| Field | Type | Index | Description |
|-------|------|-------|-------------|
| id | string | PK | `bug-NNN` or `feat-NNN` |
| sessionId | string | Yes | FK to sessions |
| timestamp | number | Yes | ms from session start |
| type | enum | Yes | `bug` / `feature` |
| priority | enum | Yes | `P0` / `P1` / `P2` / `P3` |
| description | string | | User-written description |
| url | string | | Page URL when logged |
| screenshotId | string | | FK to screenshots (auto-captured) |
| elementSelector | string | | Last-clicked element selector |
| precedingActions | object[] | | Last 5-10 actions before this issue was logged |

---

## Smart Selector Strategy

The quality of Playwright test export depends heavily on selector reliability. Refine uses a priority cascade:

```typescript
// selector-engine.ts
function getBestSelector(element: Element): { selector: string, strategy: string } {
  // Priority 1: data-testid (most stable, explicitly set by developers)
  const testId = element.getAttribute('data-testid')
  if (testId) return { selector: `[data-testid="${testId}"]`, strategy: 'data-testid' }

  // Priority 2: aria-label (accessible, fairly stable)
  const ariaLabel = element.getAttribute('aria-label')
  if (ariaLabel) return { selector: `[aria-label="${ariaLabel}"]`, strategy: 'aria-label' }

  // Priority 3: role + accessible name (Playwright-native)
  const role = element.getAttribute('role')
  const name = element.textContent?.trim().slice(0, 50)
  if (role && name) return { selector: `${role}:has-text("${name}")`, strategy: 'role' }

  // Priority 4: Unique text content (for buttons, links)
  if (['BUTTON', 'A'].includes(element.tagName) && name) {
    return { selector: `text="${name}"`, strategy: 'text' }
  }

  // Priority 5: CSS selector (least stable, last resort)
  return { selector: generateCssSelector(element), strategy: 'css' }
}
```

---

## Security Considerations

- [x] **No external network requests** â€” fully offline, no telemetry, no analytics
- [x] **Password masking** â€” rrweb masks `input[type=password]` by default
- [x] **Shadow DOM isolation** â€” overlay cannot read/modify target app DOM (beyond rrweb's read-only observation)
- [x] **Minimal permissions** â€” only `activeTab`, `storage`, `tabs` (for screenshots)
- [x] **No cookies/auth access** â€” extension does not read or store authentication tokens
- [ ] **Content script injection scope** â€” configure in manifest to only inject on user-specified URL patterns (not `<all_urls>`)

### Manifest Permissions (minimal)
```json
{
  "permissions": [
    "activeTab",
    "storage",
    "tabs",
    "alarms",
    "downloads"
  ],
  "host_permissions": [
    "http://localhost:*/*",
    "https://*.synaptixlabs.com/*"
  ]
}
```

Note: `host_permissions` can be expanded by the user in extension settings. Default covers localhost (dev) and SynaptixLabs domains.

---

## Key Technical Decisions

| Decision | Choice | Rationale | Alternatives Considered |
|---|---|---|---|
| Storage engine | IndexedDB (Dexie.js) | Handles 50MB+ per session; structured queries; no size limit per-key | `chrome.storage.local` (10MB limit), `chrome.storage.session` (1MB, lost on restart) |
| Overlay isolation | Shadow DOM | Prevents CSS/JS conflicts with target app | Iframe (heavier, messaging complexity), `!important` CSS (fragile) |
| rrweb event buffering | Batch flush every 5s | Reduces IPC overhead (chrome.runtime.sendMessage per event would be expensive) | Per-event send (too chatty), flush on page unload only (data loss risk) |
| Service worker keep-alive | chrome.alarms (25s interval) | Prevents Manifest V3 idle shutdown during active recording | Port-based keep-alive (deprecated), periodic message ping (unreliable) |
| Build tool | Vite + CRXJS | HMR support for extension development; handles manifest generation | Webpack (slower, more config), Plasmo (opinionated, less control) |

---

## Testing Strategy

| Layer | Tool | Scope |
|---|---|---|
| Unit | Vitest | `core/` modules: playwright-codegen, report-generator, selector-engine, compression, dashboard-generator. `shared/` utilities. `reporter/` CI reporter |
| Integration | Vitest + fake-indexeddb | Storage layer, session lifecycle, export pipeline (ZIP + replay + report) |
| E2E | Playwright (ADR-008) | Full extension flows via `chromium.launchPersistentContext()` with `--load-extension`. 29 specs across 10 spec files |

### Testing the extension during development
```bash
# Build
npm run build

# Load in Chrome
# 1. Navigate to chrome://extensions
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" â†’ select dist/ folder
# 4. Navigate to target app â†’ click extension icon

# Run E2E tests (requires built dist/ + target app on port 38470)
npx playwright test
```

---

## Scalability Notes

### Current Design (Internal Tool)
- Single user (Avi + small team)
- Local storage only
- No sync between machines
- Manual export/share of session files

### Future Considerations (If Needed)
- **Team sync:** Optional lightweight server to share session metadata (not recordings) between team members
- **Cloud backup:** Optional S3/R2 upload for session archives
- **CI integration:** Headless Playwright execution of exported regression scripts in CI pipeline
- **Firefox port:** Adapt Manifest V3 â†’ Firefox WebExtension API (mostly compatible, some differences in service worker behavior)

---

## Decisions Log

Major architectural decisions for this project logged in [0l_DECISIONS.md](0l_DECISIONS.md).

---

*Last updated: 2026-02-23 (v1.2.0 — Sprint 05 closure)*

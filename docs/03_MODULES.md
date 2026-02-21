# SynaptixLabs Refine — Module Registry

> **🚨 CRITICAL: Check Before Building**
> Owner: CTO
> **Always search this file before implementing new capabilities.**

---

## Module Index

| Module | Path | Tag | Status | Capabilities |
|--------|------|-----|--------|-------------|
| Background | `src/background/` | `[DEV:background]` | 🟡 WIP | Service worker, session lifecycle, message hub |
| Content | `src/content/` | `[DEV:content]` | 🟡 WIP | Content script, rrweb recording, control bar, bug editor |
| Popup | `src/popup/` | `[DEV:popup]` | 🟡 WIP | Extension popup UI, session list, new session form |
| Core | `src/core/` | `[DEV:core]` | 🟡 WIP | Storage (Dexie), report gen, Playwright codegen |
| Shared | `src/shared/` | `[DEV:shared]` | 🟡 WIP | Types, constants, message protocol, utilities |

**Status Key:** 🟢 Active | 🟡 WIP | 🔴 Deprecated | 📘 Reference

---

## Capability Registry

### Shared (`src/shared/`)

| Capability | Provides | Do NOT Re-implement |
|------------|----------|---------------------|
| Types | Session, Bug, Feature, Action, Report types | Module-specific type defs for shared concepts |
| Message Protocol | Chrome message types + helpers | Ad-hoc message passing |
| Constants | Session ID format, selector strategy, limits | Hardcoded magic values |
| Utilities | Timestamp formatting, ID generation | Duplicate utility functions |

### Background Module (`src/background/`)

| Capability | Provides | Do NOT Re-implement |
|------------|----------|---------------------|
| Session Lifecycle | Create, pause, resume, stop sessions | Session state in content script |
| Message Router | Central hub for popup ↔ content messaging | Direct popup-to-content messaging |
| Service Worker Keep-Alive | chrome.alarms for active sessions | Manual timers |

### Content Module (`src/content/`)

| Capability | Provides | Do NOT Re-implement |
|------------|----------|---------------------|
| rrweb Recording | Start/stop/pause DOM recording | Custom DOM recording |
| Control Bar | Floating overlay (Record/Pause/Stop/Screenshot/Bug) | Injected non-isolated UI |
| Bug/Feature Editor | Inline form with auto-context | Popup-based bug entry |
| Screenshot Capture | Requests via background → chrome.tabs.captureVisibleTab | html2canvas or canvas-based |
| Shadow DOM Host | Isolates all Refine UI from target page | Direct CSS injection |
| Action Tracker | Extracts user intent from rrweb events | Parallel event listeners |
| Selector Engine | Smart CSS selector: data-testid > aria-label > CSS (uses Shared constants) | Hardcoded selector preference |

### Popup Module (`src/popup/`)

| Capability | Provides | Do NOT Re-implement |
|------------|----------|---------------------|
| Session List | View all sessions with metadata | Background-based session browser |
| New Session Form | Create session with name + description | Content-script-based session creation |
| Session Actions | Delete, export, view replay | Direct IndexedDB access from popup |

### Core Module (`src/core/`)

| Capability | Provides | Do NOT Re-implement |
|------------|----------|---------------------|
| Storage Layer | Dexie.js wrapper for all IndexedDB ops | Raw IndexedDB calls |
| Report Generator | JSON + Markdown report from session data | Ad-hoc report formatting |
| Playwright Codegen | Action log → .spec.ts transformer | Manual test script writing |
| ZIP Bundler | Package replay + report + screenshots + spec | Multiple separate downloads |

---

## Cross-Module Communication

```
┌──────────┐     chrome.runtime     ┌────────────┐     chrome.runtime     ┌──────────┐
│  Popup   │ ◄──── messages ────►   │ Background │  ◄──── messages ────►  │ Content  │
│ (React)  │                        │  (Service  │                        │ (rrweb + │
│          │                        │   Worker)  │                        │  overlay)│
└──────────┘                        └─────┬──────┘                        └──────────┘
                                          │
                                    ┌─────▼──────┐
                                    │   Core     │
                                    │ (Storage,  │
                                    │  Reports,  │
                                    │  Codegen)  │
                                    └────────────┘
```

**Rule:** Modules communicate via Chrome messaging API through Background as hub. Core is a library consumed by Background. No direct cross-module imports except Shared.

---

*Last updated: 2026-02-20*

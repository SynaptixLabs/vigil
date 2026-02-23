# SynaptixLabs Refine — Module Registry

> **🚨 CRITICAL: Check Before Building**
> Owner: CTO
> **Always search this file before implementing new capabilities.**

---

## Module Index

| Module | Path | Tag | Status | Capabilities |
|--------|------|-----|--------|-------------|
| Background | `src/background/` | `[DEV:background]` | � Active | Service worker, session lifecycle, message hub, silence compression daemon |
| Content | `src/content/` | `[DEV:content]` | � Active | Content script, rrweb recording, control bar, bug editor, inspector, action tracker |
| Popup | `src/popup/` | `[DEV:popup]` | � Active | Session list, new session form, session detail, project settings, changelog modal |
| Core | `src/core/` | `[DEV:core]` | � Active | Storage (Dexie), report gen, Playwright codegen, replay bundler, ZIP bundler, dashboard generator, compression |
| Shared | `src/shared/` | `[DEV:shared]` | � Active | Types, constants, message protocol, utilities |
| Reporter | `src/reporter/` | `[DEV:reporter]` | 🟢 Active | Playwright CI reporter — maps test results to Refine session artifacts |
| Options | `src/options/` | `[DEV:options]` | 🟢 Active | Global settings page (output path configuration) |
| Replay Viewer | `src/replay-viewer/` | `[DEV:content]` | 🟢 Active | CSP-compliant extension tab for rrweb session replay |

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
| Session List | View all sessions with project/tag filtering | Background-based session browser |
| New Session Form | Create session with name, project, tags, mouse pref | Content-script-based session creation |
| Session Detail | Full session view with export actions, bug lifecycle, feature sprint | Direct IndexedDB access from popup |
| Project Settings | Per-project config export + dashboard refresh | Separate settings page per session |
| Changelog Modal | In-app "What's New" viewer from CHANGELOG.md | External changelog URL |
| Storage Indicator | `navigator.storage.estimate()` usage bar | Manual storage queries |

### Core Module (`src/core/`)

| Capability | Provides | Do NOT Re-implement |
|------------|----------|---------------------|
| Storage Layer | Dexie.js wrapper for all IndexedDB ops | Raw IndexedDB calls |
| Report Generator | JSON + Markdown report from session data | Ad-hoc report formatting |
| Playwright Codegen | Action log → .spec.ts transformer | Manual test script writing |
| ZIP Bundler | Package replay + report + screenshots + spec | Multiple separate downloads |
| Replay Bundler | rrweb chunks → self-contained HTML (decompresses on-the-fly) | Inline event arrays |
| Dashboard Generator | Project `index.html` with session table + inline reports | Per-session HTML pages |
| Compression | `CompressionStream` gzip encode/decode for rrweb chunks | Third-party compression libs |
| Publish | Multi-file `chrome.downloads` export to project folder | Per-artifact download triggers |

### Reporter Module (`src/reporter/`)

| Capability | Provides | Do NOT Re-implement |
|------------|----------|---------------------|
| Playwright CI Reporter | `onStepEnd`→Action, `onTestEnd`→Bug, `onEnd`→artifacts + dashboard | Custom Playwright reporter |

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

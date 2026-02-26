# Changelog

All notable changes to SynaptixLabs Vigil.

## [1.2.0] - 2026-02-23

### Added
- **R015 — Silence Compression Daemon**: background `chrome.alarms` task runs hourly, compresses rrweb chunks older than 7 days using native `CompressionStream` (gzip), stores base64 in `RecordingChunk.data`, clears raw `events` array to free IndexedDB space
- **Project Dashboard Generator**: `generateProjectDashboard()` produces a self-contained `index.html` with session table, bug/feature counts, links to replay and spec, and inline report toggle; auto-generated on `publishSession()`
- **ProjectSettings page**: gear button in session list filter bar opens per-project settings; allows manual export of `refine.project.json` and dashboard refresh via `chrome.downloads`
- **`refine.project.json` schema**: `RefineProjectConfig` interface added to shared types; exported to `<outputPath>/<project>/refine.project.json` on publish
- **Playwright CI Reporter** (`src/reporter/refine-reporter.ts`): implements Playwright `Reporter` interface; maps `onStepEnd` → `Action`, `onTestEnd` failures → `Bug`, `onEnd` → session artifacts on disk + dashboard regeneration; configured via `REFINE_OUTPUT_PATH`, `REFINE_BASE_URL`, `REFINE_PROJECT_NAME` env vars
- **Windsurf Workflows**: `/refine-record` and `/refine-review` workflow definitions in `.windsurf/workflows/`
- **Replay decompression**: `generateReplayHtml` now accepts `RecordingChunk[]` and decompresses compressed chunks on the fly before rendering

### Fixed (Design Review — Sprint 05)
- **`SessionDetail.tsx`**: added missing `P0` entry to `PRIORITY_COLORS` map (P0 bugs rendered with no color class)
- **`refine-reporter.ts`**: session ID now matches `SESSION_ID_FORMAT` regex (`ats-YYYY-MM-DD-NNN`); removed `Session & { source }` type intersection hack; switched to `@shared` / `@core` path aliases
- **`dashboard-generator.ts`**: replaced `any[]` parameter types with `Session[]` / `Bug[][]`; `source` badge now derived from session `tags` (`ci`/`automated`) instead of non-existent `session.source` field
- **`inspector.ts`**: `InspectedElement.id` now uses `crypto.randomUUID()` for consistency with all other ID generators
- **`keep-alive.ts`**: imports `KEEPALIVE_ALARM_NAME` from `@shared/constants` instead of duplicating the string literal
- **`NewSession.tsx`**: removed duplicate `setActiveTabId` call
- **`messages.ts`**: removed stale Sprint 01 TODO comment
- **`message-handler.test.ts`**: fixed `source: 'test'` type error — changed to valid `'content'` value

### Architecture Decisions
- Compression round-trip uses `Response.body` streams (CompressionStream workaround for Vitest jsdom) (S04-001)
- Dashboard badge uses session `tags` array to detect CI sessions (no `source` field on `Session`) (S05-001)

## [1.1.0] - 2026-02-22

### Added
- **R021 — Bugs & Features MD export**: dedicated Markdown export with bug table, feature list, and priority grouping
- **R022 — Action annotation**: long-press the Annotate button (500ms) in the overlay to attach a note to the last recorded action; notes appear as `// NOTE:` comments in generated Playwright specs
- **R023 — Element inspector mode**: toggle the Inspect button to enable hover-highlight + click-capture of any DOM element; captured selectors stored in IndexedDB and shown in session detail
- **R024 — Dark/light theme toggle**: sun/moon button in overlay control bar persists theme via `chrome.storage.local`; applied as `data-theme` attribute on the Shadow DOM host
- **R025 — Project association + auto-publish**: Project name + output path on new session form; "Publish to Project" button in session detail triggers multi-file `chrome.downloads` export to `<outputPath>/<project>/sessions/<id>/`
- **R026 — Bug lifecycle status**: click-to-cycle status badge (open → in_progress → resolved → wontfix) on each bug in session detail
- **R027 — Feature sprint assignment**: inline sprint field on each feature card; persisted immediately to IndexedDB
- **R020 — Session tagging**: tags now flow end-to-end (form → background → DB → JSON/MD reports)
- **Replay Extension Page**: "Watch Replay" opens a CSP-compliant extension tab (`src/replay-viewer/`) instead of downloading HTML; rrweb-player loaded as ES module, events fetched directly from IndexedDB
- **Mouse Tracking Preference**: checkbox on new session form controls `rrweb sampling.mousemove` (0 = off, 50ms = on); preference stored in session record
- **In-App Changelog Viewer**: "What's New" button in session list footer opens bottom-sheet modal; blue dot badge shown on first launch after a version bump
- **StorageIndicator**: `navigator.storage.estimate()` usage bar in session list footer

### Fixed (Phase 1 Infra)
- **DR-02**: SHORTCUT_MAP from `@shared/constants` now drives keydown handler in `content-script.ts` (no more hardcoded key literals)
- **DR-03**: ZIP bundle now ships `playwright.tsconfig.json` (proper `moduleResolution: node`, `esModuleInterop: true`) instead of minimal stub
- **B13**: Shadow DOM host element `style.cssText` now includes `pointer-events: none` so page pointer events pass through
- **DR-04**: `chrome.tabs.onUpdated` listener in `service-worker.ts` detects full-page navigations and notifies content script
- **R020/R025 pipeline**: `tags`, `project`, `outputPath` now correctly extracted from `CREATE_SESSION` payload and stored in session

### Architecture Decisions
- Replay viewer uses `import('rrweb-player')` dynamic import (CSP-safe; no inline scripts) (S03-001)
- Mouse tracking preference stored as `recordMouseMove: boolean` on Session record (S03-002)
- Changelog inlined at build time via `?raw` Vite import from `CHANGELOG.md` (S03-003)

## [1.0.0] - 2026-02-22

### Added
- **Session recording engine** (R001-R002): rrweb DOM recording across page navigations, auto-chunked to IndexedDB via Dexie.js
- **Floating control bar** (R003): Shadow DOM overlay with record/pause/resume/stop, recording pulse indicator
- **Screenshot capture** (R004): `Ctrl+Shift+S` or button — stored with URL + timestamp
- **Inline bug/feature editor** (R005): priority P0-P3, auto-fills URL + last-clicked selector
- **Session report export** (R006): JSON + Markdown report with timeline, bugs, features, screenshots
- **Session management** (R007): session list, detail view, cascading delete with confirmation
- **Visual replay** (R010): self-contained HTML with inlined rrweb-player — download and open in any browser
- **Playwright spec export** (R011): `.spec.ts` with `page.goto`, `page.click`, `page.fill`, `toHaveURL` assertions and `// BUG:` markers
- **ZIP bundle export** (R012): one download containing replay.html, report.json, report.md, regression.spec.ts, screenshots/
- **Keyboard shortcuts** (R013): `Ctrl+Shift+R` toggle recording, `Ctrl+Shift+S` screenshot, `Ctrl+Shift+B` bug editor
- **Demo app** (TaskPilot): Vite/React SPA at `demos/refine-demo-app/` for manual testing

### Fixed
- ZIP download: blob URL string was wrapped in a second Blob (produced 93-byte file)
- Action recording: DOM click/input listeners now added in `recorder.ts` (rrweb events alone were unreliable)
- Playwright codegen: navigation URL was missing from `page.goto`; `escapeRegex` now escapes `/`
- Session pages: `chrome-extension://` and `chrome://` URLs filtered from `session.pages`
- Keyboard shortcut E2E: added DOM `keydown` fallback in content script (Playwright cannot trigger `chrome.commands`)
- TypeScript: `@types/css-font-loading-module` conflict resolved via `npm overrides` + local empty stub
- **Replay CSP**: `Watch Replay` changed from `chrome.tabs.create(blobUrl)` to file download — MV3 CSP blocks inline scripts in `blob:chrome-extension://` tabs

### Architecture Decisions
- rrweb-player inlined as UMD (~230 KB) in replay HTML for offline portability (S02-001)
- Playwright codegen uses CSS attribute string selectors for type safety (S02-007)
- `npm overrides` + empty stub to neutralise stale `@types/css-font-loading-module` from rrweb (S02-010)
- Dual-path keyboard shortcuts: `chrome.commands` (background) + DOM keydown fallback (content script) (S02-011)

### Known Limitations
- Replay must be downloaded and opened from the filesystem (Sprint 03 will add a CSP-compliant extension replay page)
- Mouse move events recorded at 50ms interval — configurable mouse tracking preference coming in Sprint 03
- No project/app association on sessions — coming in Sprint 03 (R025)

## [0.1.0] - 2026-02-20

### Added
- Project scaffolded from Windsurf-Projects-Template
- PRD with 7 P0, 4 P1, 5 P2 requirements
- Architecture document (Manifest V3, module layout, data model)
- Module structure: background, content, popup, core, shared
- Windsurf agent roles customized for Chrome Extension development
- Sprint-00 kickstart plan
- Decision log with 7 pre-approved ADRs

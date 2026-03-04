# What's New

## [2.0.0] - 2026-03-04

### Added
- Sessions now belong to a project — pick your project when starting a session
- Sprint is auto-detected, no need to set it manually
- Your sessions are saved to the cloud and survive browser restarts
- New management dashboard to browse sessions, bugs, and features
- Screenshots display in session detail view
- Export options: JSON report, Markdown, Playwright test, replay, ZIP bundle

### Improved
- Bug editor shortcut changed to Alt+Shift+G (no longer conflicts with Chrome)
- Better error handling when posting sessions — retries with clear status messages
- Session history shows bug count, screenshot count, and duration at a glance

### Fixed
- Recording toggle (SPACE) no longer fires inside text fields
- Sessions now save sprint and description correctly to the database

## [1.2.0] - 2026-02-23

### Added
- Old recordings are automatically compressed to save storage space
- Project dashboard: a summary page with session table and bug counts
- Replay viewer now handles compressed recordings seamlessly

### Improved
- Better bug priority colors in session detail

## [1.1.0] - 2026-02-22

### Added
- Export bugs and features as Markdown
- Annotate actions with notes (long-press the Annotate button)
- Element inspector: hover and click to capture any element's selector
- Dark/light theme toggle in the control bar
- Tag your sessions for easy filtering
- Watch Replay now opens in a dedicated viewer tab

## [1.0.0] - 2026-02-22

### Added
- Record your testing sessions with full DOM replay
- Capture screenshots with Ctrl+Shift+S
- Log bugs and feature requests inline while testing
- Export Playwright test specs from your session
- Download everything as a ZIP bundle

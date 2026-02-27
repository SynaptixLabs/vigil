# BUG-FAT-010 — Ctrl+Shift+B conflicts with Chrome bookmarks bar toggle

## Status: FIXED (workaround) — manifest fix deferred to S07-19
## Severity: P2
## Sprint: 06
## Discovered: 2026-02-27 via manual: FAT Round 2 live testing with Founder

## Steps to Reproduce

1. Install Vigil extension (fresh install or after remove + re-add)
2. Go to `chrome://extensions/shortcuts`
3. Check "Open bug editor" shortcut assignment

## Expected

`Ctrl+Shift+B` assigned to "Open bug editor."

## Actual

Shortcut is **not set** — Chrome silently drops it because `Ctrl+Shift+B` is Chrome's built-in "Toggle bookmarks bar" shortcut. Chrome built-in shortcuts take precedence over extension `suggested_key`.

## Workaround (Sprint 06)

User manually sets "Open bug editor" to `Alt+Shift+B` in `chrome://extensions/shortcuts`.

## Fix (S07-19)

Change `manifest.json` `commands.open-bug-editor.suggested_key.default` from `Ctrl+Shift+B` to `Alt+Shift+B`.

## Regression Test

File: —
Status: Manual verification only

## Resolution

Workaround applied during FAT Round 2. Manifest fix deferred to S07-19 (~0.5V).

*Assigned: [DEV:ext]*

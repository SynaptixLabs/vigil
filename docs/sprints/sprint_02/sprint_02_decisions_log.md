# Sprint 02 — Decisions Log

| ID | Decision | Rationale | Date | Decider |
|---|---|---|---|---|
| S02-001 | rrweb-player inlined in replay HTML | Self-contained file — no CDN, works offline, shareable | 2026-02-21 | CTO |
| S02-002 | Playwright codegen: navigate + click + fill + toBeVisible assertions | Standard Playwright patterns. Bug locations marked with `// BUG:` comments | 2026-02-21 | CTO |
| S02-003 | JSZip for client-side ZIP creation | Add as dependency. No server needed — fully client-side | 2026-02-21 | CTO |
| S02-004 | Keyboard shortcuts via `chrome.commands` manifest API | Native extension shortcuts work when popup closed. Ctrl+Shift+R/S/B | 2026-02-21 | CTO |
| S02-005 | Generated spec includes `// BUG:` comments at bug-logged locations | Links Playwright test to original bug context — QA sees where issues were found | 2026-02-21 | CTO |

---

## Notes

- S02-001: rrweb-player JS + CSS are inlined into the replay.html via string template. File is ~200KB but fully portable. Consider CDN link as optional optimization later.
- S02-003: JSZip must be added to `package.json` dependencies before Sprint 02 starts. CTO to add during kickoff.
- S02-004: `manifest.json` needs a `commands` section added. Max 4 shortcuts allowed by Chrome.

---

*Last updated: 2026-02-21*

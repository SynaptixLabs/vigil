# Sprint 07 — Product Vision (Founder Feedback from FAT Round 2)

> Captured: 2026-02-27 during Sprint 06 FAT Round 2 live testing.
> Source: [FOUNDER] inline feedback during acceptance walkthrough.

---

## P1 — Project-Oriented Session Model (~5V)

The session creation flow must become **project-oriented**. Currently sessions are standalone recordings with no structural link to projects or sprints.

### Requirements

- [ ] **Project field = required** — folder path (e.g. `C:\Synaptix-Labs\projects\vigil`). This IS the project identity.
- [ ] **Sprint auto-detected** from project's `docs/sprints/` folder structure. Auto-selects latest sprint. User can change via dropdown.
- [ ] **Session name auto-generated** (e.g. `vigil-session-2026-02-27-001`). User can edit.
- [ ] **Description field** — free-text, user-typed. In future sprints, AI will auto-fill.
- [ ] **Persistent history** — last project/sprint choices are remembered. Next session shows previous selections. User can pick from history or create NEW.
- [ ] **Manifest shortcut fix** (BUG-FAT-010) — change `Ctrl+Shift+B` → `Alt+Shift+B` in `manifest.json` `suggested_key` to avoid Chrome bookmarks bar conflict.

### Data Model Change

```
Session (current):      name, url, tabId, tags
Session (S07 target):   project (folder), sprint (auto), name (auto), description, url, tabId
```

---

## P2 — Dashboard Overhaul (~6V)

The dashboard is currently a flat bug list viewer. It must become a **product-oriented workflow tool**.

### Requirements

- [ ] **Navigation hierarchy:** Project selector → Sprint view → Session drill-down
- [ ] **Sprint context:** Show what project/repo the sprint belongs to. Currently says "Sprint 06" with no context.
- [ ] **Filters:** By project, sprint, session
- [ ] **Bug/feature detail:** Show attached screenshots inline
- [ ] **Session timeline:** Visual timeline of session events (recordings, screenshots, bugs)
- [ ] **Recording replay:** Play rrweb recording directly in dashboard
- [ ] **Session list:** Show sessions within a sprint (like a chat history — latest first, can browse others)

### Architecture Notes

Dashboard currently reads from filesystem via vigil-server API. S07 may migrate to Neon PostgreSQL (S07-15), which would change the data layer but not the UI requirements.

---

## P3 — Data Integrity (~2V)

Deferred bugs from Sprint 06 + new UX gaps found during FAT:

- [ ] **BUG-EXT-001 (P2):** Playwright codegen generates invalid TypeScript — `playwright-codegen.ts:110` regex literal issue
- [ ] **BUG-EXT-002 (P3):** `btn-publish` testid missing from SessionDetail — spec-first gap, feature never implemented
- [ ] **Ghost session recovery:** When page refreshes during active session, user has no way to end the orphaned session. Need "End stale session" button in side panel.

---

## P4 — AI-Assisted Fields (Future — S08+)

- [ ] AI auto-fill session description based on recorded actions
- [ ] AI auto-fill bug title + steps-to-reproduce from screenshot + context
- [ ] AI severity auto-suggest with confidence score (user overrides)

> These depend on S07-01 through S07-06 (AGENTS platform integration) shipping first.

---

*Owner: [FOUNDER] + [CPO] | Recorded by: [CPTO]*

# Sprint 08 — Side Panel UX Improvements

**Source:** FAT Sprint 07 walkthrough (2026-03-04)
**Requested by:** [FOUNDER]
**Priority:** P2

---

## FEAT-SP-001 — Keyboard Shortcuts Legend in Side Panel

**Status:** TODO
**Area:** Extension (side panel)

Add a visible legend of available keyboard shortcuts in the RHS side panel.

| Shortcut | Action |
|---|---|
| SPACE | Toggle recording (not in input fields) |
| Alt+Shift+V | Toggle recording (global) |
| Ctrl+Shift+S | Capture screenshot |
| Alt+Shift+G | Open bug editor |

**AC:**
- [ ] Legend visible in side panel (collapsible or always-on)
- [ ] Shows all active shortcuts
- [ ] Updates if shortcuts change

---

## FEAT-SP-002 — End Session Button in Project Tab

**Status:** TODO
**Area:** Extension (side panel)

Add an End Session button in the RHS Project tab that ends the session same as the red control bar button.

**AC:**
- [ ] End Session button visible in Project tab when session is active
- [ ] Triggers same logic as control bar (endSession → POST to Vercel)
- [ ] Hidden when no active session

---

## FEAT-SP-003 — Session Counters in Project Tab

**Status:** TODO
**Area:** Extension (side panel)

Add live counters in the RHS Project tab showing session activity: screenshots taken, bugs opened, recordings (start+stop pairs). Update in real-time.

**AC:**
- [ ] Screenshot counter increments on Ctrl+Shift+S
- [ ] Bug counter increments on bug submit
- [ ] Recording counter increments on each segment
- [ ] Counters reset on new session

---

## FEAT-SP-004 — What's New: Human-Readable, Not Markdown

**Status:** TODO
**Area:** Extension (side panel / popup)
**Source:** FAT observation

The "What's New" section should be shorter and written in plain human-readable language for end users. Not markdown format.

**AC:**
- [ ] What's New content is concise, non-technical
- [ ] No markdown syntax visible to users
- [ ] Max 3-5 bullet points per release

---

*Logged: 2026-03-04 | [CPTO] from FAT walkthrough*

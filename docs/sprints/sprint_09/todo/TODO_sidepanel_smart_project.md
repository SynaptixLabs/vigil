# TODO — Smart Project Detection in Side Panel

**Sprint:** 09 | **Owner:** `[DEV:ext]` | **Priority:** P1 | **Vibes:** ~4V
**Files:** `src/sidepanel/` (side panel React app)

---

## Instructions

| Role | Checkbox | Report file |
|------|----------|-------------|
| DEV | `[x] Dev` | `reports/DEV_sidepanel_{YYYY-MM-DD}.md` |
| QA | `[x] QA` | `reports/QA_sidepanel_{YYYY-MM-DD}.md` |
| GBU | `[x] GBU` | `reports/DR_sidepanel_{YYYY-MM-DD}.md` |

**DONE = all 3 checked + all 3 reports exist.**

---

## Context

When the side panel opens, it should be smart about which project the user is working on. Instead of showing a flat list, auto-detect the project from the current tab's URL, show that project's sessions, and offer quick actions.

---

## Requirements

### SP01 — Auto-detect project by URL (~1.5V)

**On side panel open:**
1. Get the current tab URL via `chrome.tabs.query({ active: true, currentWindow: true })`
2. Fetch all projects from server: `GET /api/projects`
3. Match current URL against project URLs (each project has a `url` field)
   - Match by origin (protocol + host) — `new URL(tabUrl).origin === new URL(project.url).origin`
   - If exact origin match → auto-select that project
   - If no match → show "No project matches this site" with project selector
4. Store last-selected project per URL origin in `chrome.storage.local` as fallback

**AC:**
- [ ] Opening side panel on `https://myapp.com/page` auto-selects project with URL `https://myapp.com`
- [ ] Opening side panel on unknown URL shows project picker
- [ ] Last-used project is remembered per origin

### SP02 — Top bar with project context + actions (~1V)

**Top bar layout (always visible):**
```
┌─────────────────────────────────────────────┐
│ [Project Dropdown ▾]  [+ Project] [+ Session]│
│  ↳ matched: "MyApp" (auto)                   │
└─────────────────────────────────────────────┘
```

- **Project dropdown:** shows all projects sorted by most recent activity (last session date). Current project highlighted. Selecting switches view.
- **"+ Project" button:** opens new project creation form (inline or modal)
- **"+ Session" button:** starts new session for the selected project (disabled if no project selected)
- If project was auto-detected, show subtle "(auto)" indicator

**AC:**
- [ ] Dropdown lists all projects sorted by last session date (most recent first)
- [ ] Selecting a project from dropdown switches the session list
- [ ] "+ Project" opens new project form
- [ ] "+ Session" starts new session for current project
- [ ] "+ Session" disabled when no project selected

### SP03 — Session list for selected project (~1V)

**When a project is selected (auto or manual):**
- Show sessions for that project only, sorted newest first
- Each session card: name, date, bug count, feature count, duration
- If no sessions → show empty state: "No sessions yet for [project name]. Start your first recording."
- If no project selected → show empty state: "Select a project or create a new one to start."

**AC:**
- [ ] Session list filtered to selected project
- [ ] Empty state when no sessions for project
- [ ] Empty state when no project selected
- [ ] Sessions sorted newest first

### SP04 — "Latest projects" as default filter (~0.5V)

**Project dropdown sort order:**
1. Projects with most recent session activity first (last session `created_at`)
2. Projects with no sessions at bottom
3. Within same activity date, alphabetical by name

**AC:**
- [ ] Projects sorted by most recent session activity
- [ ] Empty projects at bottom of list
- [ ] Sort is the default (no toggle needed for V1)

---

## Technical Notes

- The side panel is at `src/sidepanel/sidepanel.html` → React app
- Projects come from `GET /api/projects` on vigil-server
- Sessions come from `GET /api/sessions?project={projectId}`
- Use `chrome.tabs.query` for current tab URL (MV3 compatible)
- Store URL→project mapping in `chrome.storage.local` for persistence
- The side panel already has a session list — this refactors it to be project-aware

---

## Dependency Map

```
SP01 (auto-detect) ──→ SP02 (top bar) ──→ SP03 (filtered sessions)
                                       ──→ SP04 (sort order)
```

---

*TODO: Smart Project Detection | Sprint 09 | Owner: [DEV:ext]*

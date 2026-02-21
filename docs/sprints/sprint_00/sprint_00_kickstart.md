# Refine — Sprint-0 Kickstart Plan

> **For the incoming PM/CTO lead**
> Starting point: `C:\Synaptix-Labs\projects\Windsurf-Projects-Template`

---

## What You're Receiving

| Document | File | Purpose |
|---|---|---|
| Discussion Summary | `docs/knowledge/00_DISCUSSION_SUMMARY.md` | Full context: why this exists, options evaluated, decisions made |
| PRD | `docs/0k_PRD.md` | Filled product requirements — 7 P0, 4 P1, 5 P2 requirements |
| Architecture | `docs/01_ARCHITECTURE.md` | Filled tech architecture — Manifest V3, module layout, data model, selector strategy |
| This file | `docs/sprint_00_kickstart.md` | Your execution checklist |

**Decision already made by CPTO (Avi):** Chrome Extension, not in-app module. Unpacked developer mode distribution (no Web Store). See Discussion Summary §3 for reasoning.

---

## Sprint-0 Checklist (Your First Day)

### Phase 1: Repo Setup (1-2 hours)

```powershell
# 1. Clone the template
cd C:\Synaptix-Labs\projects
git clone --depth 1 C:\Synaptix-Labs\projects\Windsurf-Projects-Template synaptix-Refine
cd synaptix-Refine
Remove-Item -Recurse -Force .git
git init
git add .
git commit -m "init: from Windsurf-Projects-Template"
```

- [ ] **Adapt folder structure to Type C (CLI/Extension variant):**

```
synaptix-Refine/
├── .windsurf/rules/          ← Keep (customize roles)
├── .claude/                   ← Keep (customize commands)
├── docs/                      ← Keep (copy provided PRD + Architecture + Summary)
│   ├── 00_INDEX.md
│   ├── 0k_PRD.md             ← REPLACE with provided file
│   ├── 01_ARCHITECTURE.md    ← REPLACE with provided file
│   ├── knowledge/
│   │   └── 00_DISCUSSION_SUMMARY.md  ← COPY provided file
│   └── sprints/
├── src/                       ← NEW (replace backend/frontend/ml-ai-data)
│   ├── background/
│   ├── content/
│   ├── popup/
│   ├── core/
│   └── shared/
├── tests/
│   ├── unit/
│   └── integration/
├── dist/                      ← Build output (loaded as unpacked extension)
├── AGENTS.md                  ← Customize
├── CLAUDE.md                  ← Fill placeholders
├── manifest.json              ← Chrome Manifest V3
├── vite.config.ts
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

- [ ] **Delete unused template folders:** `backend/`, `frontend/`, `ml-ai-data/`, `shared/`
- [ ] **Create `src/` structure** per architecture doc

### Phase 2: Template Placeholders (30 min)

Run the placeholder finder:
```powershell
Get-ChildItem -Recurse -Include *.md | Select-String "{{" | Select-Object Path, LineNumber, Line
```

Key replacements:

| Placeholder | Value |
|---|---|
| `{{PROJECT_NAME}}` | SynaptixLabs Refine |
| `{{PROJECT_DESCRIPTION}}` | Chrome Extension for manual acceptance test recording with Playwright export |
| `{{VERSION}}` | 0.1.0 |
| `{{DATE}}` | 2026-02-20 |
| `{{BACKEND_LANG}}` | N/A (client-side only) |
| `{{FRONTEND_FRAMEWORK}}` | React 18 (Chrome Extension popup + content overlay) |

### Phase 3: Initialize the Extension Project (1-2 hours)

```bash
# Init Node.js project
npm init -y

# Core dependencies
npm install react react-dom rrweb rrweb-player dexie lucide-react

# Dev dependencies
npm install -D typescript vite @crxjs/vite-plugin @types/react @types/react-dom \
  @types/chrome tailwindcss postcss autoprefixer vitest \
  eslint prettier

# Init TypeScript
npx tsc --init

# Init Tailwind
npx tailwindcss init -p
```

- [ ] Create `manifest.json` (see Architecture doc §Security for permissions)
- [ ] Create `vite.config.ts` with CRXJS plugin
- [ ] Verify: `npm run build` produces `dist/` folder
- [ ] Verify: load `dist/` as unpacked extension in Chrome → icon appears

### Phase 4: Customize Agent Roles (30 min)

- [ ] Update `.windsurf/rules/role_cto.md` — scope to Chrome Extension, Manifest V3, rrweb
- [ ] Update `.windsurf/rules/role_cpo.md` — scope to Refine product
- [ ] Remove `role_backend_dev.md`, `role_ml_dev.md` (not applicable)
- [ ] Keep `role_frontend_dev.md` → rename to `role_extension_dev.md`
- [ ] Update `AGENTS.md` Tier-1 with Refine-specific module names

### Phase 5: Validate Sprint-0 Deliverables (15 min)

| # | Artifact | Status |
|---|---|---|
| 1 | Project README.md written | ☐ |
| 2 | Folder structure adapted (Type C: Extension) | ☐ |
| 3 | `docs/0k_PRD.md` — provided, verify in place | ☐ |
| 4 | `docs/01_ARCHITECTURE.md` — provided, verify in place | ☐ |
| 5 | `docs/03_MODULES.md` — initial module list (background, content, popup, core) | ☐ |
| 6 | `AGENTS.md` customized | ☐ |
| 7 | `CLAUDE.md` placeholders filled | ☐ |
| 8 | `package.json` configured | ☐ |
| 9 | `manifest.json` created | ☐ |
| 10 | `npm run build` works → loads in Chrome | ☐ |
| 11 | Sprint-01 plan drafted | ☐ |

---

## Sprint Plan Overview

| Sprint | Focus | Deliverable | Est. Effort |
|---|---|---|---|
| **Sprint 00** | Repo setup, scaffold, hello-world extension | Extension loads, popup shows, content script injects into page | 1 day |
| **Sprint 01** | P0 MVP: Recording + Screenshots + Bug Editor | Record session, capture screenshots, log bugs inline. Control bar visible on target app | 3 days |
| **Sprint 02** | P0 Complete: Reports + Session Management. P1: Replay | Session list, delete, report generation. rrweb-player replay | 2 days |
| **Sprint 03** | P1: Playwright Export + ZIP Bundle + Keyboard Shortcuts | Export .spec.ts, download ZIP, shortcuts working | 2 days |

**MVP (Sprint 00-01):** 4 days → usable for Avi to record sessions and log bugs
**Full product (Sprint 00-03):** 8 days → complete with Playwright export and visual replay

---

## Key Technical Decisions (Already Made)

These decisions were made during the CPTO discussion. You can challenge them but they're pre-approved:

| Decision | Choice | Do NOT |
|---|---|---|
| Platform | Chrome Extension (Manifest V3) | Don't build as in-app module |
| Distribution | Unpacked (developer mode) | Don't submit to Chrome Web Store |
| Storage | IndexedDB via Dexie.js | Don't add a server/API component |
| DOM recording | rrweb | Don't build custom recording |
| Build tool | Vite + CRXJS | Don't use Webpack or Plasmo |
| Overlay isolation | Shadow DOM | Don't inject CSS into target app |
| UI | React 18 + Tailwind | Don't use other frameworks |

---

## Open Questions (Your Call)

These were flagged as "new PM/CTO decides":

1. **Session data lifecycle** — Auto-purge after N days? Or manual cleanup only?
2. **Multi-tab support** — Track across tabs in one session? (Recommend: single-tab for MVP)
3. **Selector strategy default** — `data-testid` > `aria-label` > CSS (recommended). Confirm or adjust.
4. **Product name** — "SynaptixLabs Refine" or something catchier? (e.g., "Witness", "Session", "PRefineol")
5. **Extension icon / branding** — Use SynaptixLabs brand colors (orange #F97316 + blue #3B82F6) or distinct?

---

## Contacts

| Role | Person | Reach via |
|---|---|---|
| CPTO / Final approver | Avi | Direct (Founder) |
| QA consumers (Papyrus) | QA-1, QA-2 teams | Sprint docs |
| DEV consumers (Papyrus) | DEV team | Sprint docs |

---

*Created: 2026-02-20 | Ready for Sprint-0 execution*

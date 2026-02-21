# 🔧 TEAM DEV — Sprint 00 Kick-Off Message

**Copy-paste this into your Windsurf / Claude Code session to start DEV work.**

---

## PROJECT CONTEXT

You are `[DEV:scaffold]` on **SynaptixLabs Refine** — a Chrome Extension (Manifest V3) that records manual acceptance testing sessions on any web app. It captures DOM state via rrweb, extracts user actions for Playwright test generation, and provides inline bug/feature logging — all without modifying the target app.

**Repo:** `C:\Synaptix-Labs\projects\project-refiner`
**Product name:** Refine (SynaptixLabs Refine)
**Architecture:** Chrome Extension with 3 execution contexts: Background Service Worker, Content Script, Popup (React)

### Tech stack (already configured)
- **Build:** Vite 5.4 + CRXJS 2.0.0-beta + React 18 + TypeScript 5 strict
- **Styling:** Tailwind CSS 3
- **Storage:** Dexie.js (IndexedDB) — not used in Sprint 00, just installed
- **Recording:** rrweb — not used in Sprint 00, just installed
- **Testing:** Vitest (unit) + Playwright (E2E, owned by QA team)
- **Node:** >=20.0.0

### What's already done (CPTO pre-work — DO NOT recreate these)
All config files are created and reviewed. They are the source of truth:
- `package.json` — all deps + scripts configured
- `tsconfig.json` — strict mode, path aliases (@shared/, @core/, etc.), project references
- `tsconfig.node.json` — node config for Vite/Vitest/Tailwind
- `vite.config.ts` — CRXJS plugin, React, resolve aliases
- `manifest.json` — MV3, permissions, entry points
- `tailwind.config.ts` + `postcss.config.js`
- `.eslintrc.cjs` + `.prettierrc`
- `.github/workflows/ci.yml`

---

## YOUR MISSION (Sprint 00)

Build the **hello-world Chrome Extension scaffold** that compiles, loads in Chrome, and passes unit tests. No feature work — just a clean, buildable, testable skeleton.

### Step 0: Install dependencies
```bash
cd C:\Synaptix-Labs\projects\project-refiner
npm install
```

### Phase 2: Source Entry Points (your main work)

Create these files **in this order**:

| # | File | What it does |
|---|---|---|
| D007 | `src/shared/types.ts` | TypeScript interfaces and enums: `Session`, `Bug`, `Feature`, `Action`, `MessageType`, `SessionStatus`, `BugPriority`, `FeatureType`. Stubs with JSDoc comments. |
| D008 | `src/shared/constants.ts` | `SESSION_ID_FORMAT` regex (`/^ats-\d{4}-\d{2}-\d{2}-\d{3}$/`), `SELECTOR_PRIORITIES` array (`['data-testid', 'aria-label', 'id', 'css']`), `LIMITS` object (maxSessionDuration, maxEventsPerSession, etc.), `DEFAULT_VALUES` |
| D009 | `src/shared/messages.ts` | Chrome message protocol types for popup↔background↔content communication. Type-safe `sendMessage`/`onMessage` helpers wrapping `chrome.runtime.sendMessage` |
| D010 | `src/shared/utils.ts` | `generateSessionId()` → `ats-YYYY-MM-DD-NNN` format, `formatTimestamp()` → human-readable, `generateBugId()` → `bug-XXXXX` unique ID |
| D010b | `src/shared/index.ts` | **Barrel export** — re-exports everything from types, constants, messages, utils. All other modules import from `@shared/` or `@shared/index` |
| D011 | `src/background/service-worker.ts` | Minimal service worker: listens for `chrome.runtime.onMessage`, logs messages, responds with `{ ok: true }`. Placeholder keep-alive comment. |
| D012 | `src/content/content-script.ts` | Minimal content script: logs `"[Refine] Content script loaded on: <URL>"` to console on injection. No DOM manipulation yet. |
| D013 | `src/popup/popup.html` | HTML shell: `<!DOCTYPE html>`, React mount point `<div id="root">`, Tailwind CSS import via `<link>` or inline |
| D014 | `src/popup/index.tsx` + `src/popup/App.tsx` | `index.tsx`: React 18 `createRoot` mount. `App.tsx`: renders "SynaptixLabs Refine" title, version from manifest, "No sessions yet" placeholder. Basic Tailwind styling. |

### Phase 3: Unit Test Infrastructure

| # | File | What it does |
|---|---|---|
| D015 | `vitest.config.ts` | Vitest config: resolve aliases matching tsconfig, environment `jsdom`, coverage provider `v8`, include `tests/unit/**` and `tests/integration/**` |
| D016 | `tests/unit/shared/constants.test.ts` | Test `SESSION_ID_FORMAT` regex matches valid IDs and rejects invalid. Test `SELECTOR_PRIORITIES` order. Verify all expected constants are exported. |
| D017 | `tests/unit/shared/utils.test.ts` | Test `generateSessionId()` format matches regex, test `formatTimestamp()` output, test `generateBugId()` uniqueness across 100 calls |

### Phase 4: Verify everything works

| # | Gate | Command |
|---|---|---|
| D018 | Build succeeds | `npm run build` → `dist/` folder created with `manifest.json` inside |
| D019 | All tests pass | `npx vitest run` → green. Coverage ≥ 80% for `src/shared/` |

---

## CRITICAL RULES

1. **Read before writing.** Before creating any file, read the relevant AGENTS.md:
   - `AGENTS.md` (root — Tier 1, overall project rules)
   - `src/shared/AGENTS.md` (shared module scope + constraints)
   - `src/background/AGENTS.md` (background module scope)
   - `src/content/AGENTS.md` (content module scope)
   - `src/popup/AGENTS.md` (popup module scope)

2. **Do NOT modify config files.** `package.json`, `tsconfig.json`, `vite.config.ts`, `manifest.json`, `tailwind.config.ts` are already created and design-reviewed. If you think something is wrong, FLAG it — don't change it.

3. **Do NOT create files outside your scope.** You own `src/` entry points + `tests/unit/` + `vitest.config.ts`. You do NOT own `tests/e2e/`, `tests/fixtures/`, `demos/`, `playwright.config.ts`, or `docs/`.

4. **Path aliases are mandatory.** Use `@shared/`, `@core/`, `@background/`, `@content/`, `@popup/` — never relative `../../` imports across modules.

5. **Shared module is a leaf.** `src/shared/` imports NOTHING from other modules. It has zero Chrome API dependencies, zero external dependencies.

6. **Chrome types.** Use `@types/chrome` for `chrome.runtime`, etc. These are dev dependencies, already installed.

7. **Session ID format:** `ats-YYYY-MM-DD-NNN` (e.g., `ats-2026-02-21-001`). The `ats-` prefix stands for "acceptance testing session."

8. **Popup HTML entry point is `popup.html`** (not `index.html`). This matches `manifest.json`'s `default_popup` field.

---

## ARCHITECTURE REFERENCE (read these docs if unsure)

| Doc | Path | What it covers |
|---|---|---|
| Architecture | `docs/01_ARCHITECTURE.md` | System diagram, module tree, data model, data flows, tech stack |
| Modules | `docs/03_MODULES.md` | Module registry, capabilities, "Do NOT re-implement" rules |
| Testing | `docs/04_TESTING.md` | Test types, patterns, coverage targets, TDD discipline |
| Setup | `docs/02_SETUP.md` | Commands, dev workflow |
| Your todo | `docs/sprints/sprint_00/todo/sprint_00_team_dev_scaffold_todo.md` | Full task list with acceptance criteria |

---

## DEFINITION OF DONE

All of these must be true before you report "done":

```
✅ npm run build — succeeds without errors
✅ dist/manifest.json exists
✅ Extension loads in Chrome (chrome://extensions → Load unpacked → dist/)
✅ Popup shows "SynaptixLabs Refine" branding when clicking extension icon
✅ Content script logs "[Refine] Content script loaded on: <URL>" on localhost pages
✅ Service worker responds to test messages
✅ npx vitest run — all unit tests pass
✅ npx tsc --noEmit — clean (no type errors)
✅ npx eslint src/ — clean
✅ Coverage ≥ 80% for src/shared/
✅ src/shared/index.ts barrel export works (other modules can import from @shared/)
```

---

## KNOWN RISKS (watch out for these)

1. **CRXJS + Vite 5 compatibility:** We use `@crxjs/vite-plugin@beta` (2.0.0-beta). If build fails with CRXJS errors, try pinning to `@crxjs/vite-plugin@2.0.0-beta.28` specifically.

2. **rrweb import:** rrweb is installed but do NOT import it in Sprint 00. It's Sprint 01 work. Just verify it's in `node_modules/`.

3. **Icons:** `manifest.json` references `icons/icon-*.png` that don't exist yet. Chrome shows a default puzzle-piece icon — that's fine for Sprint 00.

4. **Popup closes on blur:** Chrome closes the popup when you click outside it. All state must go through Background. Don't store anything in popup React state that can't be lost.

5. **Service worker idle timeout:** MV3 service workers shut down after ~30s. Don't set up long-running timers. The keep-alive pattern (chrome.alarms) is Sprint 01 work — just leave a `// TODO: keep-alive` comment.

---

## WHEN YOU'RE DONE

1. Update your todo file statuses: `docs/sprints/sprint_00/todo/sprint_00_team_dev_scaffold_todo.md`
2. Signal to QA team that `dist/` is ready (they're blocked on your D018)
3. Write your sprint report: `docs/sprints/sprint_00/reports/sprint_00_team_dev_scaffold_report.md`

---

**Questions? Ask before building. It's cheaper to clarify than to rebuild.**

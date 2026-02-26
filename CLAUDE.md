# SynaptixLabs Vigil — Claude Code Project Context

> **Stack:** Chrome Extension (Manifest V3) + React 18 + Tailwind + Vite + CRXJS + rrweb + Dexie.js
> **Template version:** SynaptixLabs Windsurf-Projects-Template
>
> Auto-loaded by Claude Code CLI. Keep current.

---

## 1. Project Identity

| Field | Value |
|---|---|
| **Name** | SynaptixLabs Vigil (Bug Discovery & Resolution Platform) |
| **Purpose** | Chrome Extension for manual acceptance test recording with Playwright export |
| **Repo path** | `C:\Synaptix-Labs\projects\vigil` |
| **Production URL** | N/A (local unpacked extension) |
| **Current sprint** | sprint_00 |
| **Dev port** | N/A (extension, not server) |

---

## 2. Key Commands

```bash
npm run dev          # Watch mode build
npm run build        # Production build → dist/
npx tsc --noEmit     # Type check
npx eslint .         # Lint

# Unit + Integration testing (DEV owns)
npx vitest           # Unit tests (watch)
npx vitest run       # Unit tests (single run)
npx vitest run --coverage  # With coverage

# E2E testing (QA owns)
npx playwright test  # E2E tests (headed, requires built dist/)
npx playwright test --ui  # E2E with debug UI

# Full suite
npm run test:all     # Unit + E2E combined
```

> Load `dist/` as unpacked extension: `chrome://extensions` → Developer mode → Load unpacked

---

## 3. Testing Rules (non-negotiable gates)

```
FEATURE IS "DONE" ONLY WHEN:
  ✅ Unit tests pass (vitest)
  ✅ TypeScript clean (tsc --noEmit)
  ✅ Build succeeds (npm run build)
  ✅ Extension loads in Chrome without errors
  ✅ Manual smoke test on target flow
  ✅ No regressions on full suite
  ✅ Avi sign-off
```

---

## 4. Project Structure

```
src/
├── background/    # Service worker (session lifecycle, messaging)
├── content/       # Content script (rrweb, control bar, bug editor)
├── popup/         # Extension popup (session list, management)
├── core/          # Business logic (storage, reports, codegen)
└── shared/        # Types, constants, message protocol
tests/
├── unit/          # Unit tests (Vitest) — DEV owns
├── integration/   # Integration tests (Vitest) — DEV owns
├── e2e/           # E2E tests (Playwright) — QA owns
│   └── fixtures/  # Extension test fixture
└── fixtures/
    └── target-app/  # QA regression target (port 3847)
demos/
└── refine-demo-app/ # Manual acceptance demo "TaskPilot" (port 3900)
dist/              # Build output
manifest.json      # Manifest V3
```

---

## 5. Architecture Non-Negotiables

- Chrome Manifest V3 — no V2 APIs
- Shadow DOM for all injected UI (control bar, bug editor)
- rrweb for recording — do NOT build custom DOM recording
- IndexedDB via Dexie.js — do NOT add server/API
- Vite + CRXJS — do NOT switch to Webpack/Plasmo
- No network requests — fully offline/client-side

---

## 6. Sprint Context

| Sprint | Status | Key deliverables |
|---|---|---|
| sprint_00 | 🟢 Active | Repo setup, scaffold, hello-world extension, Vitest + Playwright infra |

**Port map:** 3847 (QA target), 3900 (demo app), 5173 (Vite HMR)
**Kickoff:** `docs/sprints/sprint_00/sprint_00_kickoff.md`

---

## 7. Role Tags

| Tag | Who |
|---|---|
| `[FOUNDER]` | Avi — final decision maker |
| `[CTO]` | Architecture, tech debt, build pipeline |
| `[CPO]` | Product scope, acceptance criteria |
| `[DEV:<module>]` | Module implementation (background/content/popup/core/shared) |

> Reading order: nearest `AGENTS.md` → root `AGENTS.md` → `docs/00_INDEX.md`

---

## 8. Custom Commands

| Command | Purpose |
|---|---|
| `/project:test` | Run full test suite |
| `/project:plan` | Force plan mode before complex work |
| `/project:regression` | Pre-merge gate |
| `/project:release-gate` | Pre-prod checklist |
| `/project:sprint-report` | Current sprint status |

---

## 9. What NOT to Do

- Do NOT add server/API components — fully client-side
- Do NOT submit to Chrome Web Store — unpacked only
- Do NOT inject CSS into target app — Shadow DOM only
- Do NOT silently expand scope
- Do NOT add new infra dependencies without a FLAG
- Do NOT build custom DOM recording — use rrweb

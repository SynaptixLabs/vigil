# SynaptixLabs Refine — Acceptance Test Recorder

> Chrome Extension for manual acceptance test recording with Playwright export

---

## What is Refine?

Refine bridges the gap between manual exploratory testing and automated QA. It lets a product owner record acceptance testing sessions on any web app, capture bugs and feature requests inline, and export recordings as visual replays and Playwright regression test scripts.

**Key capabilities:**
- Record DOM interactions via rrweb across page navigations
- Capture screenshots and log bugs/features inline during testing
- Generate session reports (JSON + Markdown) for DEV teams
- Export Playwright `.spec.ts` regression test scripts for QA teams
- Visual replay via self-contained rrweb-player HTML files

## Stack

| Component | Technology |
|-----------|-----------|
| Extension standard | Chrome Manifest V3 |
| Build tool | Vite + CRXJS plugin |
| UI framework | React 18 + Tailwind CSS |
| DOM recording | rrweb |
| Client storage | IndexedDB via Dexie.js |
| Playwright export | Custom codegen transformer |
| Visual replay | rrweb-player |

## Quick Start

```bash
# Install dependencies
npm install

# Development build (watch mode)
npm run dev

# Production build
npm run build

# Load extension in Chrome:
# 1. Go to chrome://extensions
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" → select dist/ folder
```

## Project Structure

```
project-refiner/
├── .windsurf/rules/         # Windsurf agent roles + rules
├── .claude/                  # Claude Code CLI commands
├── docs/                     # Project documentation (source of truth)
│   ├── 0k_PRD.md            # Product requirements
│   ├── 01_ARCHITECTURE.md   # Technical architecture
│   ├── 03_MODULES.md        # Module registry
│   └── sprints/             # Sprint artifacts
├── src/
│   ├── background/          # Service worker (session lifecycle, messaging)
│   ├── content/             # Content script (rrweb, control bar, bug editor)
│   ├── popup/               # Extension popup (session list, management)
│   ├── core/                # Business logic (storage, reports, codegen)
│   └── shared/              # Shared types, constants, utilities
├── tests/
│   ├── unit/                # Unit tests (Vitest) — owned by DEV
│   ├── integration/         # Integration tests (Vitest) — owned by DEV
│   ├── e2e/                 # E2E tests (Playwright) — owned by QA
│   └── fixtures/target-app/ # QA regression target (port 3847)
├── demos/
│   └── refine-demo-app/     # Manual acceptance demo (port 3900)
├── dist/                    # Build output (load as unpacked extension)
├── manifest.json            # Chrome Manifest V3
├── vite.config.ts
├── package.json
├── tsconfig.json
└── tsconfig.node.json       # Node config for Vite/Vitest/Tailwind
```

## Distribution

**Unpacked extension only** — no Chrome Web Store submission. Share via repo `dist/` folder. Team members load via `chrome://extensions` → "Load unpacked".

## Documentation

Start here: [`docs/00_INDEX.md`](docs/00_INDEX.md)

## Agent Roles (Windsurf / Claude Code)

| Role | Invoke | Scope |
|------|--------|-------|
| CTO | `@role_cto` | Architecture, tech decisions |
| CPO | `@role_cpo` | Product scope, acceptance criteria |
| Extension Dev | `@role_extension_dev` | Module implementation |

## Sprint Status

| Sprint | Focus | Status |
|--------|-------|--------|
| Sprint 00 | Repo setup, scaffold, hello-world extension | 🟡 Active |
| Sprint 01 | P0 MVP: Recording + Screenshots + Bug Editor | Planned |
| Sprint 02 | P0 Complete: Reports + Sessions. P1: Replay | Planned |
| Sprint 03 | P1: Playwright Export + ZIP + Shortcuts | Planned |

---

*SynaptixLabs — 2026*

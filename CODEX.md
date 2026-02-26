# vigil — Project CODEX

> **Audience:** Dev team + AI agents (internal)
> **Level:** Project — Bug Discovery & Resolution Platform

---

## 1. Project Identity

| Field | Value |
|---|---|
| **Name** | SynaptixLabs Vigil |
| **Purpose** | Chrome Extension for manual acceptance test recording with Playwright export |
| **Repo path** | `C:\Synaptix-Labs\projects\vigil` |
| **Stack** | Chrome Ext (MV3) · React 18 · Vite · CRXJS · rrweb · Dexie.js |
| **Deploy** | Local unpacked extension (no server) |
| **Status** | 🟡 Sprint 00 — Paused |

---

## 2. Current State

| Sprint | Status | Goal |
|---|---|---|
| **Sprint 00** | 🟡 Active/Paused | Scaffold, hello-world ext, Vitest + Playwright infra |

**Port map:** 3847 (QA target), 3900 (demo app), 5173 (Vite HMR)

---

## 3. Commands

```bash
npm run dev          # Watch mode build
npm run build        # Production build → dist/
npx tsc --noEmit     # Type check
npx vitest run       # Unit tests
npx playwright test  # E2E (requires built dist/)
npm run test:all     # Unit + E2E
```

Load extension: `chrome://extensions` → Developer mode → Load unpacked → select `dist/`

---

## 4. Architecture Non-Negotiables

- Chrome Manifest V3 only — no V2 APIs
- Shadow DOM for all injected UI
- rrweb for recording — do NOT build custom DOM capture
- IndexedDB via Dexie.js — no server/API
- Fully offline/client-side — no network requests
- Vite + CRXJS — do NOT switch bundlers

---

## 5. Project Structure

```
src/
├── background/    # Service worker
├── content/       # Content script (rrweb, control bar)
├── popup/         # Extension popup
├── core/          # Business logic (storage, codegen)
└── shared/        # Types, constants, message protocol
tests/
├── unit/          # Vitest
├── integration/   # Vitest
└── e2e/           # Playwright
demos/
└── refine-demo-app/   # Manual acceptance demo (port 3900)
ARCHIVE/               # Deprecated code, old sprint artifacts
```

---

*Last updated: 2026-02-24 | Owner: [CTO] + [FOUNDER]*

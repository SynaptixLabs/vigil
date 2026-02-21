# SynaptixLabs Refine — Setup Guide

> **Development Environment Setup**
> Owner: CTO

---

## Prerequisites

| Tool | Version | Required |
|------|---------|----------|
| Node.js | >=20.x LTS | ✅ |
| npm | >=10.x | ✅ |
| Chrome | Latest | ✅ |
| Git | Latest | ✅ |

---

## Quick Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd project-refiner

# 2. Install dependencies
npm install

# 3. Build extension
npm run build

# 4. Load in Chrome
#    → chrome://extensions
#    → Enable "Developer mode" (top right)
#    → "Load unpacked" → select dist/ folder
#    → Refine icon appears in toolbar
```

---

## Development Workflow

```bash
# Watch mode — rebuilds on file changes
npm run dev

# After rebuild, reload extension in Chrome:
#    → chrome://extensions → Refine card → click refresh icon
#    → Or press Ctrl+Shift+R on chrome://extensions page
```

---

## Key Commands

```bash
npm run dev          # Watch mode build
npm run build        # Production build → dist/
npx tsc --noEmit     # Type check
npx eslint .         # Lint

# Unit + Integration tests (DEV owns)
npx vitest           # Unit tests (watch mode)
npx vitest run       # Unit tests (single run)
npx vitest run --coverage  # With coverage report

# E2E tests (QA owns — requires built dist/ + target app running)
npx playwright test  # E2E tests (headed Chromium)
npx playwright test --ui  # E2E with interactive debug UI

# Combined
npm run test:all     # Unit + E2E in sequence
```

---

## IDE Setup

### Windsurf / VS Code

Recommended extensions:
- ESLint
- Tailwind CSS IntelliSense
- TypeScript + JavaScript
- Chrome Extension Manifest (optional)

### Chrome DevTools

- **Popup**: Right-click Refine icon → "Inspect popup"
- **Service Worker**: `chrome://extensions` → Refine → "Inspect views: service worker"
- **Content Script**: Regular DevTools (F12) on target page → Console → select Refine context

---

## Troubleshooting

**Issue:** Extension not loading after build
```bash
# Verify dist/ folder exists and contains manifest.json
ls dist/
# Rebuild
npm run build
```

**Issue:** "Developer mode extensions" nag banner
```
# Dismiss with "X" — appears once per Chrome restart
# For team-wide: use Chrome Enterprise policy (optional)
```

**Issue:** Content script not injecting
```
# Check manifest.json content_scripts matches
# Check Chrome DevTools console for errors
# Verify page URL matches host_permissions
```

---

*Last updated: 2026-02-20*

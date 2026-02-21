# SynaptixLabs Refine — Deployment

> **Distribution & Release Process**
> Owner: CTO

---

## Distribution Model

**Unpacked Chrome Extension** — No Chrome Web Store.

Team members install by:
1. Pull latest from repo
2. `npm run build` (or use pre-built `dist/` from release)
3. `chrome://extensions` → Developer mode → Load unpacked → select `dist/`

---

## Release Flow

```
Feature Branch → dev → main (tagged)
       │          │        │
       │          │        └── Tag release (v0.1.0, v0.2.0, etc.)
       │          └── PR merge (tests must pass)
       └── PR required
```

---

## Pre-Release Checklist

- [ ] All unit tests passing (`npx vitest run`)
- [ ] TypeScript clean (`npx tsc --noEmit`)
- [ ] Build succeeds (`npm run build`)
- [ ] Extension loads in Chrome without errors
- [ ] Manual smoke test: create session, record, stop, view report
- [ ] `CHANGELOG.md` updated
- [ ] Version bumped in `manifest.json` + `package.json`

---

## Release Commands

```bash
# 1. Build production
npm run build

# 2. Verify dist/
ls dist/

# 3. Tag release
git tag -a v0.X.0 -m "Release v0.X.0: <summary>"
git push origin --tags

# 4. Share dist/ to team
# (Copy dist/ folder or point team to repo tag)
```

---

## Rollback

```bash
# Revert to previous version
git checkout v0.X.0
npm run build
# Re-load dist/ in Chrome
```

---

## Infrastructure

| Component | Details |
|-----------|---------|
| Build | Vite + CRXJS → `dist/` |
| Storage | Local IndexedDB (browser) |
| Network | None (fully offline) |
| Hosting | N/A (local extension) |

---

*Last updated: 2026-02-20*

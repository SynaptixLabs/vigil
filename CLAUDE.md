# SynaptixLabs — Workspace Bootstrap

> Thin agent bootstrap. Read CODEX.md first, then AGENTS.md.
> This file is auto-loaded by Claude Code CLI.

Read in order:
1. This file (done)
2. `CODEX.md` — workspace state, project registry, conventions
3. `AGENTS.md` — global agent constitution, role definitions, **module reuse mandate (§5)**
4. The target project's own module contracts + reuse docs (see project README)

**Default role:** `[CTO]`
**Operator:** Avi ([FOUNDER]) — final decision maker on all scope/priority/tradeoffs

## Active Projects Quick Reference
- `./Papyrus` — Next.js publishing platform (Sprint 10)
- `./nightingale` — Agents platform (Sprint 05)
- `./vigil` — Bug Discovery & Resolution Platform (Sprint 06 🟢 ACTIVE)
- `./BudoAI` — AI martial arts learning platform (Sprint 00 🟢 ACTIVE)
- `./_platform/synaptix-sdk` — Shared infrastructure library
- `./_platform/synaptix-scaffold` — Project template

## Shared Commands
| Command | Purpose |
|---|---|
| `/project:test` | Run tests |
| `/project:e2e` | Playwright E2E |
| `/project:plan` | Plan mode |
| `/project:sprint-report` | Sprint status |
| `/project:release-gate` | Pre-prod gate |


## Windows Development: Python Bytecache

**All Python projects on Windows MUST set `PYTHONDONTWRITEBYTECODE=1`.**
Add to your start script: `$env:PYTHONDONTWRITEBYTECODE = "1"`
Add to your `.env`: `PYTHONDONTWRITEBYTECODE=1`

Windows locks .pyc files while processes run. On restart, old .pyc can't be deleted,
so Python loads stale cached code. This variable prevents .pyc creation entirely.
Cost: ~0.5s slower startup. See AGENTS project D-10c2a-WIN-001 for the full incident.

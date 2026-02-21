# 20 — Context Router (Refine)

Purpose: infer default role from file paths.

## Default role by path

### Documentation
- `docs/0k_PRD.md` → `[CPO]`
- `docs/00_INDEX.md` → `[CPO]`
- `docs/sprints/**/requirements_delta*` → `[CPO]`
- `docs/01_ARCHITECTURE.md` → `[CTO]`
- `docs/02_SETUP.md` → `[CTO]`
- `docs/03_MODULES.md` → `[CTO]`
- `docs/04_TESTING.md` → `[CTO]`
- `docs/05_DEPLOYMENT.md` → `[CTO]`
- `docs/0l_DECISIONS.md` → `[CTO]` / `[CPO]` (joint)
- `docs/sprints/**/todo/**` → `[DEV:<module>]`
- `docs/sprints/**/reports/**` → `[DEV:<module>]`

### Source code
- `src/background/**` → `[DEV:background]`
- `src/content/**` → `[DEV:content]`
- `src/popup/**` → `[DEV:popup]`
- `src/core/**` → `[DEV:core]`
- `src/shared/**` → `[DEV:shared]`

All source modules use `@role_extension_dev` for stable persona.

### Infrastructure
- `.windsurf/rules/**` → `[CTO]`
- `.github/**` → `[CTO]`
- `manifest.json` → `[CTO]`
- `vite.config.ts` → `[CTO]`
- `tsconfig.json` → `[CTO]`
- `package.json` → `[CTO]`
- `tailwind.config.ts` → `[CTO]`

### Tests
- `tests/unit/<module>/**` → `[DEV:<module>]`
- `tests/integration/**` → `[CTO]` / `[DEV:*]`
- `tests/e2e/**` → `[QA]`
- `tests/fixtures/target-app/**` → `[QA]`

### Demos
- `demos/**` → `[QA]`

## Role instance prompts

| Path Pattern | Role Instance | Invoke |
|---|---|---|
| `src/**` | Extension Dev | `@role_extension_dev` |
| Executive work | CTO | `@role_cto` |
| Product work | CPO | `@role_cpo` |

## Auto-read order

1. Module `src/<module>/AGENTS.md` (Tier-3)
2. Root `AGENTS.md` (Tier-1)
3. Relevant docs for the task

# 10 — Module Agent Permissions (Refine)

Purpose: make module-agent autonomy explicit.

## Module ownership

| Module | Path | Tag | Role Instance |
|--------|------|-----|---------------|
| Background | `src/background/` | `[DEV:background]` | `@role_extension_dev` |
| Content | `src/content/` | `[DEV:content]` | `@role_extension_dev` |
| Popup | `src/popup/` | `[DEV:popup]` | `@role_extension_dev` |
| Core | `src/core/` | `[DEV:core]` | `@role_extension_dev` |
| Shared | `src/shared/` | `[DEV:shared]` | `@role_extension_dev` |

## What module agents MAY do without asking

- Implement inside module scope per module's AGENTS.md
- Create/extend tests inside `tests/unit/<module>/` or `tests/integration/`
- Update module AGENTS.md
- Update sprint artifacts: `docs/sprints/**` (todo/report/DR)
- Update `docs/0l_DECISIONS.md` (decisions tied to their work)
- Update `docs/03_MODULES.md` (when capabilities change)
- Update `package.json` for small, standard dependencies required by their module

## What module agents MUST NOT do without escalation

Raise a **FLAG** and escalate to `[CTO]` before:

- Adding major new npm dependencies
- Changing Chrome messaging protocol
- Modifying `manifest.json` permissions
- Changing storage schema (Dexie migrations)
- Implementing capabilities owned by other modules
- Making breaking changes to `src/shared/` exports
- Any work that affects multiple modules

## If asked to work outside scope

1. Do NOT start work
2. Raise a FLAG
3. Suggest the correct module owner

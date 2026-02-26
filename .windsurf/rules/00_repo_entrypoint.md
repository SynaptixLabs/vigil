# 00 — Repo Entrypoint (Vigil)

First file any agent reads. Thin bootstrap — points to canonical sources.

---

## If you don't know where to start

Read in this order:
1. `.windsurf/rules/00_synaptix_ops.md` — always-on operating rules
2. `AGENTS.md` — project agent constitution (Tier-2)
3. `CLAUDE.md` — commands, port map, architecture summary
4. `CODEX.md` — sprint status, module registry, key interfaces
5. `docs/00_INDEX.md` — documentation map → follow links for your task

---

## Available roles for this project

| Role | Windsurf rule | When to use |
|---|---|---|
| `[CPTO]` | `@role_cpto` | Strategic decisions, sprint planning, tie-breaking, GOOD/BAD/UGLY reviews |
| `[CTO]` | `@role_cto` | Architecture, contracts, build pipeline, tech debt |
| `[CPO]` | `@role_cpo` | PRD, acceptance criteria, product scope |
| `[DEV:ext]` | `@role_extension_dev` | Chrome extension implementation (src/) |
| `[DEV:server]` | `@role_server_dev` | vigil-server + dashboard (packages/) |
| `[DEV:dashboard]` | `@role_server_dev` | React dashboard (packages/dashboard/) |
| `[QA]` | `@role_qa` | E2E, regression suite, fixtures |

**Default role when not specified:** `[CTO]`

---

## Quick reference

| What | Where |
|---|---|
| Current sprint | Sprint 06 — `docs/sprints/sprint_06/sprint_06_index.md` |
| Dev kickoff | `docs/sprints/sprint_06/todo/sprint_06_kickoff_dev.md` |
| QA kickoff | `docs/sprints/sprint_06/todo/sprint_06_kickoff_qa.md` |
| All file paths | `.windsurf/rules/01_artifact_paths.md` |
| Module permissions | `.windsurf/rules/10_module_agent_permissions.md` |
| Context router | `.windsurf/rules/20_context_router.md` |
| Port map | `CLAUDE.md §4` |
| Commands | `CLAUDE.md §7` |

---

*Last updated: 2026-02-26 | Owner: [CTO]*

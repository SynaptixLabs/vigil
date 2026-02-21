# Common Artifact Paths (Refine Extension)

## Root-level

| Artifact | Path | Owner |
|----------|------|-------|
| Global agent constitution (Tier-1) | `AGENTS.md` | `[CTO]` |
| Project README | `README.md` | `[CTO]` |
| Claude CLI context | `CLAUDE.md` | `[CTO]` |
| Changelog | `CHANGELOG.md` | `[CTO]` |
| Package config | `package.json` | `[CTO]` |
| TypeScript config | `tsconfig.json` | `[CTO]` |
| TypeScript node config | `tsconfig.node.json` | `[CTO]` |
| Vite config | `vite.config.ts` | `[CTO]` |
| Manifest | `manifest.json` | `[CTO]` |
| Tailwind config | `tailwind.config.ts` | `[CTO]` |
| Git ignore | `.gitignore` | `[CTO]` |

## Windsurf rules

| Artifact | Path | Owner |
|----------|------|-------|
| Entry point | `.windsurf/rules/00_repo_entrypoint.md` | `[CTO]` |
| Synaptix ops | `.windsurf/rules/00_synaptix_ops.md` | `[CTO]` |
| Artifact paths | `.windsurf/rules/01_artifact_paths.md` | `[CTO]` |
| Templates policy | `.windsurf/rules/02_templates_policy.md` | `[CTO]` |
| Module permissions | `.windsurf/rules/10_module_agent_permissions.md` | `[CTO]` |
| Context router | `.windsurf/rules/20_context_router.md` | `[CTO]` |
| CTO role | `.windsurf/rules/role_cto.md` | `[CTO]` |
| CPO role | `.windsurf/rules/role_cpo.md` | `[CPO]` |
| Extension dev role | `.windsurf/rules/role_extension_dev.md` | `[CTO]` |

## AGENTS.md tiers

| Tier | Path | Scope |
|------|------|-------|
| Tier-1 | `AGENTS.md` | Entire repo |
| Tier-3 | `src/background/AGENTS.md` | Background module |
| Tier-3 | `src/content/AGENTS.md` | Content module |
| Tier-3 | `src/popup/AGENTS.md` | Popup module |
| Tier-3 | `src/core/AGENTS.md` | Core module |
| Tier-3 | `src/shared/AGENTS.md` | Shared module |

## Documentation

| Artifact | Path | Owner |
|----------|------|-------|
| Docs index | `docs/00_INDEX.md` | `[CPO]` |
| PRD | `docs/0k_PRD.md` | `[CPO]` |
| Architecture | `docs/01_ARCHITECTURE.md` | `[CTO]` |
| Setup | `docs/02_SETUP.md` | `[CTO]` |
| Modules | `docs/03_MODULES.md` | `[CTO]` |
| Testing | `docs/04_TESTING.md` | `[CTO]` |
| Deployment | `docs/05_DEPLOYMENT.md` | `[CTO]` |
| Decisions | `docs/0l_DECISIONS.md` | `[CTO]`/`[CPO]` |
| Discussion Summary | `docs/knowledge/00_DISCUSSION_SUMMARY.md` | Reference |

## Sprint system

| Artifact | Path | Owner |
|----------|------|-------|
| Sprint index | `docs/sprints/sprint_XX/sprint_XX_index.md` | `[CTO]`/`[CPO]` |
| Sprint decisions | `docs/sprints/sprint_XX/sprint_XX_decisions_log.md` | `[CTO]` |
| Module todos | `docs/sprints/sprint_XX/todo/sprint_XX_team_dev_<module>_todo.md` | `[DEV:*]` |
| Module reports | `docs/sprints/sprint_XX/reports/sprint_XX_team_dev_<module>_report.md` | `[DEV:*]` |
| Requirements delta | `docs/sprints/sprint_XX/reviews/sprint_XX_requirements_delta.md` | `[CPO]` |

## Source code

```
src/
├── background/          # Service worker
│   └── AGENTS.md
├── content/             # Content script (rrweb + overlay)
│   └── AGENTS.md
├── popup/               # Extension popup (React)
│   └── AGENTS.md
├── core/                # Business logic (storage, reports, codegen)
│   └── AGENTS.md
└── shared/              # Types, constants, messages
    └── AGENTS.md
tests/
├── unit/                # Unit tests (Vitest) — DEV owns
├── integration/         # Integration tests (Vitest) — DEV owns
├── e2e/                 # E2E tests (Playwright) — QA owns
│   └── fixtures/        # Extension test fixture
└── fixtures/
    └── target-app/      # QA regression target (port 3847) — QA owns
demos/
└── refine-demo-app/     # Manual acceptance demo (port 3900) — QA owns
dist/                    # Build output
```

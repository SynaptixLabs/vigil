# Vigil — Claude Code Operations Guide

> **Canonical source.** Edit here only.

Reference for all slash commands, skills, and workflows available in this project.

---

## Quick Reference

| Command | Role | When to Use |
|---------|------|-------------|
| `/project:cpto` | CPTO (PM/CTO) | Sprint planning, architecture decisions, specs, TODOs |
| `/project:cto` | CTO | Execution lead, runs agent teams, ships code |
| `/project:dev` | Developer | Generic dev agent, awaits track assignment |
| `/project:dev-ext` | Extension Dev | Chrome Extension track (src/) |
| `/project:dev-server` | Server Dev | vigil-server + MCP track (packages/server/) |
| `/project:dev-dashboard` | Dashboard Dev | React dashboard track (packages/dashboard/) |
| `/project:dev-devops` | DevOps | Builds, scripts, infra, CI/CD |
| `/project:dev-ux` | ARIA (UI/UX) | Landing page, design systems, components, animations |
| `/project:dev-qa` | QA Engineer | Test validation, coverage gaps |
| `/project:gbu` | Design Reviewer | Post-dev Good/Bad/Ugly review + fixes |
| `/project:test` | Test Runner | Run full test suite |
| `/project:e2e` | E2E Test Runner | Playwright browser tests |
| `/project:plan` | Architect | Force plan mode for complex tasks |
| `/project:regression` | Regression Gate | Pre-merge safety check |
| `/project:release-gate` | Release Gate | Pre-production GO/NO-GO |
| `/project:sprint-kickoff` | Sprint Launcher | Create a new sprint |
| `/project:sprint-plan` | Sprint Planner | Generate sprint plan artifacts |
| `/project:sprint-report` | Sprint Reporter | Sprint status report |
| `/project:bug-log` | Bug Logger | Log a new bug or feature |
| `/project:bug-fix` | Bug Fixer | Red-to-green resolution loop |
| `/project:bug-review` | Bug Reviewer | Sprint closure bug gate |
| `/project:design-review` | Review (alias) | Same as `/project:gbu` |

## Skills (Reusable Processes)

Skills contain checklists, templates, and runbooks. They are invoked by the operator — not automatically.

| Skill | Purpose | Files |
|-------|---------|-------|
| `implement-ext` | Extension dev workflow + checklist | SKILL.md + checklist |
| `implement-server` | Server dev workflow + checklist | SKILL.md + checklist |
| `implement-dashboard` | Dashboard dev workflow + checklist | SKILL.md + checklist |
| `design-review-gbu` | GBU review process + report template | SKILL.md + checklist + report-template |
| `qa-gate` | QA validation + PASS/FAIL report | SKILL.md + checklist + report-template |
| `release-readiness` | Pre-prod gate + GO/NO-GO | SKILL.md + checklist + report-template |
| `sprint-report-skill` | Sprint status report builder | SKILL.md + report-template |
| `sprint-team-launch` | Multi-agent team orchestration | SKILL.md (standalone) |
| `sync-state` | Multi-window state sharing | SKILL.md |

## Infrastructure

| File | Purpose |
|------|---------|
| `.claude/roles/aria_ux.md` | ARIA full operating manual (UI/UX creative agent) |
| `.claude/settings.json` | Plugins + compaction hook |
| `.claude/settings.local.json` | Bash permission allow-list |
| `.claude/launch.json` | Debug configs (ext dev, server, dashboard) |
| `.claude/hooks/reinject_context.py` | Re-injects session state after compaction |
| `.claude/state/session-state.template.md` | Shared state template for multi-window work |

---

## Workflows by Use Case

### 1. Implement an Extension Feature

```
/project:dev-ext
> "Implement the TODO at docs/sprints/sprint_XX/todo/track_ext.md"
```

The agent reads CLAUDE.md, checks module reuse, implements with Shadow DOM discipline, writes tests, and hands off to QA.

### 2. Implement a Server Feature

```
/project:dev-server
> "Implement the TODO at docs/sprints/sprint_XX/todo/track_server.md"
```

The agent reads CLAUDE.md, uses filesystem modules, implements routes/MCP tools, writes tests, verifies health check.

### 3. Implement a Dashboard Feature

```
/project:dev-dashboard
> "Implement the TODO at docs/sprints/sprint_XX/todo/track_dashboard.md"
```

The agent reads CLAUDE.md, reuses React components, implements UI, writes Playwright tests.

### 4. Review Completed Work

```
/project:gbu
> "Review the session capture changes"
```

Runs 7-phase review: gather context, requirements check, code quality, vigil-specific checks (Shadow DOM, MV3, boundaries), GBU assessment, fix bad items, scorecard, produce report.

### 5. Full Sprint Cycle

```
1. /project:sprint-kickoff      — create sprint plan + TODOs
2. /project:dev-ext              — implement extension features
3. /project:dev-server           — implement server features
4. /project:dev-dashboard        — implement dashboard features
5. /project:test                 — run tests
6. /project:gbu                  — review quality
7. /project:dev-qa               — QA sign-off
8. /project:release-gate         — GO/NO-GO decision
9. /project:sprint-report        — close sprint
```

### 6. Bug Fix Workflow

```
/project:bug-log
> "Shadow DOM styles leaking on Google Docs"

/project:bug-fix
> "Fix BUG-042"
```

Bug-log creates the bug file. Bug-fix runs the red-to-green loop with regression test.

### 7. Multi-Window Work

Open 3 Claude windows:
- **Window 1 (Lead):** `/project:cto` — coordination
- **Window 2 (Ext):** `/project:dev-ext` — extension work
- **Window 3 (Server):** `/project:dev-server` — server work

Each window should run `sync-state` to update `.claude/state/session-state.md` before switching context.

---

## Port Map

| Port | Service |
|------|---------|
| 7474 | vigil-server (MCP + REST + dashboard) |
| 3847 | QA target app |
| 3900 | Demo app (TaskPilot) |
| 5173 | Vite HMR (extension dev) |
| 8000 | AGENTS FastAPI (Sprint 07+) |

## Tips

- **Arguments matter.** `/project:gbu fix all bad items` gives different results than `/project:gbu just review, don't fix`.
- **Invoke skills explicitly for critical work.** Don't assume the agent will find the right skill.
- **Reading order is defined in each command file.** Most commands read CLAUDE.md first.
- **Reports go to sprint docs folder.** All DR, QA, and sprint reports save to `docs/sprints/sprint_XX/`.
- **Never commit secrets.** All API keys in env vars only.
- **Live state belongs in session-state.md, not in skill docs.** Skills hold stable procedures. Branch, SHA, and health status go in `.claude/state/session-state.md`.
- **Hard rules are non-negotiable.** Shadow DOM, MV3, rrweb, Dexie, server/ext boundary, no LLM in server.

# /project:sprint-kickoff — Create a New Sprint

## Pre-Read (MANDATORY)
1. `docs/03_MODULES.md` — ensure sprint reuses existing modules
2. Previous sprint index: `docs/sprints/sprint_XX/`
3. Decisions log: `docs/0l_DECISIONS.md`
4. `docs/0k_PRD.md` — product goals

## Steps
1. Propose to FOUNDER: goal, scope IN/OUT, teams, risks, critical path, "first demo"
2. FOUNDER confirms → create scaffold:
   ```
   docs/sprints/sprint_XX/
   ├── sprint_XX_index.md        (scope + deps + blocking order)
   ├── todo/
   │   ├── track_a_*.md          (3-checkbox format)
   │   └── ...
   ├── reviews/
   │   └── sprint_XX_pre_commit_GBU.md
   ├── reports/
   └── (decisions_log if needed)
   ```
3. Every track TODO uses the **3-checkbox lifecycle** (Dev / QA / GBU)
4. Run GBU on ALL TODOs before committing teams
5. Update `vigil.config.json` → `sprintCurrent`
6. Update `CODEX.md` + `CLAUDE.md` sprint fields
7. Write kickoff briefs:
   - `todo/sprint_XX_kickoff_dev.md` — per-track implementation guide
   - `todo/sprint_XX_kickoff_qa.md` — regression gate + new test specs

## TODO Format (3-Checkbox)

```markdown
### T1: Task name (~XV)

- [ ] Dev
- [ ] QA
- [ ] GBU

**What:** {description}
**Deliverable:** {exact file path — CODE, not a plan}
**Acceptance:**
- {criterion 1}
- {criterion 2}

**Failure notes:** _(QA fills if test fails)_
**GBU notes:** _(CPTO fills after review)_
```

## Track Structure (Vigil)

| Track | Role | Scope |
|-------|------|-------|
| A — Extension | `[DEV:ext]` | Session model, shortcuts, POST sync, content scripts |
| B — Server | `[DEV:server]` | vigil-server, MCP tools, filesystem, API routes |
| C — Dashboard | `[DEV:dashboard]` | React management GUI |
| D — Commands | `[DEV:*]` | Claude Code slash commands |

## Agent Teams TaskCreate

Every TaskCreate to a teammate MUST include:
- `"WRITE CODE IMMEDIATELY. Do NOT produce a plan document."`
- `"Commit after EVERY meaningful change"`
- `"Read CLAUDE.md and AGENTS.md first"`
- Copy task description VERBATIM from TODO — no paraphrasing

## Team Sizing
| Sprint | Vibes | Team |
|--------|-------|------|
| Small | ≤30V | Solo or lead + 1 |
| Medium | 30-60V | Lead + 2 |
| Large | 60V+ | Lead + 3 |

## Definition of Done (per sprint)
- [ ] All tracks' tasks have 3/3 checkboxes checked
- [ ] `npm run test:all` passes
- [ ] Module registry updated if capabilities changed
- [ ] Demo script verified
- [ ] Sprint report written + FOUNDER sign-off
- [ ] CODEX.md + CLAUDE.md updated

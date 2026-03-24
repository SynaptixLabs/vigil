# Track [X] — [Track Name]

**Sprint:** 09 | **Owner:** [DEV:ext | DEV:server | DEV:dashboard | QA] | **Priority:** [P0 | P1 | P2] | **Vibes:** ~XV
**Branch:** `sprint-09/[branch-name]`
**Team:** [Team Name]

---

## Instructions — READ BEFORE STARTING

### Every team member MUST follow this protocol:

**When you finish your work on a task, you MUST:**

1. **Check your checkbox** in the TODO table below
2. **Create a report** in `docs/sprints/sprint_09/reports/` using the naming convention for your role
3. A task is **DONE only when all 3 checkboxes are checked and all 3 reports exist**

### Per-Role Requirements

#### DEV — Implementation
- Write code, commit after every meaningful change
- When done: check `[x] Dev` and create a report:
  **`reports/DEV_{track}_{task_id}_{YYYY-MM-DD}.md`**
  Report must include: files changed, tests added, commands run + results, risks/blockers
- Commit message format: `[S09] {task_id}: {what changed}`

#### QA — Testing
- Test the implementation against acceptance criteria
- Run the regression gate (see bottom of this file)
- When done: check `[x] QA` and create a report:
  **`reports/QA_{track}_{task_id}_{YYYY-MM-DD}.md`**
  Report must include: AC check (PASS/FAIL per criterion), test commands run, failures found, verdict (PASS/FAIL)

#### GBU — Quality Review
- Run the Good/Bad/Ugly review on the completed work
- When done: check `[x] GBU` and create a report:
  **`reports/DR_{track}_{task_id}_{YYYY-MM-DD}.md`**
  Report must include: requirements compliance, GOOD/BAD/UGLY findings, scorecard, verdict (APPROVE/REVISE/REJECT)
  Use template from `.claude/skills/design-review-gbu/report-template.md`

### Checkpoint Rule

| All 3 checked? | All 3 reports exist? | Task status |
|:-:|:-:|:--|
| No | — | **In progress** — keep working |
| Yes | No | **Incomplete** — missing reports, go back and write them |
| Yes | Yes | **DONE** — task is complete |

---

## Mission

[1-2 sentence description of what this track delivers and why it matters]

---

## TODO

| ID | Task | AC | Vibes | Dev | QA | GBU |
|----|------|----|-------|-----|----|-----|
| X01 | [task title] | [acceptance criteria] | XV | [ ] | [ ] | [ ] |
| X02 | [task title] | [acceptance criteria] | XV | [ ] | [ ] | [ ] |
| X03 | [task title] | [acceptance criteria] | XV | [ ] | [ ] | [ ] |
| X04 | [task title] | [acceptance criteria] | XV | [ ] | [ ] | [ ] |

---

### X01 Details

**Task:** [full task description]
**Files:** [list of files to create/modify]
**AC:**
- [ ] [specific acceptance criterion 1]
- [ ] [specific acceptance criterion 2]
- [ ] [specific acceptance criterion 3]

### X02 Details

**Task:** [full task description]
**Files:** [list of files to create/modify]
**AC:**
- [ ] [specific acceptance criterion 1]
- [ ] [specific acceptance criterion 2]

### X03 Details

**Task:** [full task description]
**Files:** [list of files to create/modify]
**AC:**
- [ ] [specific acceptance criterion 1]
- [ ] [specific acceptance criterion 2]

### X04 Details

**Task:** [full task description]
**Files:** [list of files to create/modify]
**AC:**
- [ ] [specific acceptance criterion 1]
- [ ] [specific acceptance criterion 2]

---

## Dependency Map

```
X01 ──→ X02 ──→ X03
                 ──→ X04 (parallel after X02)
```

---

## Regression Gate

```bash
# Must all pass before track is complete
npx tsc --noEmit                    # Zero TS errors
npx vitest run                      # Unit + integration tests
npm run build                       # Extension builds clean
npm run build:server                # Server builds clean
npx playwright test                 # E2E tests (if applicable)
curl http://localhost:7474/health   # Server health check
```

---

## Commands

```bash
# [fill with track-specific development commands]
npm run dev            # Extension watch build
npm run dev:server     # Server with nodemon
npm run dev:dashboard  # Dashboard dev server
```

---

*Track [X] | Sprint 09 | Owner: [role] | [Team Name]*

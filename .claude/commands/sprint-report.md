# /project:sprint-report — Generate Sprint Status Report

Produce a concise sprint status report for the current project.

## Steps

1. **Read** the current sprint docs from `project_management/sprints/` or `docs/sprints/`
2. **Check** all module todo files for status
3. **Summarize** what's done, in-progress, and blocked

## Output Format

```
## Sprint [XX] Status Report — [PROJECT] — [DATE]

### ✅ Done (shipped + tested)
- [item 1]
- [item 2]

### 🔄 In Progress
- [item 1] — [owner/module] — ETA: [estimate]

### ❌ Blocked
- [item] — Blocked by: [reason] — Needs: [what to unblock]

### 🎯 Sprint Goal
[one sentence — will we hit it?]
YES / AT RISK / NO

### Quality Gates
Tests passing: YES/NO
Regressions: NONE / [list]
Demo-ready: YES / NO — [what's missing]

### Next Actions (top 3)
1. [action] — Owner: [role]
2. [action] — Owner: [role]
3. [action] — Owner: [role]
```

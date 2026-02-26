# /project:sprint-report — Vigil Sprint Status Report

Generate a concise, accurate sprint status report.

## Steps

1. Read `vigil.config.json` → `sprintCurrent`
2. Read `docs/sprints/sprint_XX/sprint_XX_index.md`
3. Read all todo files in `docs/sprints/sprint_XX/todo/`
4. Read any existing reports in `docs/sprints/sprint_XX/reports/`
5. Check actual code/file state vs planned deliverables
6. Run quick gate checks (don't run full suite — just check status)
7. Synthesize into the report below

## Output Format

```
## Sprint [XX] Status Report — Vigil — [DATE]
**Sprint goal:** [one-line goal from index]
**Budget:** [used V] / [total V]

---

### ✅ Done (shipped + tested)
- [S0X-NN] [description] — verified by: [test / manual / health check]

### 🔄 In Progress
- [S0X-NN] [description] — [% estimate] — Blocker: [if any]

### ❌ Blocked
- [S0X-NN] [description] — Blocked by: [reason] — Needs: [what]

### ⏭️ Deferred
- [S0X-NN] [description] — Reason: [why] — Moved to: sprint_XX+1

---

### 🎯 Sprint Goal
**On track?** YES / AT RISK / NO
**Reason:** [1 sentence]

---

### 🔬 Quality Gates
| Gate | Status |
|---|---|
| `npx vitest run` | ✅/❌ |
| `npx tsc --noEmit` | ✅/❌ |
| `npm run build` | ✅/❌ |
| `GET localhost:7474/health` | ✅/❌ / ⬜ not yet |
| MCP tools reachable | ✅/❌ / ⬜ not yet |
| Regression suite green | ✅/❌ / ⬜ not yet |
| Full E2E pass | ✅/❌ / ⬜ not yet |

---

### 🐛 Bug Tracker
| Severity | Open | Fixed | Deferred |
|---|---|---|---|
| P0 | N | N | N |
| P1 | N | N | N |
| P2 | N | N | N |

Sprint closure blocked? **YES / NO** (blocked if any P0/P1 open)

---

### Next Actions (top 3)
1. [action] — Owner: [role] — Priority: P0/P1/P2
2. [action] — Owner: [role] — Priority: P0/P1/P2
3. [action] — Owner: [role] — Priority: P0/P1/P2

---

### Open Decisions Needed
- [decision] — Owner: [FOUNDER/CTO/CPO] — Due: [sprint or date]
```

## After Report

- **Sprint complete + all gates green:** run `/project:release-gate` then request Avi sign-off
- **At risk:** surface blockers to Avi immediately via this report
- **P0/P1 bugs open:** run `/project:bug-review` to assess closure options

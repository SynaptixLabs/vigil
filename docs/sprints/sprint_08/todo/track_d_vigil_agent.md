# Track D — Vigil Agent (Autonomous Bug Resolution)

**Sprint:** 08 | **Owner:** DEV:ai | **Priority:** P1 | **Vibes:** ~7V
**Branch:** `sprint-08/agents-integration`
**Depends on:** Track B (B01 for live LLM) — D01 can start Day 1

---

## Mission

Build the `vigil_agent` autonomous resolution loop: scaffold → analyze bug → generate regression test → confirm red → implement fix → confirm green → commit to branch. Sequential pipeline with safety gates at every step.

---

## TODO

| ID | Task | AC | Vibes | Status |
|----|------|----|-------|--------|
| D01 | `vigil_agent` scaffold: command + config (dry-run) | `.claude/commands/` or standalone script. Config: `dryRun: true`, `maxIterations: 5`, `targetBranch: vigil/fixes/sprint-XX`. **Runs but makes no changes in dry-run mode.** | 1V | [ ] Dev [ ] QA [ ] GBU |
| D02 | Bug analysis + classification | Agent reads bug file → calls AGENTS for analysis → outputs: root cause hypothesis, affected files, fix strategy. **Structured JSON output.** | 1.5V | [ ] Dev [ ] QA [ ] GBU |
| D03 | Regression test generation + red confirmation | Agent generates test from bug report → runs test → confirms FAIL (red). **If test passes → flag as "already fixed" and stop.** | 1.5V | [ ] Dev [ ] QA [ ] GBU |
| D04 | Fix implementation + green confirmation + branch commit | Agent implements fix → runs test → confirms PASS (green) → runs full regression → commits to `vigil/fixes/sprint-XX` branch. **Never commits to main (D013).** | 2V | [ ] Dev [ ] QA [ ] GBU |
| D05 | Sprint health report (LLM-generated) | Agent reads all sprint bugs → generates summary report: open/fixed counts, severity distribution, risk assessment. **Stretch goal.** | 1V | [ ] Dev [ ] QA [ ] GBU |

### D01 Details
- Scaffold as Claude Code command or Node.js script
- Config in `vigil.config.json` under `agent` key:
  ```json
  {
    "agent": {
      "dryRun": true,
      "maxIterations": 5,
      "targetBranch": "vigil/fixes/sprint-08",
      "safetyGates": ["analyze", "test-gen", "red-confirm", "fix", "green-confirm"]
    }
  }
  ```
- In dry-run: logs every step but makes no file changes

### D02 Details — Sequential gate: analyze → test-gen
- Input: path to `BUG-XXX.md` file
- Calls AGENTS with bug context + codebase context
- Output: `{ rootCause, affectedFiles, fixStrategy, confidence }`
- Gate: if confidence < 0.5 → pause and request human review

### D03 Details — Sequential gate: test-gen → red-confirm
- Generates `tests/e2e/regression/BUG-XXX.spec.ts`
- Runs: `npx playwright test tests/e2e/regression/BUG-XXX.spec.ts`
- Expected: FAIL (red)
- If PASS: bug is already fixed → update bug status, stop pipeline
- Gate: test must fail for pipeline to continue

### D04 Details — Sequential gate: fix → green-confirm
- Implements fix based on D02 analysis
- Runs: regression test → must PASS (green)
- Runs: full suite → no regressions
- Commits: `git checkout -b vigil/fixes/sprint-08 && git commit -m '[vigil_agent] BUG-XXX: {description}'`
- **Never pushes to main** (D013)
- Gate: full regression must pass before commit

### D05 Details
- Stretch goal (P2)
- Reads all `BUG-XXX.md` files for current sprint
- Generates markdown report: counts, severity chart, risk heatmap, recommendations
- Output: `docs/sprints/sprint_08/reports/agent_health_report.md`

## Dependency Map

```
D01 (scaffold) ── no deps, Day 1
Track B (B01) ──→ D02 (analysis) ──→ D03 (test gen) ──→ D04 (fix + commit)
D05 (health report) ── after B01, independent of D02-D04
```

## Safety Gates (D013 — Non-Negotiable)

| Gate | Trigger | Behavior |
|------|---------|----------|
| `dryRun` | Config flag | Logs all actions, makes no changes |
| `maxIterations` | Pipeline loop count | Hard stop after N iterations |
| `branch-only` | Commit target | Never commits to main — only `vigil/fixes/*` |
| `red-confirm` | Test generation | Pipeline stops if test passes (bug already fixed) |
| `green-confirm` | Fix implementation | Pipeline stops if test still fails after fix |
| `regression-gate` | Full suite | Pipeline stops if any existing test breaks |

## Regression Gate

```bash
npx vitest run                     # Unit tests pass
npx tsc --noEmit                   # TypeScript clean
npx playwright test tests/e2e/regression/  # All regression tests green
```

## Commands

```bash
# Run agent in dry-run mode
node scripts/vigil-agent.js --bug BUG-042 --dry-run

# Run agent for real (after safety review)
node scripts/vigil-agent.js --bug BUG-042
```

---

*Track D | Sprint 08 | Owner: [DEV:ai] | D01 Day 1, D02-D04 blocked by Track B*

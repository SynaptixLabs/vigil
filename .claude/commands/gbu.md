# /project:gbu — Post-Development GBU Review & Fix

> Run at END of a dev session to verify work meets requirements, fix issues, produce DR report.
>
> **G (Good):** What works well. Evidence-based.
> **B (Bad):** Must fix before merge. Each gets a concrete fix.
> **U (Ugly):** Structural issues that hurt later. Fix or carry-forward with sprint target.

---

## The Two Non-Negotiable Phases

No matter what, ALWAYS do:
- **Phase 2 (Requirements Compliance):** Check EVERY requirement → PASS/FAIL with evidence.
- **Phase 5 (Fix Bad & Ugly):** Actually IMPLEMENT fixes — don't just list problems.

## Sizing Guide

| Task Size | What to Run | Effort |
|-----------|------------|--------|
| Small (<3V) | Phase 1 + 2 + 4 + 5 + 7 | ~15 min |
| Medium (3-10V) | All 7 phases | ~30 min |
| Large (>10V) | All 7 + extra depth on Phase 3 | ~45 min |

---

## PHASE 1: Gather Context

1. Read the task spec from `docs/sprints/sprint_XX/todo/`
2. Read the diff: `git log --oneline -5` then `git diff HEAD~N --stat`
3. Read changed files (full source)
4. Run tests:
   ```bash
   npx vitest run
   npx tsc --noEmit
   npm run build
   ```
5. Verify generated artifacts — open ACTUAL output, not just code that generates it


## PHASE 2: Requirements Compliance Check

| # | Requirement | Met? | Evidence |
|---|------------|------|----------|
| R1 | [exact text from spec] | PASS/FAIL/PARTIAL | [file:line or test] |

Rules: Copy requirements VERBATIM. PASS = implemented AND tested. Evidence = specific file + line.

## PHASE 3: Code Quality

### 3a. Vigil Non-Negotiables Check

| Check | Result | Evidence |
|-------|--------|----------|
| Chrome Manifest V3 only (no V2 APIs) | PASS/FAIL | |
| Shadow DOM for all injected extension UI | PASS/FAIL | |
| rrweb for recording (no custom DOM capture) | PASS/FAIL | |
| Dexie.js for extension-side IndexedDB | PASS/FAIL | |
| vigil-server for filesystem writes | PASS/FAIL | |
| AGENTS platform for LLM (server never owns LLM) | PASS/FAIL | |
| No secrets in vigil.config.json or source | PASS/FAIL | |
| Port 7474 for vigil-server | PASS/FAIL | |

### 3b. Production Readiness

| Check | Result |
|-------|--------|
| No `console.log` in production code (use structured logging) | |
| No hardcoded URLs (use vigil.config.json or env vars) | |
| No bare `catch {}` (handle or log errors) | |
| TypeScript strict (no `any`, no suppressed errors) | |
| No TODO/FIXME without sprint target | |
| No secrets in code | |

## PHASE 4: GBU Assessment

### GOOD
| # | What | Evidence |
|---|------|----------|
| G1 | ... | [file:line] |

### BAD — Must fix
| # | What | Impact | Fix | Effort |
|---|------|--------|-----|--------|
| B1 | ... | ... | [code change] | Xmin |

### UGLY — Will hurt later
| # | What | Fix | Sprint Target |
|---|------|-----|---------------|
| U1 | ... | [fix or carry-forward] | SXX/SXX+1 |


## PHASE 5: Fix the Bad and Ugly (MANDATORY)

Do NOT just report — FIX THEM.

For each BAD: implement fix, run tests, commit: `git commit -m '[DR-fix] B{N}: {description}'`
For each UGLY <3V: implement fix, commit: `git commit -m '[DR-fix] U{N}: {description}'`
For UGLY >3V: document carry-forward with sprint target.

## PHASE 6: Quality Scorecard

| Dimension | Score (1-5) | Notes |
|-----------|-------------|-------|
| Requirements Coverage | | All spec requirements met? |
| Test Coverage | | New code has tests? |
| Regression Safety | | All existing tests pass? |
| Documentation | | Docs updated? |
| Architecture Safety | | Any non-negotiable violated? |
| Production Readiness | | No debug code, proper errors? |

## PHASE 7: Write DR Report (MANDATORY)

**This phase is NON-NEGOTIABLE. Every GBU review MUST produce a report file.**

1. Determine the current sprint from `CLAUDE.md` or `CODEX.md`
2. Create the reports folder if it doesn't exist: `docs/sprints/sprint_XX/reports/`
3. Save report to: `docs/sprints/sprint_XX/reports/DR_{topic}_{YYYY-MM-DD}.md`
4. Use the template from `.claude/skills/design-review-gbu/report-template.md`

The report MUST include:
- **Verdict** (APPROVE / APPROVE WITH CONDITIONS / REVISE / REJECT) at the top
- **Scope** — what was reviewed (files, diff, TODO reference)
- **Date**
- **Requirements compliance table** (from Phase 2)
- **Quality checks table** (from Phase 3)
- **GOOD / BAD / UGLY tables** (from Phase 4)
- **Fixes applied** — list of commits from Phase 5
- **Scorecard** (from Phase 6)
- **Recommended next actions**

After writing the report, confirm the file path to the user.

## Verdict Criteria

| Verdict | When |
|---------|------|
| APPROVE | All requirements met. 0 BAD remaining. Score >= 8/10. |
| APPROVE WITH CONDITIONS | Most met. BAD items minor. Score >= 7/10. |
| REVISE | Partially met. Significant BAD items. Score 5-7. |
| REJECT | Not met. Structural problems. Score < 5. Rework. |

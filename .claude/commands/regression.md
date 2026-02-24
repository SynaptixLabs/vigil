# /project:regression — Full Regression Gate

Run this before any merge or "done" declaration.

## Steps

1. **Pull latest** — confirm you're on the right branch
2. **Run full test suite** (same as /project:test)
3. **Check for regressions** — compare against last known passing state
4. **Run E2E smoke** on critical paths (same as /project:e2e for core flows only)
5. **Static checks:**
   - No TypeScript errors (`npm run typecheck` or `tsc --noEmit`)
   - No Python type errors (`mypy` if configured)
   - No linting errors (`npm run lint` / `ruff` / `flake8`)
6. **Security scan:**
   - No hardcoded secrets (`git grep -i "api_key\|secret\|password" -- '*.ts' '*.py' '*.js'`)
   - No `.env` files staged for commit

## Regression Gate Checklist

```
[ ] All unit tests pass
[ ] All integration tests pass
[ ] E2E smoke on critical paths pass
[ ] No TypeScript/Python type errors
[ ] No lint errors
[ ] No hardcoded secrets
[ ] No .env files in git staging
[ ] Docs updated (CLAUDE.md, module docs) if architecture changed
[ ] Avi sign-off received
```

## Output

State PASS or FAIL explicitly. 
On FAIL: list every failing item with file + line.
On PASS: print the full checklist with ✅ marks.

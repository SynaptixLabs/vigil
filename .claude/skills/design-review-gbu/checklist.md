# GBU design review checklist

## Gather context
- Read the spec / TODO verbatim
- Read changed files and recent diff
- Read module registry (docs/03_MODULES.md)
- Run/inspect relevant tests and generated artifacts

## Compliance
- Every requirement mapped to PASS / FAIL / PARTIAL with evidence
- Module reuse verified (no duplicate utilities or reinvented patterns)
- Production-readiness hygiene checked
- Regressions checked against prior behavior when applicable

## Vigil-specific checks
- Shadow DOM used for ALL injected UI (zero CSS leakage)
- MV3 compliance — no V2 APIs
- rrweb for recording — no custom DOM capture
- Dexie.js for IndexedDB — no raw IDB
- Server/extension boundary respected (no fs in ext, no LLM in server)
- MCP tools correctly defined and tested
- vigil.config.json used for configuration — no hardcoded paths

## Findings
- GOOD: keep
- BAD: must fix before acceptance
- UGLY: structural debt / scaling risk / carry-forward

## Output
- Scorecard
- Explicit verdict
- File/path evidence
- Concrete next actions

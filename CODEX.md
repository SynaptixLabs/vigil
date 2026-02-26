# SynaptixLabs — Workspace CODEX

> **Audience:** Dev team + AI agents (internal only)
> **Level:** Workspace root — describes all projects
> **Tool-agnostic:** Read by Claude Code, Windsurf, Gemini CLI, or any future tool

---

## 0. Workspace Identity

| Field | Value |
|---|---|
| **Workspace path** | `C:\Synaptix-Labs\projects\` |
| **GitHub repo** | `avirabino/synaptix-workspace` |
| **Operator** | Avi — Founder, CTO/CPO of SynaptixLabs |
| **Mode** | Startup execution — fast cycles, scope cuts normal |
| **Primary stack** | Node.js, Python (FastAPI), React/Next.js, PostgreSQL (Neon), Qdrant, Railway |

---

## 1. Project Registry

### 🟢 Active Products (SynaptixLabs IP)

| Project | Path | Status | Stack | Sprint |
|---|---|---|---|---|
| **Papyrus** | `./Papyrus` | 🟢 Active | Next.js 14 / TypeScript / Prisma | Sprint 10 Planning |
| **Showroom** | `./Showroom` | 🟢 Active | Node.js / TypeScript / Playwright | Sprint 01 — MVP |
| **Vigil** | `./vigil` | 🟢 Active | Chrome Ext (MV3) / Node.js / React / MCP | Sprint 06 — Core Platform |

### 🟢 Client Workspaces

| Workspace | Path | Status | Notes |
|---|---|---|---|
| **happyseniors** | `./happyseniors` | 🟢 Active | Client project — hosts sub-projects |
| **nightingale** | `./nightingale` | 🟢 Active | SynaptixLabs Agents platform |

### 🔧 Platform & Shared Infrastructure (`_platform/`)

| Project | Path | Status | Purpose |
|---|---|---|---|
| **synaptix-sdk** | `./_platform/synaptix-sdk` | 🟡 Phase 1 | Shared Python/Node packages (was synaptix-infra) |
| **synaptix-scaffold** | `./_platform/synaptix-scaffold` | 📐 Stable | Project creation template (was Windsurf-Projects-Template) |
| **youtube-api** | `./_platform/youtube-api` | 🔵 Stable | Shared YouTube utility tool |

### 🌐 Website

| Project | Path | Status |
|---|---|---|
| **website** | `./website` | 🟡 Marketing site |

### 🗄 Archive

| Path | Notes |
|---|---|
| `./ARCHIVE/` | Inactive / completed projects |

---

## 2. Team & Roles

| Role tag | Who / What | Owns |
|---|---|---|
| `[FOUNDER]` | Avi (human) | Priorities, scope, final decisions |
| `[CTO]` | LLM agent | Architecture, contracts, tech debt, reliability |
| `[CPO]` | LLM agent | Product scope, acceptance criteria, user flows |
| `[DEV:<module>]` | LLM agent | Module-level implementation |
| `[QA]` | LLM agent | Test coverage, regression, gates |
| `[REVIEW]` | Any role | Cross-role review (state which role reviewing as) |

**Default role when unsure:** `[CTO]`

---

## 3. Core Operating Principles

1. **Ship demoable increments** — "good enough to validate" > perfect
2. **Reuse first** — nightingale/AGENTS is the platform; don't re-invent it
3. **Test-backed always** — no feature is "done" without passing tests
4. **Reversibility** — flag one-way doors before crossing them
5. **Artifact-first** — if it affects the repo, produce a file, not just a chat reply
6. **No silent scope creep** — flag before expanding

---

## 4. Global Tech Conventions

### Module structure (all projects)
```
<module>/
├── src/           # Implementation
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
├── ARCHIVE/       # Deprecated code, old sprints
└── AGENTS.md      # Tier-3 constraints
```

### Key services
- **Database:** Neon PostgreSQL
- **Vector DB:** Qdrant Cloud
- **Deploy:** Railway (backend), Vercel (frontend)
- **CI:** GitHub Actions
- **Async:** all LLM/agent ops use asyncio

### Environment variables
Every project: `.env.local` based on `.env.example`. Never commit secrets.

### Windows dev notes
- Playwright E2E: Microsoft Edge (`msedge`)
- Python venv: `venv\Scripts\activate`
- PowerShell env vars: `$env:VAR="value"`
- Always use absolute paths in scripts

---

## 5. Agent Reading Order

For any project, agents read in this order:
1. Workspace `CLAUDE.md` (thin bootstrap)
2. Workspace `AGENTS.md` (global constitution)
3. Project `CLAUDE.md` (thin bootstrap)
4. **Project `CODEX.md`** ← you are here (project level)
5. Project `AGENTS.md`
6. `docs/00_INDEX.md`
7. `docs/0k_PRD.md`
8. `docs/01_ARCHITECTURE.md`
9. `docs/03_MODULES.md`
10. Current sprint index

---

## 6. Global Quality Gates

```
NEVER mark anything DONE unless:
  ✅ Tests pass (unit + integration minimum)
  ✅ No regressions in existing tests
  ✅ CODEX.md / docs updated if architecture changed
  ✅ No hardcoded secrets
  ✅ Module boundaries respected
  ✅ Avi ([FOUNDER]) acceptance
```

---

## 7. Shared Slash Commands

Available in all Claude Code sessions from workspace root:

| Command | Purpose |
|---|---|
| `/project:test` | Run full test suite |
| `/project:e2e` | Playwright E2E tests |
| `/project:regression` | Pre-merge gate |
| `/project:plan` | Force plan mode before >2 files |
| `/project:release-gate` | Pre-prod checklist |
| `/project:sprint-report` | Sprint status report |

---

## 8. What NOT to Do (workspace-wide)

- Do NOT fork/duplicate the nightingale/AGENTS platform — extend it
- Do NOT introduce new infra dependencies without a FLAG to `[FOUNDER]`
- Do NOT silently expand scope
- Do NOT commit secrets or API keys
- Do NOT push directly to `main` — always use sprint/feature branches
- Do NOT mark features done without server + test verification

---

*Last updated: 2026-02-24 | Maintained by: [CTO] + [FOUNDER]*

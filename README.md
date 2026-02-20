# Windsurf Projects Template (SynaptixLabs)

This repo is a **starter template** for bootstrapping (or upgrading) a SynaptixLabs-style Windsurf environment: **Rules + Roles + Agent tiers + Vibe Coding**.

Once you instantiate a real project repo, this README is meant to be replaced by the project's real `README.md`.

---

## ⚠️ Important: Sprint-0 First (Before Opening Windsurf)

This template provides a **structural starting point**, not a ready-to-run project. Different project types (SaaS, infra library, CLI tool, etc.) require different structures.

**Before opening your new repo in Windsurf:**

1. **Adapt folder structure** to your project type (see [Project Types](#project-types-and-structure-adaptation))
2. **Replace all placeholders** in `docs/` files (see [Placeholder Inventory](#placeholder-inventory))
3. **Customize role prompts** (`role_cto.md`, `role_cpo.md`) for your project context
4. **Define initial modules** in `docs/03_MODULES.md`
5. **Write project README** (replace this template README)

This "Sprint-0" work is **strategic** and best done outside the IDE with a planning agent (Claude, etc.). Windsurf context is expensive — don't burn it on structural decisions.

### Sprint-0 Deliverables Checklist

| # | Artifact | Status |
|---|----------|--------|
| 1 | Project `README.md` | ☐ |
| 2 | Folder structure adapted | ☐ |
| 3 | `docs/0k_PRD.md` filled | ☐ |
| 4 | `docs/01_ARCHITECTURE.md` filled | ☐ |
| 5 | `docs/03_MODULES.md` initial registry | ☐ |
| 6 | `AGENTS.md` (Tier-1) customized | ☐ |
| 7 | `.windsurf/rules/role_cto.md` customized | ☐ |
| 8 | `.windsurf/rules/role_cpo.md` customized | ☐ |
| 9 | `pyproject.toml` / `package.json` configured | ☐ |
| 10 | Sprint-01 plan drafted | ☐ |
| 11 | `CLAUDE.md` placeholders filled (Claude CLI context) | ☐ |
| 12 | `.claude/settings.local.json` reviewed (add project-specific permissions) | ☐ |
| 13 | `.claude/commands/` reviewed (all 6 commands work for this project) | ☐ |

---

## Project Types and Structure Adaptation

This template provides a **generic full-stack structure**. Adapt it to your project type:

### Type A: Full-Stack SaaS (default structure)
Keep as-is:
```
backend/          → API + business logic
frontend/         → Web UI
shared/           → Cross-cutting utilities
ml-ai-data/       → ML/AI modules (if needed)
```

### Type B: Infrastructure / Library Project
Transform to:
```
packages/
  core/           → Base package
  cli-core/       → CLI package (if applicable)
  other-pkg/      → Additional packages
docs/             → Keep
.windsurf/        → Keep
```
**Delete:** `backend/modules/`, `frontend/`, `ml-ai-data/`

### Type C: CLI Tool
Transform to:
```
src/
  cli/            → CLI implementation
  core/           → Core logic
tests/
docs/             → Keep
.windsurf/        → Keep
```
**Delete:** `backend/`, `frontend/`, `ml-ai-data/`

### Type D: Backend-Only API
Keep:
```
backend/          → API + modules
shared/           → Utilities
docs/             → Keep
.windsurf/        → Keep
```
**Delete:** `frontend/`, `ml-ai-data/`

---

## Placeholder Inventory

Find and replace these placeholders throughout `docs/`:

| Placeholder | Replace With | Files |
|-------------|--------------|-------|
| `{{PROJECT_NAME}}` | Your project name | All `docs/*.md`, `AGENTS.md` |
| `{{PROJECT_DESCRIPTION}}` | One-line description | `01_ARCHITECTURE.md`, `0k_PRD.md` |
| `{{VERSION}}` | Initial version (e.g., `0.1.0`) | `0k_PRD.md` |
| `{{DATE}}` | Current date | All decision/changelog files |
| `{{BACKEND_LANG}}` | e.g., `Python` | `01_ARCHITECTURE.md` |
| `{{BACKEND_FRAMEWORK}}` | e.g., `FastAPI` | `01_ARCHITECTURE.md` |
| `{{DATABASE}}` | e.g., `PostgreSQL` | `01_ARCHITECTURE.md` |
| `{{FRONTEND_FRAMEWORK}}` | e.g., `React`, `Vue` | `01_ARCHITECTURE.md` |
| `{{HOSTING}}` | e.g., `AWS`, `Vercel` | `01_ARCHITECTURE.md` |
| `{{ROLE}}` | Role name in personas | `0k_PRD.md` |
| `{{GOALS}}` | User goals | `0k_PRD.md` |
| `{{PAINS}}` | Pain points | `0k_PRD.md` |

**Quick find command (PowerShell):**
```powershell
Get-ChildItem -Recurse -Include *.md | Select-String "{{" | Select-Object Path, LineNumber, Line
```

**Quick find command (bash):**
```bash
grep -rn "{{" --include="*.md"
```

---

## What this template gives you

### 1) Vibe Coding Framework (`_global/`)
Global rules for **LLM-native development**:
- **Vibes** as the universal measure (1 Vibe = 1,000 tokens)
- Role identification (`[CTO]`, `[CPO]`, `[DEV:<module>]`, `[FOUNDER]`)
- GOOD/BAD/UGLY review protocol
- Quality gates (TDD, coverage targets)
- Sprint structure with Vibe budgets

### 2) Role "instances" you can invoke (Manual)
Concrete role prompts for **CTO**, **CPO**, and **Developer roles** that you invoke with `@role_cto` / `@role_cpo` / `@role_backend_dev` etc.

> These are *not* "the archetype of a CTO". They are the **operating prompt** for "the CTO agent in THIS repo".

**Available roles:**
| Role | File | Invoke | Description |
|------|------|--------|-------------|
| CTO | `role_cto.md` | `@role_cto` | Technical architecture, code review, pre-release verification |
| CPO | `role_cpo.md` | `@role_cpo` | Product requirements, UX decisions |
| Backend Dev | `role_backend_dev.md` | `@role_backend_dev` | FastAPI, Python, API development |
| Frontend Dev | `role_frontend_dev.md` | `@role_frontend_dev` | React, Next.js, TypeScript, Tailwind |
| ML Dev | `role_ml_dev.md` | `@role_ml_dev` | ML pipelines, model training, reproducibility |
| Shared Dev | `role_shared_dev.md` | `@role_shared_dev` | Cross-cutting utilities, frameworks |

### 3) Path-based routing (Glob)
Optional "editor glue" that reduces the "who am I?" problem by mapping **paths → default role**.

### 4) Tiered `AGENTS.md` (repo → domain → module)
Directory-scoped `AGENTS.md` are your **source of truth** for domain/module behavior and constraints:
- Root `AGENTS.md` (Tier-1)
- `backend/AGENTS.md`, `frontend/AGENTS.md` (Tier-2) — includes CLI auto-registration pattern
- Module-level `AGENTS.md` (Tier-3)

### 5) Reference Module (`backend/modules/_example/`)
A complete, copy-able module demonstrating:
- Standard structure (`src/`, `tests/`)
- CLI auto-registration pattern
- Service + model patterns
- Unit test examples

### 6) Documentation Templates (`docs/templates/`)
- `CHANGELOG_TEMPLATE.md` — Keep a Changelog format
- `SECURITY_TEMPLATE.md` — Security documentation
- `PRD_TEMPLATE.md` — Product requirements
- `DECISIONS_TEMPLATE.md` — ADR format
- `module_AGENTS_TEMPLATE.md` — **NEW:** Generator for Tier-3 module AGENTS.md files

### 7) Extraction Mode Gates (NEW)
Hard rules for **migration/porting tasks** to prevent agents from inventing code:
- Task 0: Confirm source path + file inventory + CTO checkpoint
- Task 1: Copy only allowlisted files (no modifications)
- Task 2: Only then adapt/modify as needed

See `00_synaptix_ops.md` → "Extraction vs Invention" section.

### 8) Repository Audit Script (NEW)
Validate template compliance with `scripts/audit_repo_structure.py`:
```bash
python scripts/audit_repo_structure.py
```
Checks:
- Root structure and Windsurf rules
- Python version gate (3.11-3.13)
- Extraction gates in docs
- Async subprocess guidance
- **Unassigned template variables** (`{{PROJECT_NAME}}` → FAIL, `{{VAR:default}}` → WARN)

### 9) Core Documentation (`docs/`)
- `00_INDEX.md` — Entry point with reading order
- `01_ARCHITECTURE.md` — System architecture
- `02_SETUP.md` — Development setup
- `03_MODULES.md` — **Capability registry** (check before building!)
- `04_TESTING.md` — Testing strategy
- `05_DEPLOYMENT.md` — Deployment guide
- `ui/UI_KIT.md` — Design tokens, accessibility, component states

---

## How to use this template

### A) New project

1. **Create repo from template**
   - Click "Use this template" → "Create new repository"
   - Or clone and re-initialize (see [Manual Clone](#manual-clone-alternative))

2. **Execute Sprint-0** (outside Windsurf)
   - Follow the [Sprint-0 Deliverables Checklist](#sprint-0-deliverables-checklist)
   - Use Claude or another planning agent for strategic decisions
   - Adapt structure, replace placeholders, customize roles

3. **Open in Windsurf**
   - Configure rule activations (see [Windsurf Configuration](#windsurf-configuration))

4. **Replace this README**
   - Write your project's real README

### B) Upgrade an existing repo

1. Copy relevant folders/files:
   - `.windsurf/` (rules)
   - Tiered `AGENTS.md` files
   - `docs/` scaffolding you need

2. Configure rule activations in Windsurf

3. Merge your existing project README/docs with the template structure

### Manual Clone Alternative

```bash
# Clone without template's git history
git clone --depth 1 https://github.com/SynaptixLabs/Windsurf-Projects-Template.git my-project
cd my-project
rm -rf .git
git init
git add .
git commit -m "Initial commit from Windsurf-Projects-Template"
```

---

## Claude Code CLI Support

This template is **dual-native**: it works with both Windsurf (IDE) and Claude Code CLI (terminal).

### What's included

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project context auto-loaded by Claude CLI on session start. Fill in `{{PLACEHOLDERS}}` during Sprint-0. |
| `.claude/settings.local.json` | Pre-configured tool permissions (allow/deny). Add project-specific commands during Sprint-0. |
| `.claude/commands/test.md` | `/project:test` — full test suite runner |
| `.claude/commands/e2e.md` | `/project:e2e` — Playwright MCP browser tests |
| `.claude/commands/plan.md` | `/project:plan` — force plan mode before complex work |
| `.claude/commands/regression.md` | `/project:regression` — pre-merge quality gate |
| `.claude/commands/release-gate.md` | `/project:release-gate` — pre-production checklist |
| `.claude/commands/sprint-report.md` | `/project:sprint-report` — sprint status report |

### Quick start (CLI)

```bash
# 1. Fill in CLAUDE.md placeholders
# 2. Open project in Claude CLI
cd your-project
claude

# 3. Use commands
/project:plan    # Before any complex task
/project:test    # Run test suite
/project:e2e     # Browser tests
```

### Windsurf vs Claude CLI — when to use what

| Task | Windsurf | Claude CLI |
|------|----------|------------|
| Complex multi-file edits | ✅ Best | ✅ Good |
| Multi-agent parallel work | ❌ | ✅ Git worktrees |
| Image drag-and-drop | ✅ | ❌ |
| Custom slash commands | ❌ | ✅ `.claude/commands/` |
| E2E testing via Playwright MCP | ❌ | ✅ |
| Headless / CI integration | ❌ | ✅ |

### Playwright MCP setup (CLI)

```bash
# Install globally (fast startup, no per-session download)
npm install -g @playwright/mcp

# Configure (user scope — applies to all projects)
claude mcp add playwright --scope user -- node "C:\...\npm\node_modules\@playwright\mcp\cli.js"

# Verify
claude mcp list
```

---

## Windsurf Configuration

### Rule Levels

| Level | Scope | Location |
|-------|-------|----------|
| **Global** | All workspaces | Windsurf settings (copy from `_global/`) |
| **Workspace** | This repo only | `.windsurf/rules/` |
| **System** | Org-managed | Admin-configured |

### Recommended Activation Mapping

#### ✅ Always On
- `00_synaptix_ops`
- `01_artifact_paths`
- `02_templates_policy`
- `10_module_agent_permissions` *(optional; otherwise Glob)*

#### 🎯 Glob (path-based)
- `10_module_agent_permissions` → `backend/**`, `frontend/**`, `ml-ai-data/**`, `shared/**`
- `20_context_router` → `docs/**`, `backend/**`, `frontend/**`, `ml-ai-data/**`, `shared/**`

#### 🧠 Manual (invoke with @mention)
- `role_cto` → invoke with `@role_cto`
- `role_cpo` → invoke with `@role_cpo`

### Quick Setup Checklist

- [ ] Open repo root as Windsurf workspace
- [ ] Copy `_global/windsurf_global_rules.md` to Windsurf global rules
- [ ] Set `00_synaptix_ops` → Always On
- [ ] Set `20_context_router` → Glob on docs + code paths
- [ ] Keep `role_cto` / `role_cpo` → Manual

---

## Creating a new module

```bash
# Copy the reference module
cp -r backend/modules/_example backend/modules/your_module

# Update files:
# 1. README.md - module purpose
# 2. AGENTS.md - Tier-3 rules
# 3. src/*.py - your implementation
# 4. tests/ - your tests

# Register in docs/03_MODULES.md
```

---

## Vibe Quick Reference

| Task Type | Typical Vibes |
|-----------|---------------|
| Simple fix | 1–3 V |
| Single function + tests | 3–8 V |
| Module feature | 8–25 V |
| Cross-module work | 25–50 V |
| Sprint (small) | 50–150 V |
| Sprint (medium) | 150–300 V |

**1 Vibe = 1,000 tokens** (input + output combined)

---

## Template Structure

```
Windsurf-Projects-Template/
├── _global/                    # Meta-rules (copy to Windsurf global)
│   └── windsurf_global_rules.md
├── .claude/                    # Claude Code CLI infrastructure
│   ├── settings.local.json     # Permissions (allow/deny tool calls)
│   └── commands/               # Custom slash commands
│       ├── test.md             # /project:test
│       ├── e2e.md              # /project:e2e
│       ├── plan.md             # /project:plan
│       ├── regression.md       # /project:regression
│       ├── release-gate.md     # /project:release-gate
│       └── sprint-report.md    # /project:sprint-report
├── .windsurf/rules/            # Workspace rules
│   ├── 00_synaptix_ops.md      # Core operations + extraction gates
│   ├── 01_artifact_paths.md    # File registry
│   ├── 10_module_agent_permissions.md
│   ├── 20_context_router.md    # Path-to-role mapping
│   ├── role_cto.md             # CTO role + pre-release checklist
│   ├── role_cpo.md             # CPO role
│   ├── role_backend_dev.md     # Backend dev role (NEW)
│   ├── role_frontend_dev.md    # Frontend dev role (NEW)
│   ├── role_ml_dev.md          # ML dev role (NEW)
│   └── role_shared_dev.md      # Shared dev role (NEW)
├── scripts/
│   └── audit_repo_structure.py # Repo audit script (NEW)
├── AGENTS.md                   # Tier-1 (project-wide)
├── CHANGELOG.md                # Version history (NEW)
├── docs/
│   ├── 00_INDEX.md             # Entry point
│   ├── 01_ARCHITECTURE.md      # System architecture
│   ├── 02_SETUP.md             # Dev setup + Python version gate
│   ├── 03_MODULES.md           # Capability registry
│   ├── 04_TESTING.md           # Testing + async subprocess patterns
│   ├── 05_DEPLOYMENT.md        # Deployment guide
│   ├── 0k_PRD.md               # Product requirements
│   ├── 0l_DECISIONS.md         # Decision log
│   ├── ui/UI_KIT.md            # Design system
│   └── templates/
│       ├── module_AGENTS_TEMPLATE.md  # Tier-3 generator (NEW)
│       └── sprints/            # Sprint templates
├── backend/
│   ├── AGENTS.md               # Tier-2 + CLI auto-registration
│   └── modules/_example/       # Reference implementation
├── frontend/
│   └── AGENTS.md               # Tier-2
├── shared/                     # Cross-cutting utilities
└── ml-ai-data/                 # ML/AI modules
```

---

## Claude Code CLI Support

This template is **dual-native**: works with both **Windsurf** and **Claude Code CLI**.

### What's included for Claude CLI

| File/Dir | Purpose |
|---|---|
| `CLAUDE.md` | Project context auto-loaded by Claude Code on session start |
| `.claude/settings.local.json` | Pre-configured permissions (npm, poetry, git, docker, pytest) |
| `.claude/commands/test.md` | `/project:test` — full test suite runner |
| `.claude/commands/e2e.md` | `/project:e2e` — Playwright MCP browser tests |
| `.claude/commands/plan.md` | `/project:plan` — force plan mode for complex tasks |
| `.claude/commands/regression.md` | `/project:regression` — pre-merge gate |
| `.claude/commands/release-gate.md` | `/project:release-gate` — pre-prod checklist |
| `.claude/commands/sprint-report.md` | `/project:sprint-report` — sprint status |

### Setup for a new project (Claude CLI)

1. **Copy `.claude/` directory** into your new project repo.
2. **Replace `CLAUDE.md`** — fill in all `{{PLACEHOLDERS}}` (same workflow as README).
3. **Start a CLI session**: `cd my-project && claude`
4. **Verify**: type `/project:test` in the session.

### Windsurf rules vs CLAUDE.md

| | Windsurf | Claude CLI |
|---|---|---|
| **Context loading** | `.windsurf/rules/` (auto-applied) | `CLAUDE.md` (auto-loaded) |
| **Role prompts** | `@role_cto`, `@role_cpo` | Role context embedded in `CLAUDE.md` |
| **Slash commands** | Cascade commands | `.claude/commands/*.md` |
| **Permissions** | Editor-level | `.claude/settings.local.json` |

**Both tools read `AGENTS.md`.** They are complementary, not competing.

### Sprint-0 additions (Claude CLI)

Add to Sprint-0 checklist:

| # | Artifact | Status |
|---|----------|--------|
| 11 | `CLAUDE.md` filled (all `{{PLACEHOLDERS}}` replaced) | ☐ |
| 12 | `.claude/settings.local.json` reviewed | ☐ |
| 13 | `/project:test` runs cleanly in CLI session | ☐ |

---

## Troubleshooting

### "I don't know what structure to use"
→ Start with the default (Type A: Full-Stack SaaS), remove what you don't need later.

### "Placeholders are confusing"
→ Use the find commands above. Fill in what you know, leave `{{TBD}}` for unknowns.

### "Role prompts don't fit my project"
→ Customize heavily. The prompts are **starting points**, not sacred text.

### "This template is overkill for my small project"
→ Delete what you don't need. Keep: `AGENTS.md`, `.windsurf/rules/`, `docs/03_MODULES.md`.

---

## Contributing to this template

If you find improvements while using this template:
1. Make the fix in your project
2. Backport to `Windsurf-Projects-Template` repo
3. Commit with message: `fix(template): <what you fixed>`

---

*Last updated: 2025-01-12* | See [CHANGELOG.md](CHANGELOG.md) for version history
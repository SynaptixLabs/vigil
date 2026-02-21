# SynaptixLabs Refine — Docs Index

This folder is the **source of truth** for how Refine is specified, built, tested, and shipped.

## Reading order

1. `00_INDEX.md` (this file)
2. `0k_PRD.md` (what we're building + why)
3. `01_ARCHITECTURE.md` (how it fits together)
4. `03_MODULES.md` (what each module owns)
5. `04_TESTING.md` (Definition of Done gates)
6. `05_DEPLOYMENT.md` (how we ship)
7. `0l_DECISIONS.md` (why we made key calls)

## Quick links

| Doc | What it's for | Owner |
|---|---|---|
| [PRD](0k_PRD.md) | Product requirements + acceptance criteria | `[CPO]` |
| [Architecture](01_ARCHITECTURE.md) | System design, Manifest V3, module layout | `[CTO]` |
| [Setup](02_SETUP.md) | Dev setup + build pipeline | `[CTO]` |
| [Modules](03_MODULES.md) | Module registry + ownership | `[CTO]` |
| [Testing](04_TESTING.md) | Testing policy + gates | `[CTO]` |
| [Deployment](05_DEPLOYMENT.md) | Extension distribution | `[CTO]` |
| [Decisions](0l_DECISIONS.md) | Decision log | `[CTO]` / `[CPO]` |

## Background

| Doc | Location |
|---|---|
| [Discussion Summary](knowledge/00_DISCUSSION_SUMMARY.md) | Full context: why this exists, options evaluated |

## Current sprint

- Sprint index: `sprints/sprint_00/sprint_00_index.md`

## Directory map

```
docs/
├── 00_INDEX.md            # This file
├── 0k_PRD.md              # Product requirements (FILLED)
├── 01_ARCHITECTURE.md     # Architecture (FILLED)
├── 02_SETUP.md            # Dev setup
├── 03_MODULES.md          # Module registry
├── 04_TESTING.md          # Testing strategy
├── 05_DEPLOYMENT.md       # Distribution
├── 0l_DECISIONS.md        # Decision log
├── knowledge/
│   └── 00_DISCUSSION_SUMMARY.md
├── sprints/
│   ├── README.md
│   └── sprint_00/
└── templates/
    └── sprints/           # Sprint artifact templates
```

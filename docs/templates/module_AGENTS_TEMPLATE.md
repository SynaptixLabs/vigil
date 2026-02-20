# {{MODULE_NAME}} — AGENTS.md (Tier-3)

> **Module-specific rules.**
> Inherits from: `{{PARENT_AGENTS_PATH}}` (Tier-2)

---

## Scope

**Module:** `{{MODULE_NAME}}`
**Domain:** `{{DOMAIN}}` (backend | frontend | ml-ai-data | shared)
**Purpose:** {{MODULE_PURPOSE}}

---

## Owner Tag

`[DEV:{{MODULE_NAME}}|{{DOMAIN_TAG}}]`

Where `{{DOMAIN_TAG}}` is one of: `BE`, `FE`, `ML`, `SHARED`

---

## Boundaries

This module:

- {{BOUNDARY_1:Owns specific functionality}}
- {{BOUNDARY_2:Has specific constraints}}
- {{BOUNDARY_3:Interacts with specific other modules}}

This module does NOT:

- {{NEGATIVE_1:Cross into other module territory}}
- {{NEGATIVE_2:Own certain decisions}}

---

## Dependencies

| Dependency | Usage | Notes |
|------------|-------|-------|
| `shared/config` | Settings | Required |
| `shared/logging` | Logging | Required |
| `shared/exceptions` | Base errors | Required |
| {{DEPENDENCY_1}} | {{USAGE}} | {{NOTES}} |

---

## Public API / Contracts

> List the public interfaces this module exposes to other modules.

| Export | Type | Description |
|--------|------|-------------|
| {{EXPORT_1}} | {{TYPE}} | {{DESC}} |
| {{EXPORT_2}} | {{TYPE}} | {{DESC}} |

---

## Testing

| Type | Location | Coverage Target |
|------|----------|-----------------|
| Unit | `tests/unit/` | ≥90% |
| Integration | `tests/integration/` | Key paths |
| Regression | `tests/regression/` | All bug fixes |

### Key test scenarios

- {{TEST_SCENARIO_1}}
- {{TEST_SCENARIO_2}}

---

## Extraction Mode (if applicable)

> Fill this section if this module was created by extracting from existing code.

| Field | Value |
|-------|-------|
| Source path | `{{SOURCE_PATH}}` |
| Extraction date | `{{DATE}}` |
| Inventory file | `{{INVENTORY_PATH}}` |
| DR checkpoint | `{{DR_PATH}}` |

---

## Vibe Costs (module-specific)

| Task | Vibes |
|------|-------|
| {{TASK_1}} | {{VIBES_1}} V |
| {{TASK_2}} | {{VIBES_2}} V |
| Bug fix + regression test | 2–4 V |

---

## Escalation Triggers

Escalate to `[CTO]` before:

- {{ESCALATION_1}}
- {{ESCALATION_2}}
- Adding new dependencies
- Changing public API contracts

---

## Module-Specific Rules

> Add any rules unique to this module that don't apply to the domain.

{{MODULE_SPECIFIC_RULES}}

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| {{DATE}} | Initial creation | {{AUTHOR}} |

---

*Last updated: {{DATE}}*

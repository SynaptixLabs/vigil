# SynaptixLabs Refine — Testing

Testing is part of the product. If it's not tested, it's not done.

---

## Testing Strategy

Refine is a Chrome Extension — testing requires a mix of standard unit tests and extension-specific E2E.

### Testing Pyramid

1. **Unit** — Business logic, transformers, utilities (Vitest)
2. **Integration** — Module interactions, storage layer (Vitest + Dexie mock)
3. **E2E** — Full extension flows (Playwright with extension loading)

---

## Coverage & Gates

| Module | Primary gate | Coverage target | Notes |
|---|---|---|---|
| Core | Unit + integration | ≥90% | Storage, codegen, report gen — pure logic |
| Shared | Unit | ≥90% | Types, utilities, constants |
| Background | Unit + integration | Meaningful | Service worker lifecycle, message routing |
| Content | Unit + E2E smoke | Meaningful | Shadow DOM + rrweb — E2E covers real behavior |
| Popup | Component tests + E2E | Meaningful | React components |

---

## Test Types

### Unit Tests (Vitest)

**Location:** `tests/unit/`
**Run:** `npx vitest run`
**Config:** `vitest.config.ts`

Focus areas:
- `core/storage` — Dexie operations with fake-indexeddb
- `core/codegen` — Playwright script generation from action logs
- `core/report` — Report generation (JSON + Markdown)
- `shared/` — Type guards, utilities, ID generation
- `content/action-tracker` — Event → action extraction logic

### Integration Tests (Vitest)

**Location:** `tests/integration/`
**Run:** `npx vitest run tests/integration/`

Focus areas:
- Storage layer (Dexie + fake-indexeddb end-to-end)
- Report generation from realistic session data
- Playwright codegen from realistic action sequences

### E2E Tests (Playwright)

**Location:** `tests/e2e/`
**Run:** `npx playwright test`
**Config:** `playwright.config.ts`

Refine uses Playwright for E2E extension testing via `chromium.launchPersistentContext()` with `--load-extension` args (supported since Playwright 1.37+). See ADR-008.

**Extension fixture pattern:**
```typescript
// tests/e2e/fixtures/extension.fixture.ts
import { test as base, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({}, use) => {
    const pathToExtension = path.join(__dirname, '../../../dist');
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent('serviceworker');
    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
});
export const expect = base.expect;
```

**Important notes:**
- Extensions require **headed mode** (`headless: false`) — this is a Chromium limitation
- CI needs `xvfb-run` (Linux) for headed Chromium
- Build extension (`npm run build`) before running E2E tests
- Extension ID may change between builds — fixture handles this dynamically

### Test Target App

**Location:** `tests/fixtures/target-app/`
**Run:** `npx serve tests/fixtures/target-app -l 3847`
**URL:** `http://localhost:3847`

A simple multi-page web app used as Refine's test subject. Contains forms, buttons, navigation, and `data-testid` attributes for selector testing.

---

## TDD Discipline

1. **Write tests first** (or simultaneously with implementation)
2. **Every bug fix gets a regression test** that would fail without the fix
3. **No "DONE" without green tests**
4. **E2E tests run against real extension** — no mocked Chrome APIs in E2E
5. **Tests are code** — reviewed, maintained, refactored same as production code

---

## Regression Policy

- Every bug fix MUST add a test that would fail before the fix
- Full suite runs before any merge (`/project:regression` command)
- No silent test deletions — removing a test requires CTO approval

---

## Test Commands

```bash
# All unit + integration tests
npx vitest run

# Watch mode (development)
npx vitest

# Single file
npx vitest run tests/unit/shared/utils.test.ts

# Coverage report
npx vitest run --coverage

# E2E tests (requires built extension + target app)
npx playwright test

# E2E with UI mode (debugging)
npx playwright test --ui

# E2E specific file
npx playwright test tests/e2e/extension-loads.spec.ts

# Full suite (unit + integration + E2E)
npm run test:all
```

---

## Definition of Done

```
FEATURE IS "DONE" ONLY WHEN:
  ✅ Unit tests pass (vitest)
  ✅ TypeScript compiles clean (tsc --noEmit)
  ✅ npm run build succeeds
  ✅ Extension loads in Chrome without console errors
  ✅ E2E smoke test passes (playwright)
  ✅ No regressions on full suite
  ✅ Avi sign-off
```

---

## Test Writing Patterns

### Unit test pattern (Vitest)
```typescript
import { describe, it, expect } from 'vitest';
import { generateSessionId } from '@shared/utils';

describe('generateSessionId', () => {
  it('produces format ats-YYYY-MM-DD-NNN', () => {
    const id = generateSessionId();
    expect(id).toMatch(/^ats-\d{4}-\d{2}-\d{2}-\d{3}$/);
  });

  it('generates unique IDs on consecutive calls', () => {
    const id1 = generateSessionId();
    const id2 = generateSessionId();
    expect(id1).not.toBe(id2);
  });
});
```

### E2E test pattern (Playwright)
```typescript
import { test, expect } from './fixtures/extension.fixture';

test('extension popup shows Refine branding', async ({ context, extensionId }) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(page.locator('text=Refine')).toBeVisible();
});

test('content script injects on target app', async ({ context }) => {
  const page = await context.newPage();
  const consoleMessages: string[] = [];
  page.on('console', msg => consoleMessages.push(msg.text()));
  await page.goto('http://localhost:3847');
  await page.waitForTimeout(1000);
  expect(consoleMessages.some(m => m.includes('Refine content script loaded'))).toBe(true);
});
```

---

*Last updated: 2026-02-20*

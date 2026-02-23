/**
 * Q501 — E2E: Bugs & Features MD Export
 *
 * Verifies: SessionDetail "Export Bugs & Features MD" downloads a Markdown file
 * containing the logged bug title, priority, and feature title.
 *
 * DEV CONTRACT:
 *   btn-export-bugs-features  — downloads bugs-features-<id>.md
 */

import { test, expect } from './fixtures/extension.fixture';
import { createSession, openTargetApp, stopAndOpenDetail, waitForDownload } from './helpers/session';

test('Bugs & Features MD export contains logged bug and feature', async ({ context, extensionId }) => {
  const { popupPage } = await createSession(context, extensionId, 'Q501 Bugs Features Export');

  const page = await openTargetApp(context, '/form.html');
  await expect(page.getByTestId('refine-control-bar')).toBeVisible({ timeout: 5000 });

  // Log a bug
  await page.getByTestId('btn-bug').click();
  await expect(page.getByTestId('refine-bug-editor')).toBeVisible({ timeout: 3000 });
  await page.getByTestId('bug-editor-title').fill('Q501 Bug: Submit button broken');
  await page.getByTestId('btn-save-bug').click();
  await expect(page.getByTestId('refine-bug-editor')).not.toBeVisible({ timeout: 3000 });

  // Log a feature via the type toggle
  await page.getByTestId('btn-bug').click();
  await expect(page.getByTestId('refine-bug-editor')).toBeVisible({ timeout: 3000 });
  // Switch to Feature tab
  await page.getByTestId('btn-type-feature').click();
  await page.getByTestId('bug-editor-title').fill('Q501 Feature: Add dark mode');
  await page.getByTestId('btn-save-bug').click();
  await expect(page.getByTestId('refine-bug-editor')).not.toBeVisible({ timeout: 3000 });

  const detail = await stopAndOpenDetail(page, popupPage, context, extensionId);

  // Download the Bugs & Features MD
  const download = await waitForDownload(detail, () =>
    detail.getByTestId('btn-export-bugs-features').click()
  );

  const filename = download.suggestedFilename();
  expect(filename).toMatch(/bugs-features.*\.md$/);

  const path = await download.path();
  expect(path).toBeTruthy();

  if (path) {
    const { readFileSync } = await import('fs');
    const content = readFileSync(path, 'utf-8');

    // Must contain the bug title
    expect(content).toContain('Q501 Bug: Submit button broken');

    // Must contain the feature title
    expect(content).toContain('Q501 Feature: Add dark mode');

    // Must have Bugs and Features sections
    expect(content).toContain('## Bugs');
    expect(content).toContain('## Features');

    // Must contain a priority column
    expect(content).toMatch(/P[0-3]/);
  }
});

test('Bugs & Features MD export with no bugs shows empty state', async ({ context, extensionId }) => {
  const { popupPage } = await createSession(context, extensionId, 'Q501 Empty Export');

  const page = await openTargetApp(context);
  await expect(page.getByTestId('refine-control-bar')).toBeVisible({ timeout: 5000 });

  const detail = await stopAndOpenDetail(page, popupPage, context, extensionId);

  const download = await waitForDownload(detail, () =>
    detail.getByTestId('btn-export-bugs-features').click()
  );

  const path = await download.path();
  if (path) {
    const { readFileSync } = await import('fs');
    const content = readFileSync(path, 'utf-8');

    expect(content).toContain('No bugs logged');
    expect(content).toContain('No features logged');
  }
});

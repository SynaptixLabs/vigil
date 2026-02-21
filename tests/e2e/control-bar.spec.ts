/**
 * Q102 — E2E: Control Bar Functionality
 *
 * Verifies: Pause/Resume toggle, state indicator changes, control bar survives
 * page navigation (SPA re-injection), Stop removes the control bar.
 *
 * Requires DEV to complete: D107 (recorder), D110 (content-script), D112/D113 (overlay),
 * D103 (session-manager pause/resume/stop).
 */

import { test, expect } from './fixtures/extension.fixture';
import { createSession, openTargetApp } from './helpers/session';

test('control bar pause/resume/stop works and survives page navigation', async ({ context, extensionId }) => {
  await createSession(context, extensionId, 'Q102 Session');
  const page = await openTargetApp(context);

  // 1. Control bar is visible
  const controlBar = page.getByTestId('refine-control-bar');
  await expect(controlBar).toBeVisible({ timeout: 5000 });

  // 2. Pause button is visible; Resume is not
  await expect(page.getByTestId('btn-pause')).toBeVisible();
  await expect(page.getByTestId('btn-resume')).not.toBeVisible();

  // 3. Click Pause → state changes to PAUSED
  await page.getByTestId('btn-pause').click();
  await expect(page.getByTestId('recording-indicator')).toContainText('PAUSED');
  await expect(page.getByTestId('btn-resume')).toBeVisible();
  await expect(page.getByTestId('btn-pause')).not.toBeVisible();

  // 4. Click Resume → state returns to RECORDING
  await page.getByTestId('btn-resume').click();
  await expect(page.getByTestId('recording-indicator')).toContainText('RECORDING');
  await expect(page.getByTestId('btn-pause')).toBeVisible();

  // 5. Navigate to About page — control bar must persist (re-injection)
  await page.getByTestId('nav-about').click();
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('refine-control-bar')).toBeVisible({ timeout: 5000 });

  // 6. Navigate to Form page — control bar still present
  await page.getByTestId('nav-form').click();
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('refine-control-bar')).toBeVisible({ timeout: 5000 });

  // 7. Click Stop — control bar disappears
  await page.getByTestId('btn-stop').click();
  await expect(page.getByTestId('refine-control-bar')).not.toBeVisible({ timeout: 3000 });
});

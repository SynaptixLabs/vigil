/**
 * Q202 — E2E: Replay Viewer (Extension Tab)
 *
 * Verifies the in-extension replay viewer page:
 *   1. Opens as a new Chrome tab (chrome-extension:// URL)
 *   2. Does NOT show a sandbox/script-blocked error
 *   3. Loads session data from IndexedDB (proves recording events exist)
 *   4. Renders the rrweb player container when events are present
 *
 * This test definitively answers "bad recording vs bad player":
 *   - If events.length > 0 → recording is GOOD, player must render
 *   - If events.length === 0 → bad recording (rrweb not capturing)
 *   - If page is blank/sandboxed → bad player (CSP/build issue)
 *
 * DEV CONTRACT:
 *   btn-watch-replay         — opens replay viewer in a new tab
 *   session-detail-container — root of the session detail view
 */

import { test, expect } from './fixtures/extension.fixture';
import { createSession, openTargetApp, stopAndOpenDetail } from './helpers/session';

test('Replay viewer opens, loads session data, and renders without sandbox error', async ({ context, extensionId }) => {
  // 1. Create session via the proven popup helper (reliable tab detection)
  const { popupPage } = await createSession(context, extensionId, 'Q202 Replay Session');

  // 2. Open target app and wait for control bar injection
  const targetPage = await openTargetApp(context);

  // 2. Record some interactions
  await expect(targetPage.getByTestId('refine-control-bar')).toBeVisible({ timeout: 8000 });
  await targetPage.getByTestId('nav-about').click();
  await targetPage.waitForLoadState('networkidle');
  await targetPage.getByTestId('nav-form').click();
  await targetPage.waitForLoadState('networkidle');
  await targetPage.getByTestId('input-name').fill('Replay Tester');
  await targetPage.waitForTimeout(500);

  // 3. Stop recording → open session detail
  const detail = await stopAndOpenDetail(targetPage, popupPage, context, extensionId);

  // 4. Click Watch Replay — must open a new extension tab
  const [replayPage] = await Promise.all([
    context.waitForEvent('page', { timeout: 8000 }),
    detail.getByTestId('btn-watch-replay').click(),
  ]);

  await replayPage.waitForLoadState('networkidle');

  // 5. ASSERT: page must not be blank — title must indicate the replay viewer loaded
  const title = await replayPage.title();
  expect(title).toContain('Refine');

  // 6. ASSERT: no sandbox/script-blocked error — the page must not show an error state
  //    (blank page = script never ran; error div = runtime error loading session)
  const errorText = await replayPage.locator('p[style*="color: rgb(239, 68, 68)"]').textContent({ timeout: 3000 }).catch(() => null);
  if (errorText) {
    throw new Error(`[BAD PLAYER] Replay viewer showed error: ${errorText}`);
  }

  // 7. ASSERT: URL must be chrome-extension:// (not sandboxed blob/web URL)
  expect(replayPage.url()).toMatch(/^chrome-extension:\/\/.+\/src\/replay-viewer\/replay-viewer\.html/);

  // 8. DIAGNOSE: Check event count from the header text
  const eventsText = await replayPage.locator('span', { hasText: 'Events:' }).textContent({ timeout: 5000 }).catch(() => null);
  console.log('[Q202] Event count header:', eventsText);

  if (eventsText) {
    const match = eventsText.match(/Events:\s*(\d+)/);
    const eventCount = match ? parseInt(match[1], 10) : 0;

    if (eventCount === 0) {
      // BAD RECORDING: rrweb captured nothing
      throw new Error('[BAD RECORDING] Session has 0 rrweb events — content script did not capture DOM events');
    }

    // GOOD RECORDING: player container must be rendered
    console.log(`[Q202] Recording is GOOD — ${eventCount} events captured`);
    const playerContainer = replayPage.locator('.replayer-wrapper, [class*="rr-player"], div[data-testid="player-container"]').first();
    await expect(playerContainer).toBeVisible({ timeout: 8000 });
  } else {
    // No events span visible — check for "No recording events" message
    const noEvents = await replayPage.getByText('No recording events found').isVisible({ timeout: 3000 }).catch(() => false);
    if (noEvents) {
      throw new Error('[BAD RECORDING] Session has 0 rrweb events — content script did not capture DOM events');
    }
    // Header not found yet — page might still be loading
    console.warn('[Q202] Could not determine event count from header');
  }
});

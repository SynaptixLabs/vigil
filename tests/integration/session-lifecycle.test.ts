/**
 * Integration test: full session pipeline.
 * create → bug → feature → screenshot stub → verify Dexie state.
 * Chrome API mocked via vi.stubGlobal.
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  db,
  createSession,
  getSession,
  updateSession,
  addBug,
  addFeature,
  addScreenshot,
  getBugsBySession,
  getFeaturesBySession,
  getScreenshotsBySession,
} from '@core/db';
import { SessionStatus, BugPriority, FeatureType } from '@shared/types';
import type { Session, Bug, Feature, Screenshot } from '@shared/types';
import { generateBugId, generateFeatureId, generateScreenshotId, generateSessionId } from '@shared/utils';

beforeEach(async () => {
  await db.sessions.clear();
  await db.bugs.clear();
  await db.features.clear();
  await db.screenshots.clear();
  await db.recordings.clear();
  await db.actions.clear();
  vi.clearAllMocks();
});

describe('Session lifecycle pipeline', () => {
  it('create → log bug → log feature → screenshot → stop — full round-trip', async () => {
    const sessionId = generateSessionId(new Date('2026-02-22'), 1);

    // 1. Create session
    const session: Session = {
      id: sessionId,
      name: 'Login flow test',
      description: 'Full regression pass on login',
      status: SessionStatus.RECORDING,
      startedAt: Date.now(),
      duration: 0,
      pages: ['http://localhost:38470'],
      actionCount: 0,
      bugCount: 0,
      featureCount: 0,
      screenshotCount: 0,
    };
    await createSession(session);

    const created = await getSession(sessionId);
    expect(created).toBeDefined();
    expect(created?.status).toBe(SessionStatus.RECORDING);
    expect(created?.name).toBe('Login flow test');

    // 2. Log a bug
    const bug: Bug = {
      id: generateBugId(),
      sessionId,
      type: 'bug',
      priority: BugPriority.P0,
      title: 'Submit button disabled when it should not be',
      description: 'Repro: fill all fields, button stays grey',
      url: 'http://localhost:38470/form',
      elementSelector: '[data-testid="btn-submit"]',
      timestamp: Date.now(),
    };
    await addBug(bug);
    await updateSession(sessionId, { bugCount: 1 });

    const bugs = await getBugsBySession(sessionId);
    expect(bugs).toHaveLength(1);
    expect(bugs[0].priority).toBe(BugPriority.P0);

    // 3. Log a feature
    const feature: Feature = {
      id: generateFeatureId(),
      sessionId,
      type: 'feature',
      featureType: FeatureType.UX_IMPROVEMENT,
      title: 'Add progress indicator to form',
      description: 'User should see which step they are on',
      url: 'http://localhost:38470/form',
      timestamp: Date.now(),
    };
    await addFeature(feature);
    await updateSession(sessionId, { featureCount: 1 });

    const features = await getFeaturesBySession(sessionId);
    expect(features).toHaveLength(1);
    expect(features[0].featureType).toBe(FeatureType.UX_IMPROVEMENT);

    // 4. Add a screenshot stub
    const screenshot: Screenshot = {
      id: generateScreenshotId(),
      sessionId,
      dataUrl: 'data:image/png;base64,iVBORw0KGgo=',
      url: 'http://localhost:38470/form',
      timestamp: Date.now(),
      width: 1280,
      height: 720,
    };
    await addScreenshot(screenshot);
    await updateSession(sessionId, { screenshotCount: 1 });

    const screenshots = await getScreenshotsBySession(sessionId);
    expect(screenshots).toHaveLength(1);
    expect(screenshots[0].width).toBe(1280);

    // 5. Stop session
    const stopTime = Date.now();
    await updateSession(sessionId, {
      status: SessionStatus.STOPPED,
      stoppedAt: stopTime,
      duration: stopTime - session.startedAt,
    });

    // 6. Verify final state
    const final = await getSession(sessionId);
    expect(final?.status).toBe(SessionStatus.STOPPED);
    expect(final?.duration).toBeGreaterThan(0);
    expect(final?.bugCount).toBe(1);
    expect(final?.featureCount).toBe(1);
    expect(final?.screenshotCount).toBe(1);
  });

  it('session status transitions: RECORDING → PAUSED → RECORDING → STOPPED', async () => {
    const sessionId = generateSessionId(new Date('2026-02-22'), 2);
    await createSession({
      id: sessionId,
      name: 'Pause test',
      description: '',
      status: SessionStatus.RECORDING,
      startedAt: Date.now(),
      duration: 0,
      pages: [],
      actionCount: 0,
      bugCount: 0,
      featureCount: 0,
      screenshotCount: 0,
    });

    await updateSession(sessionId, { status: SessionStatus.PAUSED });
    expect((await getSession(sessionId))?.status).toBe(SessionStatus.PAUSED);

    await updateSession(sessionId, { status: SessionStatus.RECORDING });
    expect((await getSession(sessionId))?.status).toBe(SessionStatus.RECORDING);

    await updateSession(sessionId, { status: SessionStatus.STOPPED, stoppedAt: Date.now(), duration: 5000 });
    const stopped = await getSession(sessionId);
    expect(stopped?.status).toBe(SessionStatus.STOPPED);
    expect(stopped?.duration).toBe(5000);
  });

  it('multiple sessions are isolated from each other', async () => {
    const id1 = generateSessionId(new Date('2026-02-22'), 1);
    const id2 = generateSessionId(new Date('2026-02-22'), 2);

    for (const id of [id1, id2]) {
      await createSession({
        id,
        name: `Session ${id}`,
        description: '',
        status: SessionStatus.RECORDING,
        startedAt: Date.now(),
        duration: 0,
        pages: [],
        actionCount: 0,
        bugCount: 0,
        featureCount: 0,
        screenshotCount: 0,
      });
    }

    await addBug({ id: generateBugId(), sessionId: id1, type: 'bug', priority: BugPriority.P1, title: 'Bug in session 1', description: '', url: '', timestamp: Date.now() });
    await addBug({ id: generateBugId(), sessionId: id2, type: 'bug', priority: BugPriority.P2, title: 'Bug in session 2', description: '', url: '', timestamp: Date.now() });
    await addBug({ id: generateBugId(), sessionId: id2, type: 'bug', priority: BugPriority.P3, title: 'Bug2 in session 2', description: '', url: '', timestamp: Date.now() });

    const bugs1 = await getBugsBySession(id1);
    const bugs2 = await getBugsBySession(id2);
    expect(bugs1).toHaveLength(1);
    expect(bugs2).toHaveLength(2);
  });
});

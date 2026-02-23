/**
 * Unit tests for src/core/db.ts — all CRUD helpers using fake-indexeddb.
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  db,
  createSession,
  getSession,
  updateSession,
  getAllSessions,
  addBug,
  getBugsBySession,
  addFeature,
  getFeaturesBySession,
  addScreenshot,
  getScreenshotsBySession,
  addRecordingChunk,
  getRecordingChunks,
} from '@core/db';
import { SessionStatus, BugPriority, FeatureType } from '@shared/types';
import type { Session, Bug, Feature, Screenshot, RecordingChunk } from '@shared/types';

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 'ats-2026-02-22-001',
    name: 'Test Session',
    description: 'A unit test session',
    status: SessionStatus.RECORDING,
    startedAt: Date.now(),
    duration: 0,
    pages: ['http://localhost:38470'],
    actionCount: 0,
    bugCount: 0,
    featureCount: 0,
    screenshotCount: 0,
    tags: [],
    recordMouseMove: false,
    ...overrides,
  };
}

beforeEach(async () => {
  await db.sessions.clear();
  await db.bugs.clear();
  await db.features.clear();
  await db.screenshots.clear();
  await db.recordings.clear();
});

describe('Sessions', () => {
  it('creates and retrieves a session', async () => {
    const session = makeSession();
    await createSession(session);
    const fetched = await getSession(session.id);
    expect(fetched).toBeDefined();
    expect(fetched?.id).toBe(session.id);
    expect(fetched?.name).toBe('Test Session');
  });

  it('updates session fields', async () => {
    const session = makeSession();
    await createSession(session);
    await updateSession(session.id, { status: SessionStatus.COMPLETED, duration: 5000 });
    const updated = await getSession(session.id);
    expect(updated?.status).toBe(SessionStatus.COMPLETED);
    expect(updated?.duration).toBe(5000);
  });

  it('returns sessions ordered by startedAt descending', async () => {
    await createSession(makeSession({ id: 'ats-2026-02-22-001', startedAt: 1000 }));
    await createSession(makeSession({ id: 'ats-2026-02-22-002', startedAt: 3000 }));
    await createSession(makeSession({ id: 'ats-2026-02-22-003', startedAt: 2000 }));
    const sessions = await getAllSessions();
    expect(sessions[0].startedAt).toBe(3000);
    expect(sessions[1].startedAt).toBe(2000);
    expect(sessions[2].startedAt).toBe(1000);
  });

  it('returns undefined for unknown session id', async () => {
    const result = await getSession('ats-9999-01-01-999');
    expect(result).toBeUndefined();
  });
});

describe('Bugs', () => {
  it('adds and retrieves bugs by session', async () => {
    const bug: Bug = {
      id: 'bug-aabbccdd',
      sessionId: 'ats-2026-02-22-001',
      type: 'bug',
      priority: BugPriority.P1,
      status: 'open',
      title: 'Login broken',
      description: 'Cannot log in with valid credentials',
      url: 'http://localhost:38470/login',
      timestamp: Date.now(),
    };
    await addBug(bug);
    const bugs = await getBugsBySession('ats-2026-02-22-001');
    expect(bugs).toHaveLength(1);
    expect(bugs[0].title).toBe('Login broken');
  });

  it('isolates bugs by sessionId', async () => {
    await addBug({ id: 'bug-1', sessionId: 'session-A', type: 'bug', priority: BugPriority.P2, status: 'open', title: 'A', description: '', url: '', timestamp: 1 });
    await addBug({ id: 'bug-2', sessionId: 'session-B', type: 'bug', priority: BugPriority.P3, status: 'open', title: 'B', description: '', url: '', timestamp: 2 });
    const bugsA = await getBugsBySession('session-A');
    expect(bugsA).toHaveLength(1);
    expect(bugsA[0].id).toBe('bug-1');
  });
});

describe('Features', () => {
  it('adds and retrieves features by session', async () => {
    const feature: Feature = {
      id: 'feat-aabbccdd',
      sessionId: 'ats-2026-02-22-001',
      type: 'feature',
      featureType: FeatureType.ENHANCEMENT,
      status: 'open',
      title: 'Add dark mode',
      description: '',
      url: 'http://localhost:38470',
      timestamp: Date.now(),
    };
    await addFeature(feature);
    const features = await getFeaturesBySession('ats-2026-02-22-001');
    expect(features).toHaveLength(1);
    expect(features[0].title).toBe('Add dark mode');
  });
});

describe('Screenshots', () => {
  it('adds and retrieves screenshots by session', async () => {
    const screenshot: Screenshot = {
      id: 'ss-aabbccdd',
      sessionId: 'ats-2026-02-22-001',
      dataUrl: 'data:image/png;base64,abc',
      url: 'http://localhost:38470',
      timestamp: Date.now(),
      width: 1280,
      height: 720,
    };
    await addScreenshot(screenshot);
    const shots = await getScreenshotsBySession('ats-2026-02-22-001');
    expect(shots).toHaveLength(1);
    expect(shots[0].width).toBe(1280);
  });
});

describe('RecordingChunks', () => {
  it('adds and retrieves chunks sorted by chunkIndex', async () => {
    const base: RecordingChunk = {
      sessionId: 'ats-2026-02-22-001',
      chunkIndex: 0,
      pageUrl: 'http://localhost:38470',
      events: [{ type: 3, timestamp: 1000, data: {} }],
      createdAt: Date.now(),
    };
    await addRecordingChunk({ ...base, chunkIndex: 2 });
    await addRecordingChunk({ ...base, chunkIndex: 0 });
    await addRecordingChunk({ ...base, chunkIndex: 1 });
    const chunks = await getRecordingChunks('ats-2026-02-22-001');
    expect(chunks).toHaveLength(3);
    expect(chunks[0].chunkIndex).toBe(0);
    expect(chunks[2].chunkIndex).toBe(2);
  });
});

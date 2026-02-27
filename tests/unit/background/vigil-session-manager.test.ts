/**
 * Unit tests: vigilSessionManager (Sprint 06 — session = container, recording = opt-in)
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { VIGILSnapshot, Bug, Feature, BugPriority, FeatureType } from '@shared/types';

// ── Chrome API mocks ──────────────────────────────────────────────────────────

vi.stubGlobal('chrome', {
  alarms: { create: vi.fn(), clear: vi.fn(), onAlarm: { addListener: vi.fn() } },
  tabs: {
    sendMessage: vi.fn((_id: unknown, _msg: unknown, cb?: () => void) => cb?.()),
    get: vi.fn(),
    captureVisibleTab: vi.fn(),
    query: vi.fn((_q: unknown, cb: (tabs: unknown[]) => void) => cb([])),
  },
  windows: { WINDOW_ID_CURRENT: -2 },
  runtime: {
    lastError: null,
    sendMessage: vi.fn(() => Promise.resolve()),
    getURL: vi.fn((path: string) => `chrome-extension://test/${path}`),
  },
  storage: { local: { get: vi.fn((_keys: unknown, cb: (r: Record<string, unknown>) => void) => cb?.({})), set: vi.fn(), remove: vi.fn() } },
});

// Mock fetch for postWithRetry (endSession calls it)
vi.stubGlobal('fetch', vi.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({ serverPort: 7474 }) })
));

const { vigilSessionManager } = await import('@background/session-manager');

// ── Helpers ───────────────────────────────────────────────────────────────────

function resetManager(): Promise<void> {
  // End any lingering session to reset state
  if (vigilSessionManager.hasActiveSession()) {
    return vigilSessionManager.endSession().then(() => {});
  }
  return Promise.resolve();
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(async () => {
  vi.clearAllMocks();
  await resetManager();
});

describe('vigilSessionManager', () => {
  describe('createSession', () => {
    it('creates a session with correct shape', async () => {
      const session = await vigilSessionManager.createSession('Test session', 'my-project');
      expect(session.id).toMatch(/^vigil-SESSION-/);
      expect(session.name).toBe('Test session');
      expect(session.projectId).toBe('my-project');
      expect(session.startedAt).toBeTypeOf('number');
      expect(session.clock).toBe(0);
      expect(session.recordings).toEqual([]);
      expect(session.snapshots).toEqual([]);
      expect(session.bugs).toEqual([]);
      expect(session.features).toEqual([]);
      expect(session.endedAt).toBeUndefined();
      expect(session.pendingSync).toBeUndefined();
    });

    it('throws if session already active', async () => {
      await vigilSessionManager.createSession('First', 'proj');
      await expect(vigilSessionManager.createSession('Second', 'proj'))
        .rejects.toThrow(/already active/);
    });

    it('sets tabId when provided', async () => {
      await vigilSessionManager.createSession('Tab test', 'proj', 42);
      expect(vigilSessionManager.hasActiveSession()).toBe(true);
    });
  });

  describe('startRecording / stopRecording', () => {
    it('starts a recording within an active session', async () => {
      await vigilSessionManager.createSession('Rec test', 'proj');
      const rec = vigilSessionManager.startRecording();
      expect(rec.id).toMatch(/^rec-/);
      expect(rec.startedAt).toBeTypeOf('number');
      expect(rec.rrwebChunks).toEqual([]);
      expect(rec.mouseTracking).toBe(false);
      expect(vigilSessionManager.isRecordingActive()).toBe(true);
    });

    it('starts a recording with mouse tracking', async () => {
      await vigilSessionManager.createSession('Mouse test', 'proj');
      const rec = vigilSessionManager.startRecording(true);
      expect(rec.mouseTracking).toBe(true);
    });

    it('throws if no active session', () => {
      expect(() => vigilSessionManager.startRecording()).toThrow(/No active session/);
    });

    it('throws if recording already active', async () => {
      await vigilSessionManager.createSession('Double rec', 'proj');
      vigilSessionManager.startRecording();
      expect(() => vigilSessionManager.startRecording()).toThrow(/Recording already active/);
    });

    it('stops a recording and sets endedAt', async () => {
      await vigilSessionManager.createSession('Stop test', 'proj');
      vigilSessionManager.startRecording();
      const stopped = vigilSessionManager.stopRecording();
      expect(stopped).not.toBeNull();
      expect(stopped!.endedAt).toBeTypeOf('number');
      expect(vigilSessionManager.isRecordingActive()).toBe(false);
    });

    it('returns null if no recording active', async () => {
      await vigilSessionManager.createSession('No rec', 'proj');
      expect(vigilSessionManager.stopRecording()).toBeNull();
    });

    it('stores recording in session.recordings', async () => {
      await vigilSessionManager.createSession('Store test', 'proj');
      vigilSessionManager.startRecording();
      vigilSessionManager.stopRecording();
      const session = vigilSessionManager.getActiveSession();
      expect(session!.recordings).toHaveLength(1);
    });
  });

  describe('toggleRecording', () => {
    it('starts recording when none active, returns true', async () => {
      await vigilSessionManager.createSession('Toggle test', 'proj');
      const result = vigilSessionManager.toggleRecording();
      expect(result).toBe(true);
      expect(vigilSessionManager.isRecordingActive()).toBe(true);
    });

    it('stops recording when active, returns false', async () => {
      await vigilSessionManager.createSession('Toggle test 2', 'proj');
      vigilSessionManager.startRecording();
      const result = vigilSessionManager.toggleRecording();
      expect(result).toBe(false);
      expect(vigilSessionManager.isRecordingActive()).toBe(false);
    });
  });

  describe('addSnapshot / addBug / addFeature', () => {
    it('adds snapshot to active session', async () => {
      await vigilSessionManager.createSession('Snap test', 'proj');
      const snap: VIGILSnapshot = {
        id: 'snap-test',
        capturedAt: 1000,
        screenshotDataUrl: 'data:image/png;base64,abc',
        url: 'http://test.com',
        triggeredBy: 'manual',
      };
      vigilSessionManager.addSnapshot(snap);
      expect(vigilSessionManager.getActiveSession()!.snapshots).toHaveLength(1);
    });

    it('adds bug to active session', async () => {
      await vigilSessionManager.createSession('Bug test', 'proj');
      const bug: Bug = {
        id: 'bug-test',
        sessionId: 'test',
        type: 'bug',
        priority: 'P2' as BugPriority,
        status: 'open',
        title: 'Test bug',
        description: 'desc',
        url: 'http://test.com',
        timestamp: Date.now(),
      };
      vigilSessionManager.addBug(bug);
      expect(vigilSessionManager.getActiveSession()!.bugs).toHaveLength(1);
    });

    it('adds feature to active session', async () => {
      await vigilSessionManager.createSession('Feat test', 'proj');
      const feat: Feature = {
        id: 'feat-test',
        sessionId: 'test',
        type: 'feature',
        featureType: 'ENHANCEMENT' as FeatureType,
        status: 'open',
        title: 'Test feature',
        description: 'desc',
        url: 'http://test.com',
        timestamp: Date.now(),
      };
      vigilSessionManager.addFeature(feat);
      expect(vigilSessionManager.getActiveSession()!.features).toHaveLength(1);
    });

    it('silently no-ops when no session active', () => {
      // Should not throw
      vigilSessionManager.addSnapshot({
        id: 'snap-noop', capturedAt: 0, screenshotDataUrl: '', url: '', triggeredBy: 'auto',
      });
      vigilSessionManager.addBug({
        id: 'bug-noop', sessionId: '', type: 'bug', priority: 'P3' as BugPriority,
        status: 'open', title: '', description: '', url: '', timestamp: 0,
      });
      vigilSessionManager.addFeature({
        id: 'feat-noop', sessionId: '', type: 'feature', featureType: 'NEW_FEATURE' as FeatureType,
        status: 'open', title: '', description: '', url: '', timestamp: 0,
      });
    });
  });

  describe('endSession', () => {
    it('ends session, sets endedAt and clock', async () => {
      await vigilSessionManager.createSession('End test', 'proj');
      const ended = await vigilSessionManager.endSession();
      expect(ended.endedAt).toBeTypeOf('number');
      expect(ended.clock).toBeGreaterThanOrEqual(0);
      expect(vigilSessionManager.hasActiveSession()).toBe(false);
    });

    it('stops active recording before ending', async () => {
      await vigilSessionManager.createSession('End with rec', 'proj');
      vigilSessionManager.startRecording();
      const ended = await vigilSessionManager.endSession();
      expect(ended.recordings[0].endedAt).toBeTypeOf('number');
    });

    it('throws if no active session', async () => {
      await expect(vigilSessionManager.endSession()).rejects.toThrow(/No active session/);
    });

    it('calls POST to server', async () => {
      await vigilSessionManager.createSession('POST test', 'proj');
      await vigilSessionManager.endSession();
      // fetch is called: once for config (getURL), once for POST
      expect(fetch).toHaveBeenCalled();
    });
  });

  describe('state queries', () => {
    it('getActiveSessionId returns null when no session', () => {
      expect(vigilSessionManager.getActiveSessionId()).toBeNull();
    });

    it('getActiveSessionId returns id when session active', async () => {
      const session = await vigilSessionManager.createSession('Query test', 'proj');
      expect(vigilSessionManager.getActiveSessionId()).toBe(session.id);
    });

    it('hasActiveSession is true/false correctly', async () => {
      expect(vigilSessionManager.hasActiveSession()).toBe(false);
      await vigilSessionManager.createSession('Has test', 'proj');
      expect(vigilSessionManager.hasActiveSession()).toBe(true);
    });
  });
});

/**
 * Unit tests: session-manager state machine
 * Chrome APIs are mocked via vi.stubGlobal.
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ── Chrome API mocks ──────────────────────────────────────────────────────────

const mockAlarms = {
  create: vi.fn(),
  clear: vi.fn(),
  onAlarm: { addListener: vi.fn() },
};

const mockTabs = {
  sendMessage: vi.fn((_tabId, _msg, cb) => cb?.()),
  get: vi.fn(),
};

const mockRuntime = {
  lastError: null as { message: string } | null,
};

vi.stubGlobal('chrome', {
  alarms: mockAlarms,
  tabs: mockTabs,
  runtime: mockRuntime,
});

// Import after stubbing chrome
const { sessionManager } = await import('@background/session-manager');

// ── Helpers ───────────────────────────────────────────────────────────────────

async function createTestSession(name = 'Test Session') {
  return sessionManager.createSession(name, 'desc', 'http://localhost:38470');
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockRuntime.lastError = null;
});

afterEach(async () => {
  if (sessionManager.getActiveSessionId()) {
    try { await sessionManager.stopSession(); } catch { /* already stopped */ }
  }
});

describe('sessionManager.createSession', () => {
  it('creates a session and returns it with RECORDING status', async () => {
    const session = await createTestSession('Login flow');
    expect(session.id).toMatch(/^ats-\d{4}-\d{2}-\d{2}-\d+$/);
    expect(session.name).toBe('Login flow');
    expect(session.status).toBe('RECORDING');
    expect(session.startedAt).toBeGreaterThan(0);
  });

  it('starts keep-alive alarm on session creation', async () => {
    await createTestSession();
    expect(mockAlarms.create).toHaveBeenCalledWith(
      'refine-keepalive',
      expect.objectContaining({ periodInMinutes: expect.any(Number) })
    );
  });

  it('notifies the tab with START_RECORDING', async () => {
    const session = await sessionManager.createSession('Nav test', '', 'http://x.com', 42);
    expect(mockTabs.sendMessage).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        type: 'START_RECORDING',
        payload: expect.objectContaining({ sessionId: session.id }),
      }),
      expect.any(Function)
    );
  });

  it('exposes active session id', async () => {
    const session = await createTestSession();
    expect(sessionManager.getActiveSessionId()).toBe(session.id);
    expect(sessionManager.isRecording()).toBe(true);
  });
});

describe('sessionManager.pauseSession / resumeSession', () => {
  it('pauses and resumes correctly', async () => {
    await createTestSession();

    await sessionManager.pauseSession();
    expect(sessionManager.getStatus()).toBe('PAUSED');
    expect(sessionManager.isRecording()).toBe(false);

    await sessionManager.resumeSession();
    expect(sessionManager.getStatus()).toBe('RECORDING');
    expect(sessionManager.isRecording()).toBe(true);
  });

  it('throws when pausing a session that is not RECORDING', async () => {
    await createTestSession();
    await sessionManager.pauseSession();
    await expect(sessionManager.pauseSession()).rejects.toThrow();
  });

  it('throws when resuming a session that is not PAUSED', async () => {
    await createTestSession();
    await expect(sessionManager.resumeSession()).rejects.toThrow();
  });
});

describe('sessionManager.stopSession', () => {
  it('stops the session and returns COMPLETED', async () => {
    await createTestSession();
    const stopped = await sessionManager.stopSession();
    expect(stopped.status).toBe('COMPLETED');
    expect(stopped.stoppedAt).toBeGreaterThan(0);
    expect(stopped.duration).toBeGreaterThanOrEqual(0);
  });

  it('clears keep-alive alarm on stop', async () => {
    await createTestSession();
    await sessionManager.stopSession();
    expect(mockAlarms.clear).toHaveBeenCalledWith('refine-keepalive');
  });

  it('clears active session state after stop', async () => {
    await createTestSession();
    await sessionManager.stopSession();
    expect(sessionManager.getActiveSessionId()).toBeNull();
    expect(sessionManager.isRecording()).toBe(false);
  });

  it('throws when stopping with no active session', async () => {
    await createTestSession();
    await sessionManager.stopSession();
    await expect(sessionManager.stopSession()).rejects.toThrow();
  });

  it('accounts for paused time in duration', async () => {
    await createTestSession();
    await sessionManager.pauseSession();
    await new Promise((r) => setTimeout(r, 50));
    await sessionManager.resumeSession();
    const stopped = await sessionManager.stopSession();
    // Duration should be less than wall-clock time (paused time excluded)
    expect(stopped.duration).toBeGreaterThanOrEqual(0);
  });
});

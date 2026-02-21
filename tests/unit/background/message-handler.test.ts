/**
 * Unit tests: message-handler routing
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MessageType } from '@shared/types';

// ── Chrome API mocks ──────────────────────────────────────────────────────────

vi.stubGlobal('chrome', {
  alarms: { create: vi.fn(), clear: vi.fn(), onAlarm: { addListener: vi.fn() } },
  tabs: { sendMessage: vi.fn((_id, _msg, cb) => cb?.()), get: vi.fn(), captureVisibleTab: vi.fn() },
  windows: { WINDOW_ID_CURRENT: -2 },
  runtime: { lastError: null },
});

const { handleMessage } = await import('@background/message-handler');

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeMsg(type: string, payload?: unknown) {
  return { type, payload, source: 'test' } as Parameters<typeof handleMessage>[0];
}

function makeSender(tabId?: number): chrome.runtime.MessageSender {
  return tabId ? { tab: { id: tabId } } as chrome.runtime.MessageSender : {} as chrome.runtime.MessageSender;
}

function call(type: string, payload?: unknown, tabId?: number): Promise<{ ok: boolean; error?: string; data?: unknown }> {
  return new Promise((resolve) => {
    handleMessage(makeMsg(type, payload), makeSender(tabId), resolve as (r: unknown) => void);
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => vi.clearAllMocks());

describe('handleMessage routing', () => {
  it('PING returns PONG', async () => {
    const res = await call(MessageType.PING);
    expect(res.ok).toBe(true);
    expect((res.data as { type: string }).type).toBe(MessageType.PONG);
  });

  it('CREATE_SESSION returns new session', async () => {
    const res = await call(MessageType.CREATE_SESSION, {
      name: 'Handler test',
      description: '',
      url: 'http://localhost:38470',
      tabId: undefined,
    });
    expect(res.ok).toBe(true);
    expect((res.data as { id: string }).id).toMatch(/^ats-/);
  });

  it('PAUSE_RECORDING returns ok (session is active from previous test)', async () => {
    const res = await call(MessageType.PAUSE_RECORDING);
    expect(res.ok).toBe(true);
  });

  it('RESUME_RECORDING returns ok', async () => {
    const res = await call(MessageType.RESUME_RECORDING);
    expect(res.ok).toBe(true);
  });

  it('GET_SESSION_STATUS returns status data', async () => {
    const res = await call(MessageType.GET_SESSION_STATUS);
    expect(res.ok).toBe(true);
    expect(res.data).toHaveProperty('isRecording');
    expect(res.data).toHaveProperty('status');
  });

  it('SESSION_STATUS_UPDATE returns ok', async () => {
    const res = await call(MessageType.SESSION_STATUS_UPDATE, { url: 'http://localhost:38470/about' });
    expect(res.ok).toBe(true);
  });

  it('unknown message type returns error', async () => {
    const res = await call('TOTALLY_UNKNOWN_TYPE');
    expect(res.ok).toBe(false);
    expect(res.error).toContain('Unknown');
  });

  it('STOP_RECORDING completes the session', async () => {
    const res = await call(MessageType.STOP_RECORDING);
    expect(res.ok).toBe(true);
    expect((res.data as { status: string }).status).toBe('COMPLETED');
  });
});

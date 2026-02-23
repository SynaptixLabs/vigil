/**
 * @file session-manager.ts
 * @description Session lifecycle state machine for Refine background service worker.
 * States: idle → RECORDING ↔ PAUSED → COMPLETED
 */

import { SessionStatus, type Session } from '@shared/types';
import { generateSessionId } from '@shared/utils';
import {
  createSession,
  getSession,
  updateSession,
  getSessionsForToday,
} from '@core/db';
import { startKeepAlive, stopKeepAlive } from './keep-alive';

interface ActiveSessionState {
  sessionId: string | null;
  status: SessionStatus;
  pausedAt: number | null;
  totalPausedMs: number;
  tabId: number | undefined;
}

const state: ActiveSessionState = {
  sessionId: null,
  status: SessionStatus.COMPLETED,
  pausedAt: null,
  totalPausedMs: 0,
  tabId: undefined,
};

async function getNextSequence(): Promise<number> {
  const todaySessions = await getSessionsForToday();
  return todaySessions.length + 1;
}

async function ensureContentScript(tabId: number): Promise<boolean> {
  try {
    // Check if script is already running by sending a ping
    await new Promise<void>((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, { type: 'PING' }, (response) => {
        if (chrome.runtime.lastError || !response?.ok) reject(chrome.runtime.lastError);
        else resolve();
      });
    });
    return true;
  } catch (e) {
    console.log('[Refine] Content script missing, injecting...', e);
    // Script missing, try to inject
    try {
      const manifest = await fetch(chrome.runtime.getURL('manifest.json')).then(r => r.json());
      const files = manifest.content_scripts?.[0]?.js ?? [];
      if (files.length === 0) return false;

      await chrome.scripting.executeScript({ target: { tabId }, files });
      
      // Wait for script to initialize
      await new Promise(r => setTimeout(r, 500));
      return true;
    } catch (injectErr) {
      console.error('[Refine] Injection failed:', injectErr);
      return false;
    }
  }
}

async function sendStartRecording(tabId: number, payload: { sessionId: string; recordMouseMove: boolean }, retries = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      await new Promise<void>((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, { type: 'START_RECORDING', payload, source: 'background' }, (_response) => {
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
          else resolve();
        });
      });
      return true;
    } catch (e) {
      console.warn(`[Refine] START_RECORDING attempt ${i + 1} failed:`, e);
      if (i < retries - 1) {
        // Try injecting if it might be missing
        await ensureContentScript(tabId);
        await new Promise(r => setTimeout(r, 1000)); // Wait before retry
      }
    }
  }
  return false;
}

function notifyTab(tabId: number | undefined, type: string, payload?: unknown): void {
  if (!tabId) return;
  
  // Special handling for START_RECORDING to be robust
  if (type === 'START_RECORDING') {
    const startPayload = payload as { sessionId: string; recordMouseMove: boolean };
    sendStartRecording(tabId, startPayload).then(success => {
      if (!success) console.error('[Refine] Failed to start recording on tab', tabId);
      else console.log('[Refine] Recording started on tab', tabId);
    });
    return;
  }

  // Standard notification for other events
  chrome.tabs.sendMessage(tabId, { type, payload, source: 'background' }, () => {
    if (!chrome.runtime.lastError) return;
    console.warn('[Refine] Tab notify failed:', chrome.runtime.lastError.message);
  });
}

export const sessionManager = {
  setTabId(tabId: number): void {
    if (state.sessionId && !state.tabId) {
      state.tabId = tabId;
      console.log('[Refine] Updated recording tabId from content script:', tabId);
    }
  },

  async createSession(
    name: string,
    description: string,
    url: string,
    tabId?: number,
    recordMouseMove = false,
    tags: string[] = [],
    project?: string,
    outputPath?: string
  ): Promise<Session> {
    if (state.sessionId) {
      throw new Error(`[Refine] Session already active: ${state.sessionId}`);
    }
    const sequence = await getNextSequence();
    const id = generateSessionId(new Date(), sequence);
    const now = Date.now();

    const isUserUrl = (u: string) =>
      Boolean(u) && !u.startsWith('chrome-extension://') && !u.startsWith('chrome://');

    const session: Session = {
      id,
      name,
      description,
      status: SessionStatus.RECORDING,
      startedAt: now,
      duration: 0,
      pages: isUserUrl(url) ? [url] : [],
      tags,
      project,
      outputPath,
      actionCount: 0,
      bugCount: 0,
      featureCount: 0,
      screenshotCount: 0,
      recordMouseMove,
    };

    await createSession(session);

    state.sessionId = id;
    state.status = SessionStatus.RECORDING;
    state.pausedAt = null;
    state.totalPausedMs = 0;
    state.tabId = tabId;

    startKeepAlive();
    notifyTab(tabId, 'START_RECORDING', { sessionId: id, recordMouseMove });

    console.log('[Refine] Session created:', id);
    return session;
  },

  async pauseSession(): Promise<void> {
    if (!state.sessionId || state.status !== SessionStatus.RECORDING) {
      throw new Error('No active recording session to pause');
    }

    state.status = SessionStatus.PAUSED;
    state.pausedAt = Date.now();

    await updateSession(state.sessionId, { status: SessionStatus.PAUSED });
    notifyTab(state.tabId, 'PAUSE_RECORDING');
    console.log('[Refine] Session paused:', state.sessionId);
  },

  async resumeSession(): Promise<void> {
    if (!state.sessionId || state.status !== SessionStatus.PAUSED) {
      throw new Error('No paused session to resume');
    }

    if (state.pausedAt) {
      state.totalPausedMs += Date.now() - state.pausedAt;
    }
    state.status = SessionStatus.RECORDING;
    state.pausedAt = null;

    await updateSession(state.sessionId, { status: SessionStatus.RECORDING });
    notifyTab(state.tabId, 'RESUME_RECORDING');
    console.log('[Refine] Session resumed:', state.sessionId);
  },

  async stopSession(): Promise<Session> {
    if (!state.sessionId) throw new Error('No active session to stop');

    const now = Date.now();
    const session = await getSession(state.sessionId);
    if (!session) throw new Error(`Session not found: ${state.sessionId}`);

    let pausedMs = state.totalPausedMs;
    if (state.pausedAt) pausedMs += now - state.pausedAt;
    const duration = Math.max(0, now - session.startedAt - pausedMs);

    const updates = { status: SessionStatus.COMPLETED, stoppedAt: now, duration };
    await updateSession(state.sessionId, updates);

    notifyTab(state.tabId, 'STOP_RECORDING');
    stopKeepAlive();

    const stoppedId = state.sessionId;
    state.sessionId = null;
    state.status = SessionStatus.COMPLETED;
    state.pausedAt = null;
    state.totalPausedMs = 0;
    state.tabId = undefined;

    console.log('[Refine] Session stopped:', stoppedId);
    return { ...session, ...updates };
  },

  addPage(url: string): void {
    if (!state.sessionId) return;
    getSession(state.sessionId).then((session) => {
      if (!session) return;
      if (!session.pages.includes(url)) {
        updateSession(state.sessionId!, { pages: [...session.pages, url] });
      }
    }).catch((err) => console.error('[Refine] addPage failed:', err));
  },

  getActiveSessionId(): string | null {
    return state.sessionId;
  },

  getStatus(): SessionStatus {
    return state.status;
  },

  isRecording(): boolean {
    return state.status === SessionStatus.RECORDING;
  },
};

/**
 * @file recorder.ts
 * @description rrweb recorder wrapper. Buffers events and flushes to background.
 * Handles start/pause/stop/resume lifecycle.
 */

import { record } from 'rrweb';
import { MessageType } from '@shared/types';
import type { RecordingChunk } from '@shared/types';
import { createNavigationAction } from './action-extractor';

const MAX_BUFFER_EVENTS = 500;
const MAX_BUFFER_BYTES = 5 * 1024 * 1024; // 5MB

interface RecorderState {
  sessionId: string | null;
  isRecording: boolean;
  isPaused: boolean;
  stopFn: (() => void) | null;
  eventBuffer: unknown[];
  chunkIndex: number;
  lastUrl: string;
}

const state: RecorderState = {
  sessionId: null,
  isRecording: false,
  isPaused: false,
  stopFn: null,
  eventBuffer: [],
  chunkIndex: 0,
  lastUrl: '',
};

function sendToBackground(type: string, payload: unknown): void {
  chrome.runtime.sendMessage({ type, payload, source: 'content' }, () => {
    if (chrome.runtime.lastError) {
      console.warn('[Refine] Background message failed:', chrome.runtime.lastError.message);
    }
  });
}

function estimateBytes(events: unknown[]): number {
  try {
    return JSON.stringify(events).length * 2; // rough estimate
  } catch {
    return 0;
  }
}

function flushBuffer(final = false): void {
  if (state.eventBuffer.length === 0 || !state.sessionId) return;

  const chunk: RecordingChunk = {
    sessionId: state.sessionId,
    chunkIndex: state.chunkIndex++,
    pageUrl: state.lastUrl,
    events: [...state.eventBuffer],
    createdAt: Date.now(),
  };

  sendToBackground(MessageType.RECORDING_CHUNK, chunk);
  state.eventBuffer = [];

  if (final) {
    console.log('[Refine] Final chunk flushed, index:', chunk.chunkIndex);
  }
}

export function startRecording(sessionId: string): void {
  if (state.isRecording) {
    console.warn('[Refine] Already recording');
    return;
  }

  state.sessionId = sessionId;
  state.isRecording = true;
  state.isPaused = false;
  state.eventBuffer = [];
  state.chunkIndex = 0;
  state.lastUrl = window.location.href;

  const stopFn = record({
    emit(event) {
      if (state.isPaused) return;

      state.eventBuffer.push(event);

      const shouldFlush =
        state.eventBuffer.length >= MAX_BUFFER_EVENTS ||
        estimateBytes(state.eventBuffer) >= MAX_BUFFER_BYTES;

      if (shouldFlush) flushBuffer();
    },
    maskInputOptions: { password: true },
    sampling: {
      mousemove: 50,
      mouseInteraction: true,
      scroll: 150,
    },
    checkoutEveryNms: 30000, // S01-001: full snapshot every 30s
    blockSelector: '#refine-root', // exclude our own overlay from recording
  });

  state.stopFn = stopFn ?? null;
  console.log('[Refine] Recording started for session:', sessionId);
}

export function pauseRecording(): void {
  if (!state.isRecording || state.isPaused) return;
  state.isPaused = true;
  flushBuffer();
  console.log('[Refine] Recording paused');
}

export function resumeRecording(): void {
  if (!state.isRecording || !state.isPaused) return;
  state.isPaused = false;
  console.log('[Refine] Recording resumed');
}

export function stopRecording(): void {
  if (!state.isRecording) return;

  if (state.stopFn) {
    state.stopFn();
    state.stopFn = null;
  }

  flushBuffer(true);

  state.isRecording = false;
  state.isPaused = false;
  state.sessionId = null;
  console.log('[Refine] Recording stopped');
}

export function handleNavigation(toUrl: string): void {
  if (!state.isRecording || !state.sessionId) return;

  const fromUrl = state.lastUrl;
  flushBuffer(); // flush current page events before navigation

  const action = createNavigationAction(state.sessionId, fromUrl, toUrl, Date.now());
  sendToBackground(MessageType.ACTION_RECORDED, action);

  // Notify background of new page for session.pages tracking
  sendToBackground(MessageType.SESSION_STATUS_UPDATE, { url: toUrl });

  state.lastUrl = toUrl;
  console.log('[Refine] Navigation recorded:', fromUrl, '→', toUrl);
}

export function isRecording(): boolean {
  return state.isRecording && !state.isPaused;
}

export function getSessionId(): string | null {
  return state.sessionId;
}

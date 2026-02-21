/**
 * @file keep-alive.ts
 * @description Prevents MV3 service worker from shutting down during active sessions.
 * Uses chrome.alarms to ping every 24 seconds (MV3 SWs shut down after ~30s idle).
 */

const ALARM_NAME = 'refine-keepalive';
const INTERVAL_MINUTES = 0.4; // 24 seconds

export function startKeepAlive(): void {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: INTERVAL_MINUTES });
  console.log('[Refine] Keep-alive started');
}

export function stopKeepAlive(): void {
  chrome.alarms.clear(ALARM_NAME);
  console.log('[Refine] Keep-alive stopped');
}

export function initKeepAliveListener(): void {
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) {
      console.log('[Refine] Keep-alive ping', new Date().toISOString());
    }
  });
}

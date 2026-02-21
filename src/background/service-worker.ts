/**
 * @file service-worker.ts
 * @description Background service worker for SynaptixLabs Refine.
 * Manages extension lifecycle, cross-context messaging, and core state.
 */

import { onMessage } from '@shared/index';

// Initialize background script
console.log('[Refine] Background service worker initialized.');

// Listen for messages from popup or content scripts
onMessage((message, sender, sendResponse) => {
  console.log(`[Refine] Received message: ${message.type}`, { payload: message.payload, sender });

  // Acknowledge receipt
  sendResponse({ ok: true, data: { received: message.type } });

  // Required for async sendResponse, though currently we are responding synchronously
  // return true;
});

// TODO: keep-alive (Sprint 01)
// MV3 service workers shut down after ~30s of inactivity.
// We will need to implement a keep-alive mechanism using chrome.alarms.

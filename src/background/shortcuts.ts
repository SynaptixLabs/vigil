/**
 * @file shortcuts.ts
 * @description Keyboard shortcut handler for chrome.commands API.
 * Commands are declared in manifest.json under "commands".
 *
 * Sprint 06: snapshot + bug editor combo (D007). S07: Alt+Shift+G.
 */

import { sessionManager } from './session-manager';
import { vigilSessionManager } from './session-manager';
import { captureScreenshot } from './screenshot';
import { MessageType } from '@shared/types';
import type { VIGILSnapshot } from '@shared/types';
import { generateSnapshotId } from '@shared/utils';

export function initShortcuts(): void {
  chrome.commands.onCommand.addListener(async (command) => {
    console.log('[Vigil] Command received:', command);

    switch (command) {
      case 'toggle-recording': {
        // Always use legacy session for rrweb recording control.
        // Vigil session is data-only (snapshots, bugs, POST).
        if (sessionManager.isRecording()) {
          await sessionManager.pauseSession().catch((e) =>
            console.warn('[Vigil] Shortcut pause failed:', e)
          );
        } else if (sessionManager.getStatus() === 'PAUSED') {
          await sessionManager.resumeSession().catch((e) =>
            console.warn('[Vigil] Shortcut resume failed:', e)
          );
        }
        break;
      }

      case 'capture-screenshot': {
        // BUG-FAT-003: Check vigil session as fallback when legacy session is inactive
        const sessionId = sessionManager.getActiveSessionId() || vigilSessionManager.getActiveSessionId();
        if (!sessionId) break;
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tabId = tabs[0]?.id;

        // Capture in legacy screenshot DB
        await captureScreenshot(sessionId, tabId).catch((e) =>
          console.warn('[Vigil] Shortcut screenshot failed:', e)
        );

        // Store as VIGILSnapshot if vigil session active
        if (vigilSessionManager.hasActiveSession() && tabId) {
          try {
            const tab = await chrome.tabs.get(tabId).catch(() => undefined);
            const windowId = tab?.windowId ?? chrome.windows.WINDOW_ID_CURRENT;
            const pageUrl = tab?.url ?? 'unknown';
            const dataUrl = await new Promise<string>((resolve) => {
              chrome.tabs.captureVisibleTab(windowId, { format: 'png' }, (result) => {
                if (chrome.runtime.lastError || !result) {
                  resolve('');
                } else {
                  resolve(result);
                }
              });
            });
            if (dataUrl) {
              const snapshot: VIGILSnapshot = {
                id: generateSnapshotId(),
                capturedAt: Date.now() - (vigilSessionManager.getActiveSession()?.startedAt ?? Date.now()),
                screenshotDataUrl: dataUrl,
                url: pageUrl,
                triggeredBy: 'manual',
              };
              vigilSessionManager.addSnapshot(snapshot);
            }
          } catch (e) {
            console.warn('[Vigil] Vigil snapshot on Ctrl+Shift+S failed:', e);
          }
        }
        // BUG-FAT-011: Always send toast when ANY session is active (not just vigil session)
        if (tabId) {
          chrome.tabs.sendMessage(tabId, {
            type: 'SCREENSHOT_FEEDBACK',
            payload: { message: '✓ Screenshot captured' },
            source: 'background',
          }).catch(() => {});
        }
        break;
      }

      case 'open-bug-editor': {
        // Sprint 06: Snapshot + bug editor combo (D007)
        // 1. Capture screenshot
        // 2. Create VIGILSnapshot
        // 3. Send OPEN_BUG_EDITOR with snapshotId to content script
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tabId = tabs[0]?.id;
        if (!tabId) break;

        // Need either a legacy or vigil session active
        const legacySessionId = sessionManager.getActiveSessionId();
        const vigilSession = vigilSessionManager.getActiveSession();
        if (!legacySessionId && !vigilSession) break;

        try {
          // Capture the visible tab
          const tab = await chrome.tabs.get(tabId).catch(() => undefined);
          const windowId = tab?.windowId ?? chrome.windows.WINDOW_ID_CURRENT;
          const pageUrl = tab?.url ?? 'unknown';

          const dataUrl = await new Promise<string>((resolve) => {
            chrome.tabs.captureVisibleTab(windowId, { format: 'png' }, (result) => {
              if (chrome.runtime.lastError || !result) {
                resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
              } else {
                resolve(result);
              }
            });
          });

          // Create VIGILSnapshot and store in vigil session
          const snapshot: VIGILSnapshot = {
            id: generateSnapshotId(),
            capturedAt: vigilSession ? Date.now() - vigilSession.startedAt : Date.now(),
            screenshotDataUrl: dataUrl,
            url: pageUrl,
            triggeredBy: 'bug-editor',
          };

          if (vigilSession) {
            vigilSessionManager.addSnapshot(snapshot);
          }

          // Also store in legacy screenshot DB if legacy session is active
          if (legacySessionId) {
            await captureScreenshot(legacySessionId, tabId).catch(() => {});
          }

          // BUG-FAT-004: Show capture feedback before opening bug editor
          chrome.tabs.sendMessage(tabId, {
            type: 'SCREENSHOT_FEEDBACK',
            payload: { message: '✓ Screenshot captured' },
            source: 'background',
          }).catch(() => {});

          // Open bug editor in content script with snapshot
          chrome.tabs.sendMessage(tabId, {
            type: MessageType.OPEN_BUG_EDITOR,
            payload: { snapshotId: snapshot.id, screenshotDataUrl: dataUrl, url: pageUrl },
            source: 'background',
          }, () => {
            if (chrome.runtime.lastError) {
              // Fallback: try legacy LOG_BUG
              chrome.tabs.sendMessage(tabId, {
                type: MessageType.LOG_BUG,
                payload: { openEditor: true },
                source: 'background',
              }, () => {
                if (chrome.runtime.lastError) {
                  console.warn('[Vigil] Shortcut open-bug-editor failed:', chrome.runtime.lastError.message);
                }
              });
            }
          });
        } catch (e) {
          console.warn('[Vigil] Snapshot + bug editor combo failed:', e);
        }
        break;
      }
    }
  });
}

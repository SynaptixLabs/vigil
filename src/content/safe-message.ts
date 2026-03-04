/**
 * @file safe-message.ts
 * @description Guard wrapper for chrome.runtime.sendMessage that survives
 * extension context invalidation. After extension reload/update, old content
 * scripts remain injected but chrome.runtime.sendMessage throws synchronously.
 * This wrapper catches that error silently.
 *
 * Used by: content-script.ts, ControlBar.tsx, inspector.ts
 * Note: BugEditor.tsx uses inline try/catch (needs Promise resolution on error).
 *       recorder.ts has its own inline try/catch in sendToBackground().
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeSendMessage(message: Record<string, unknown>, callback?: (response: any) => void): void {
  try {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) return;
      callback?.(response);
    });
  } catch {
    // Extension context invalidated — content script is stale after reload.
    // Silently ignore; user will refresh the page to get a fresh content script.
  }
}

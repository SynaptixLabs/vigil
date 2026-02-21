/**
 * @file messages.ts
 * @description Types and helpers for Chrome Extension messaging protocol.
 */

import { MessageType } from './types';

/**
 * Base interface for all Chrome extension messages.
 */
export interface ChromeMessage<T = unknown> {
  type: MessageType;
  payload?: T;
  source?: 'popup' | 'content' | 'background';
}

/**
 * Standard response format for Chrome message handlers.
 */
export interface ChromeResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

/**
 * Type-safe wrapper around chrome.runtime.sendMessage.
 * Sends a message from one execution context to another (e.g., popup to background).
 *
 * @param message The message to send
 * @returns Promise resolving to the expected response type
 */
export const sendMessage = async <TResponse = unknown>(
  message: ChromeMessage
): Promise<ChromeResponse<TResponse>> => {
  try {
    const response = await chrome.runtime.sendMessage(message);
    return response as ChromeResponse<TResponse>;
  } catch (error) {
    console.error(`[Refine] Error sending message ${message.type}:`, error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Helper to handle incoming messages in background or content scripts.
 * Maps to chrome.runtime.onMessage.addListener.
 */
export const onMessage = (
  handler: (
    message: ChromeMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ChromeResponse) => void
  ) => boolean | void
) => {
  chrome.runtime.onMessage.addListener(handler);
};

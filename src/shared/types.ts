/**
 * @file types.ts
 * @description Core TypeScript interfaces and enums for SynaptixLabs Refine.
 */

/**
 * Status of a recording session.
 */
export enum SessionStatus {
  RECORDING = 'RECORDING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

/**
 * Priority level for logged bugs.
 */
export enum BugPriority {
  P0 = 'P0', // Critical: Blocker
  P1 = 'P1', // High: Core functionality broken
  P2 = 'P2', // Medium: Non-critical bug
  P3 = 'P3'  // Low: Cosmetic or minor issue
}

/**
 * Type of feature request logged.
 */
export enum FeatureType {
  ENHANCEMENT = 'ENHANCEMENT',
  NEW_FEATURE = 'NEW_FEATURE',
  UX_IMPROVEMENT = 'UX_IMPROVEMENT'
}

/**
 * Types of Chrome extension messages.
 */
export enum MessageType {
  PING = 'PING',
  PONG = 'PONG',
  START_RECORDING = 'START_RECORDING',
  STOP_RECORDING = 'STOP_RECORDING',
  PAUSE_RECORDING = 'PAUSE_RECORDING',
  RESUME_RECORDING = 'RESUME_RECORDING',
  LOG_BUG = 'LOG_BUG',
  LOG_FEATURE = 'LOG_FEATURE',
  CAPTURE_SCREENSHOT = 'CAPTURE_SCREENSHOT',
  SESSION_STATUS_UPDATE = 'SESSION_STATUS_UPDATE'
}

/**
 * Represents a recorded user action during a session.
 */
export interface Action {
  id: string;
  timestamp: number;
  type: 'click' | 'input' | 'navigation' | 'assertion';
  selector?: string;
  value?: string;
  url?: string;
}

/**
 * Represents a logged bug during a session.
 */
export interface Bug {
  id: string;
  sessionId: string;
  timestamp: number;
  priority: BugPriority;
  title: string;
  description: string;
  screenshotUrl?: string;
  actionId?: string; // Links to the specific action where the bug occurred
}

/**
 * Represents a logged feature request during a session.
 */
export interface Feature {
  id: string;
  sessionId: string;
  timestamp: number;
  type: FeatureType;
  title: string;
  description: string;
  screenshotUrl?: string;
  actionId?: string; // Links to the specific action where the feature was requested
}

/**
 * Represents a complete recording session.
 */
export interface Session {
  id: string; // Format: ats-YYYY-MM-DD-NNN
  status: SessionStatus;
  startTime: number;
  endTime?: number;
  duration?: number;
  url: string; // Starting URL
  actions: Action[];
  bugs: Bug[];
  features: Feature[];
}

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
  CREATE_SESSION = 'CREATE_SESSION',
  START_RECORDING = 'START_RECORDING',
  STOP_RECORDING = 'STOP_RECORDING',
  PAUSE_RECORDING = 'PAUSE_RECORDING',
  RESUME_RECORDING = 'RESUME_RECORDING',
  RECORDING_CHUNK = 'RECORDING_CHUNK',
  ACTION_RECORDED = 'ACTION_RECORDED',
  LOG_BUG = 'LOG_BUG',
  LOG_FEATURE = 'LOG_FEATURE',
  CAPTURE_SCREENSHOT = 'CAPTURE_SCREENSHOT',
  SESSION_STATUS_UPDATE = 'SESSION_STATUS_UPDATE',
  GET_SESSION_STATUS = 'GET_SESSION_STATUS',
  ANNOTATE_ACTION = 'ANNOTATE_ACTION',  // R022: Attach a note to the last recorded action
  LOG_INSPECTOR_ELEMENT = 'LOG_INSPECTOR_ELEMENT',  // R023: Log element captured by inspector
  OPEN_SIDE_PANEL = 'OPEN_SIDE_PANEL',  // Request background to open/focus the side panel
}

/**
 * Represents a recorded user action during a session.
 */
export interface Action {
  id: string;
  sessionId: string;
  timestamp: number;
  type: 'click' | 'input' | 'navigation' | 'scroll';
  pageUrl: string;
  selector?: string;
  selectorStrategy?: 'data-testid' | 'aria-label' | 'id' | 'css' | 'playwright';
  selectorConfidence?: 'high' | 'medium' | 'low';
  value?: string;
  note?: string; // R022: Optional annotation
}

/**
 * Represents a logged bug during a session.
 */
export interface Bug {
  id: string;               // bug-XXXXXXXX
  sessionId: string;
  type: 'bug';
  priority: BugPriority;
  status: 'open' | 'in_progress' | 'resolved' | 'wontfix'; // R026
  title: string;
  description: string;
  url: string;
  elementSelector?: string;
  screenshotId?: string;
  timestamp: number;
}

/**
 * Represents a logged feature request during a session.
 */
export interface Feature {
  id: string;               // feat-XXXXXXXX
  sessionId: string;
  type: 'feature';
  featureType: FeatureType;
  status: 'open' | 'planned' | 'in_sprint' | 'done'; // R027
  sprintRef?: string; // R027: E.g., 'Sprint 04'
  title: string;
  description: string;
  url: string;
  elementSelector?: string;
  screenshotId?: string;
  timestamp: number;
}

/**
 * Represents a complete recording session.
 */
export interface Session {
  id: string;               // ats-YYYY-MM-DD-NNN
  name: string;
  description: string;
  status: SessionStatus;
  project?: string;         // R025: Project association
  outputPath?: string;      // R025: Local filesystem export destination
  tags: string[];           // R020: Session tags
  startedAt: number;        // Unix ms
  stoppedAt?: number;
  duration: number;         // ms (excludes paused time)
  pages: string[];          // distinct URLs visited
  actionCount: number;
  bugCount: number;
  featureCount: number;
  screenshotCount: number;
  recordMouseMove: boolean;  // Mouse Tracking Preference: if false, rrweb skips mousemove events
}

/**
 * Configuration schema for an AI-native Refine project.
 */
export interface RefineProjectConfig {
  name: string;
  displayName: string;
  baseUrl: string;
  outputPath: string;
  description?: string;
  created: string;
  version: string;
}

/**
 * A chunk of rrweb events from one page load within a session.
 */
export interface RecordingChunk {
  id?: number;              // auto-increment (Dexie)
  sessionId: string;
  chunkIndex: number;
  pageUrl: string;
  events: unknown[];        // rrweb serialized events
  createdAt: number;
  compressed?: boolean;     // R015: True if events array is empty and data contains gzip base64
  data?: string;            // R015: Compressed events
}

/**
 * An element captured by the inspector tool during a session.
 */
export interface InspectedElement {
  id: string;               // insp-XXXXXXXX
  sessionId: string;
  selector: string;
  url: string;
  tagName: string;
  timestamp: number;
}

/**
 * A screenshot captured during a session.
 */
export interface Screenshot {
  id: string;               // ss-XXXXXXXX
  sessionId: string;
  dataUrl: string;          // base64 data URL (JPEG 80%)
  url: string;              // page URL when captured
  timestamp: number;
  width: number;
  height: number;
}

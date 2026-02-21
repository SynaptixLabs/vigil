/**
 * Unit tests for src/content/action-extractor.ts
 */

import { describe, it, expect } from 'vitest';
import {
  extractActionsFromEvents,
  createNavigationAction,
} from '@content/action-extractor';

const SESSION_ID = 'ats-2026-02-22-001';
const PAGE_URL = 'http://localhost:38470';

function makeClickEvent(nodeId: number, timestamp = 1000) {
  return {
    type: 3,            // INCREMENTAL_SNAPSHOT
    timestamp,
    data: {
      source: 2,        // MOUSE_INTERACTION
      type: 2,          // CLICK
      id: nodeId,
    },
  };
}

function makeInputEvent(nodeId: number, text: string, timestamp = 2000) {
  return {
    type: 3,
    timestamp,
    data: {
      source: 5,        // INPUT
      id: nodeId,
      text,
    },
  };
}

function makeScrollEvent(timestamp = 3000) {
  return {
    type: 3,
    timestamp,
    data: { source: 3, x: 0, y: 400 },
  };
}

describe('extractActionsFromEvents', () => {
  it('extracts click action when element is in nodeMap', () => {
    const el = document.createElement('button');
    el.setAttribute('data-testid', 'submit-btn');
    const nodeMap = new Map([[42, el]]);

    const actions = extractActionsFromEvents(
      [makeClickEvent(42)],
      SESSION_ID,
      PAGE_URL,
      nodeMap
    );

    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('click');
    expect(actions[0].selector).toBe('[data-testid="submit-btn"]');
    expect(actions[0].selectorConfidence).toBe('high');
  });

  it('skips click action when element not in nodeMap', () => {
    const actions = extractActionsFromEvents(
      [makeClickEvent(99)],
      SESSION_ID,
      PAGE_URL,
      new Map()
    );
    expect(actions).toHaveLength(0);
  });

  it('extracts input action with value', () => {
    const el = document.createElement('input');
    el.setAttribute('data-testid', 'username');
    const nodeMap = new Map([[7, el]]);

    const actions = extractActionsFromEvents(
      [makeInputEvent(7, 'alice@example.com')],
      SESSION_ID,
      PAGE_URL,
      nodeMap
    );

    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('input');
    expect(actions[0].value).toBe('alice@example.com');
  });

  it('extracts scroll action without element lookup', () => {
    const actions = extractActionsFromEvents(
      [makeScrollEvent()],
      SESSION_ID,
      PAGE_URL,
      new Map()
    );
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('scroll');
  });

  it('ignores non-incremental-snapshot events', () => {
    const fullSnapshot = { type: 2, timestamp: 500, data: {} };
    const actions = extractActionsFromEvents(
      [fullSnapshot],
      SESSION_ID,
      PAGE_URL,
      new Map()
    );
    expect(actions).toHaveLength(0);
  });

  it('includes sessionId and pageUrl in extracted actions', () => {
    const el = document.createElement('a');
    const nodeMap = new Map([[1, el]]);
    const actions = extractActionsFromEvents(
      [makeClickEvent(1)],
      SESSION_ID,
      PAGE_URL,
      nodeMap
    );
    expect(actions[0].sessionId).toBe(SESSION_ID);
    expect(actions[0].pageUrl).toBe(PAGE_URL);
  });
});

describe('createNavigationAction', () => {
  it('creates navigation action with correct fields', () => {
    const action = createNavigationAction(
      SESSION_ID,
      'http://localhost:38470/',
      'http://localhost:38470/about',
      9000
    );

    expect(action.type).toBe('navigation');
    expect(action.sessionId).toBe(SESSION_ID);
    expect(action.pageUrl).toBe('http://localhost:38470/');
    expect(action.value).toBe('http://localhost:38470/about');
    expect(action.timestamp).toBe(9000);
    expect(action.id).toMatch(/^act-/);
  });
});

/**
 * @file action-extractor.ts
 * @description Extracts high-level user actions from rrweb events.
 * Processes click, input, and navigation events into typed Action objects.
 */

import type { Action } from '@shared/types';
import { getBestSelector } from './selector-engine';

// rrweb event type constants (avoiding direct rrweb type import for bundle isolation)
const INCREMENTAL_SNAPSHOT = 3;
const SOURCE_MOUSE_INTERACTION = 2;
const SOURCE_INPUT = 5;
const SOURCE_SCROLL = 3;
const MOUSE_CLICK = 2;

interface RrwebEvent {
  type: number;
  timestamp: number;
  data: {
    source?: number;
    type?: number;
    id?: number;
    text?: string;
    isChecked?: boolean;
    x?: number;
    y?: number;
    positions?: unknown[];
  };
}

export function extractActionsFromEvents(
  events: RrwebEvent[],
  sessionId: string,
  pageUrl: string,
  nodeMap: Map<number, Element>
): Action[] {
  const actions: Action[] = [];

  for (const event of events) {
    if (event.type !== INCREMENTAL_SNAPSHOT) continue;

    const { source, type: interactionType, id, text, isChecked } = event.data;

    if (source === SOURCE_MOUSE_INTERACTION && interactionType === MOUSE_CLICK && id) {
      const element = nodeMap.get(id);
      if (element) {
        const { selector, strategy, confidence } = getBestSelector(element);
        actions.push({
          id: `act-${crypto.randomUUID().split('-')[0]}`,
          sessionId,
          timestamp: event.timestamp,
          type: 'click',
          pageUrl,
          selector,
          selectorStrategy: strategy,
          selectorConfidence: confidence,
        });
      }
    }

    if (source === SOURCE_INPUT && id) {
      const element = nodeMap.get(id);
      if (element) {
        const { selector, strategy, confidence } = getBestSelector(element);
        actions.push({
          id: `act-${crypto.randomUUID().split('-')[0]}`,
          sessionId,
          timestamp: event.timestamp,
          type: 'input',
          pageUrl,
          selector,
          selectorStrategy: strategy,
          selectorConfidence: confidence,
          value: isChecked !== undefined ? String(isChecked) : (text ?? ''),
        });
      }
    }

    if (source === SOURCE_SCROLL) {
      actions.push({
        id: `act-${crypto.randomUUID().split('-')[0]}`,
        sessionId,
        timestamp: event.timestamp,
        type: 'scroll',
        pageUrl,
      });
    }
  }

  return actions;
}

export function createNavigationAction(
  sessionId: string,
  fromUrl: string,
  toUrl: string,
  timestamp: number
): Action {
  return {
    id: `act-${crypto.randomUUID().split('-')[0]}`,
    sessionId,
    timestamp,
    type: 'navigation',
    pageUrl: fromUrl,
    value: toUrl,
  };
}

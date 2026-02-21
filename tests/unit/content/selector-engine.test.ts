/**
 * Unit tests for src/content/selector-engine.ts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { getBestSelector } from '@content/selector-engine';

function createElement(
  tag: string,
  attrs: Record<string, string> = {},
  parent?: HTMLElement
): HTMLElement {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
  if (parent) parent.appendChild(el);
  return el;
}

let container: HTMLElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

describe('getBestSelector', () => {
  it('prefers data-testid — high confidence', () => {
    const el = createElement('button', { 'data-testid': 'submit-btn' }, container);
    const result = getBestSelector(el);
    expect(result.selector).toBe('[data-testid="submit-btn"]');
    expect(result.strategy).toBe('data-testid');
    expect(result.confidence).toBe('high');
  });

  it('falls back to aria-label when no data-testid — medium confidence', () => {
    const el = createElement('button', { 'aria-label': 'Close dialog' }, container);
    const result = getBestSelector(el);
    expect(result.selector).toContain('aria-label');
    expect(result.strategy).toBe('aria-label');
    expect(result.confidence).toBe('medium');
  });

  it('falls back to id when no data-testid or aria-label — high confidence', () => {
    const el = createElement('input', { id: 'email-input' }, container);
    const result = getBestSelector(el);
    expect(result.selector).toBe('#email-input');
    expect(result.strategy).toBe('id');
    expect(result.confidence).toBe('high');
  });

  it('builds CSS fallback when no testid/aria/id — low confidence', () => {
    const el = createElement('button', { class: 'btn btn-primary' }, container);
    const result = getBestSelector(el);
    expect(result.strategy).toBe('css');
    expect(result.confidence).toBe('low');
    expect(result.selector).toContain('button');
  });

  it('data-testid takes priority over id', () => {
    const el = createElement('input', { 'data-testid': 'qty', id: 'input-qty' }, container);
    const result = getBestSelector(el);
    expect(result.strategy).toBe('data-testid');
    expect(result.selector).toBe('[data-testid="qty"]');
  });

  it('aria-label takes priority over id', () => {
    const el = createElement('button', { 'aria-label': 'Open menu', id: 'menu-btn' }, container);
    const result = getBestSelector(el);
    expect(result.strategy).toBe('aria-label');
  });
});

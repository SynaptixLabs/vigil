// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { getSprintDir, getProjectRoot } from '../../../packages/server/src/config.js';

describe('getSprintDir (HappySeniors F3 hardening)', () => {
  it('resolves a plain sprint label inside docs/sprints', () => {
    expect(getSprintDir('19')).toBe(resolve(getProjectRoot(), 'docs', 'sprints', 'sprint_19'));
  });

  it('refuses labels that are not one safe segment', () => {
    for (const bad of ['../../etc', '19/../../x', '19\\..\\x', '', 'a'.repeat(33), '19 ']) {
      expect(() => getSprintDir(bad)).toThrow(/Invalid sprint/);
    }
  });
});

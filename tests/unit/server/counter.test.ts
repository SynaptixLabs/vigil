// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

// Mock config to use a temp directory
const TEST_VIGIL_DIR = resolve(import.meta.dirname, '..', '..', '..', '.vigil-test');

vi.mock('../../../packages/server/src/config.js', () => ({
  getVigilDataDir: () => TEST_VIGIL_DIR,
}));

const { nextBugId, nextFeatId, currentBugCount } = await import(
  '../../../packages/server/src/filesystem/counter.js'
);

describe('counter', () => {
  beforeEach(async () => {
    await mkdir(TEST_VIGIL_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_VIGIL_DIR, { recursive: true, force: true });
  });

  it('nextBugId returns BUG-001 on first call', async () => {
    const id = await nextBugId();
    expect(id).toBe('BUG-001');
  });

  it('nextBugId increments sequentially', async () => {
    const id1 = await nextBugId();
    const id2 = await nextBugId();
    const id3 = await nextBugId();
    expect(id1).toBe('BUG-001');
    expect(id2).toBe('BUG-002');
    expect(id3).toBe('BUG-003');
  });

  it('nextFeatId returns FEAT-001 on first call', async () => {
    const id = await nextFeatId();
    expect(id).toBe('FEAT-001');
  });

  it('nextFeatId increments independently from bugs', async () => {
    await nextBugId();
    await nextBugId();
    const featId = await nextFeatId();
    expect(featId).toBe('FEAT-001');
  });

  it('currentBugCount returns 0 when no counter file', async () => {
    const count = await currentBugCount();
    expect(count).toBe(0);
  });

  it('currentBugCount returns current value after increments', async () => {
    await nextBugId();
    await nextBugId();
    const count = await currentBugCount();
    expect(count).toBe(2);
  });

  it('pads IDs to 3 digits', async () => {
    // Write counter to 99
    await writeFile(resolve(TEST_VIGIL_DIR, 'bugs.counter'), '99', 'utf8');
    const id = await nextBugId();
    expect(id).toBe('BUG-100');
  });
});

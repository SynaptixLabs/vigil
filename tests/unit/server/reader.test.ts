// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const TEST_ROOT = resolve(import.meta.dirname, '..', '..', '..', '.vigil-reader-test');
const TEST_SPRINT_DIR = resolve(TEST_ROOT, 'docs', 'sprints', 'sprint_06');

vi.mock('../../../packages/server/src/config.js', () => ({
  loadConfig: () => ({
    projectId: 'test',
    sprintCurrent: '06',
    serverPort: 7474,
    maxFixIterations: 3,
    llmMode: 'mock',
    agentsApiUrl: 'http://localhost:8000',
  }),
  getProjectRoot: () => TEST_ROOT,
  getSprintDir: (sprint?: string) => {
    const s = sprint ?? '06';
    return resolve(TEST_ROOT, 'docs', 'sprints', `sprint_${s}`);
  },
}));

const { listBugs, getBug, listFeatures, getFeature } = await import(
  '../../../packages/server/src/filesystem/reader.js'
);

const BUG_CONTENT = `# BUG-001 — Save button broken

## Status: OPEN
## Severity: P1
## Sprint: 06
## Discovered: 2026-02-26 via vigil-session: test-001

## Steps to Reproduce
Click save on settings page

## Expected
Form should save

## Actual
Nothing happens

## URL
http://localhost:3000/settings

## Regression Test
File: tests/e2e/regression/BUG-001.spec.ts
Status: ⬜
`;

const FEAT_CONTENT = `# FEAT-001 — Dark mode toggle

## Status: OPEN
## Priority: UX_IMPROVEMENT
## Sprint: 06
## Discovered: 2026-02-26 via vigil-session: test-001

## Description
Add a dark mode option

## URL
http://localhost:3000/settings
`;

describe('reader', () => {
  beforeEach(async () => {
    const bugsOpen = resolve(TEST_SPRINT_DIR, 'BUGS', 'open');
    const bugsFixed = resolve(TEST_SPRINT_DIR, 'BUGS', 'fixed');
    const featsOpen = resolve(TEST_SPRINT_DIR, 'FEATURES', 'open');
    await mkdir(bugsOpen, { recursive: true });
    await mkdir(bugsFixed, { recursive: true });
    await mkdir(featsOpen, { recursive: true });

    await writeFile(resolve(bugsOpen, 'BUG-001.md'), BUG_CONTENT, 'utf8');
    await writeFile(resolve(featsOpen, 'FEAT-001.md'), FEAT_CONTENT, 'utf8');
  });

  afterEach(async () => {
    await rm(TEST_ROOT, { recursive: true, force: true });
  });

  describe('listBugs', () => {
    it('returns all bugs when no status filter', async () => {
      const bugs = await listBugs('06');
      expect(bugs).toHaveLength(1);
      expect(bugs[0].id).toBe('BUG-001');
      expect(bugs[0].title).toBe('Save button broken');
      expect(bugs[0].severity).toBe('P1');
      expect(bugs[0].status).toBe('OPEN');
    });

    it('filters by status', async () => {
      const open = await listBugs('06', 'open');
      expect(open).toHaveLength(1);

      const fixed = await listBugs('06', 'fixed');
      expect(fixed).toHaveLength(0);
    });

    it('returns empty array for nonexistent sprint', async () => {
      const bugs = await listBugs('99');
      expect(bugs).toHaveLength(0);
    });
  });

  describe('getBug', () => {
    it('returns parsed bug by ID', async () => {
      const bug = await getBug('BUG-001', '06');
      expect(bug).not.toBeNull();
      expect(bug!.id).toBe('BUG-001');
      expect(bug!.title).toBe('Save button broken');
      expect(bug!.severity).toBe('P1');
      expect(bug!.sprint).toBe('06');
      expect(bug!.stepsToReproduce).toBe('Click save on settings page');
      expect(bug!.expected).toBe('Form should save');
      expect(bug!.actual).toBe('Nothing happens');
      expect(bug!.regressionTest).toContain('BUG-001.spec.ts');
    });

    it('returns null for nonexistent bug', async () => {
      const bug = await getBug('BUG-999', '06');
      expect(bug).toBeNull();
    });

    it('includes raw content', async () => {
      const bug = await getBug('BUG-001', '06');
      expect(bug!.raw).toContain('# BUG-001');
    });
  });

  describe('listFeatures', () => {
    it('returns all features', async () => {
      const features = await listFeatures('06');
      expect(features).toHaveLength(1);
      expect(features[0].id).toBe('FEAT-001');
      expect(features[0].title).toBe('Dark mode toggle');
      expect(features[0].priority).toBe('UX_IMPROVEMENT');
    });

    it('filters by status', async () => {
      const open = await listFeatures('06', 'open');
      expect(open).toHaveLength(1);

      const done = await listFeatures('06', 'done');
      expect(done).toHaveLength(0);
    });
  });

  describe('getFeature', () => {
    it('returns parsed feature by ID', async () => {
      const feat = await getFeature('FEAT-001', '06');
      expect(feat).not.toBeNull();
      expect(feat!.id).toBe('FEAT-001');
      expect(feat!.title).toBe('Dark mode toggle');
      expect(feat!.description).toBe('Add a dark mode option');
    });

    it('returns null for nonexistent feature', async () => {
      const feat = await getFeature('FEAT-999', '06');
      expect(feat).toBeNull();
    });
  });
});

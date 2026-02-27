// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdir, readFile, rm, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const TEST_ROOT = resolve(import.meta.dirname, '..', '..', '..', '.vigil-writer-test');
const TEST_VIGIL_DIR = resolve(TEST_ROOT, '.vigil');
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
  getVigilDataDir: () => TEST_VIGIL_DIR,
  getSprintDir: (sprint?: string) => {
    const s = sprint ?? '06';
    return resolve(TEST_ROOT, 'docs', 'sprints', `sprint_${s}`);
  },
}));

const { writeBug, writeFeature, writeSessionJson, updateBug, closeBug } = await import(
  '../../../packages/server/src/filesystem/writer.js'
);

const makeBug = (overrides = {}) => ({
  id: 'temp-1',
  sessionId: 'vigil-SESSION-TEST-001',
  type: 'bug' as const,
  priority: 'P1' as const,
  status: 'open' as const,
  title: 'Test bug title',
  description: 'Steps to reproduce the bug',
  url: 'http://localhost:3000/page',
  timestamp: 1740000000000,
  ...overrides,
});

const makeFeat = (overrides = {}) => ({
  id: 'temp-1',
  sessionId: 'vigil-SESSION-TEST-001',
  type: 'feature' as const,
  featureType: 'ENHANCEMENT' as const,
  status: 'open' as const,
  title: 'Test feature title',
  description: 'Feature description',
  url: 'http://localhost:3000/page',
  timestamp: 1740000000000,
  ...overrides,
});

describe('writer', () => {
  beforeEach(async () => {
    await mkdir(TEST_VIGIL_DIR, { recursive: true });
    await mkdir(TEST_SPRINT_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_ROOT, { recursive: true, force: true });
  });

  describe('writeBug', () => {
    it('creates BUG-001.md in BUGS/open/', async () => {
      const bugId = await writeBug(makeBug(), '06');
      expect(bugId).toBe('BUG-001');

      const filePath = resolve(TEST_SPRINT_DIR, 'BUGS', 'open', 'BUG-001.md');
      const content = await readFile(filePath, 'utf8');
      expect(content).toContain('# BUG-001 — Test bug title');
      expect(content).toContain('## Severity: P1');
      expect(content).toContain('## Sprint: 06');
      expect(content).toContain('vigil-session: vigil-SESSION-TEST-001');
    });

    it('writes actual sprint number, not "current"', async () => {
      const bugId = await writeBug(makeBug(), '06');
      const filePath = resolve(TEST_SPRINT_DIR, 'BUGS', 'open', `${bugId}.md`);
      const content = await readFile(filePath, 'utf8');
      expect(content).toContain('## Sprint: 06');
      expect(content).not.toContain('Sprint: current');
    });

    it('uses config sprint when none provided', async () => {
      const bugId = await writeBug(makeBug());
      expect(bugId).toMatch(/^BUG-\d{3}$/);
      const filePath = resolve(TEST_SPRINT_DIR, 'BUGS', 'open', `${bugId}.md`);
      const content = await readFile(filePath, 'utf8');
      expect(content).toContain('## Sprint: 06');
    });

    it('includes regression test section', async () => {
      const bugId = await writeBug(makeBug(), '06');
      const filePath = resolve(TEST_SPRINT_DIR, 'BUGS', 'open', `${bugId}.md`);
      const content = await readFile(filePath, 'utf8');
      expect(content).toContain(`File: tests/e2e/regression/${bugId}.spec.ts`);
      expect(content).toContain('Status: ⬜');
    });
  });

  describe('writeFeature', () => {
    it('creates FEAT-001.md in FEATURES/open/', async () => {
      const featId = await writeFeature(makeFeat(), '06');
      expect(featId).toBe('FEAT-001');

      const filePath = resolve(TEST_SPRINT_DIR, 'FEATURES', 'open', 'FEAT-001.md');
      const content = await readFile(filePath, 'utf8');
      expect(content).toContain('# FEAT-001 — Test feature title');
      expect(content).toContain('## Sprint: 06');
    });
  });

  describe('writeSessionJson', () => {
    it('writes session JSON to .vigil/sessions/', async () => {
      const session = {
        id: 'vigil-SESSION-TEST-001',
        name: 'Test',
        projectId: 'test',
        startedAt: 1740000000000,
        clock: 60000,
        recordings: [],
        snapshots: [],
        bugs: [],
        features: [],
      };
      const path = await writeSessionJson(session as any);
      expect(path).toContain('vigil-SESSION-TEST-001.json');
      const content = JSON.parse(await readFile(path, 'utf8'));
      expect(content.id).toBe('vigil-SESSION-TEST-001');
    });
  });

  describe('updateBug', () => {
    it('updates status in an existing bug file', async () => {
      const bugId = await writeBug(makeBug(), '06');
      const updated = await updateBug(bugId, { status: 'resolved' }, '06');
      expect(updated).toBe(true);

      const filePath = resolve(TEST_SPRINT_DIR, 'BUGS', 'open', `${bugId}.md`);
      const content = await readFile(filePath, 'utf8');
      expect(content).toContain('## Status: RESOLVED');
    });

    it('updates severity', async () => {
      const bugId = await writeBug(makeBug(), '06');
      const updated = await updateBug(bugId, { severity: 'P0' }, '06');
      expect(updated).toBe(true);

      const filePath = resolve(TEST_SPRINT_DIR, 'BUGS', 'open', `${bugId}.md`);
      const content = await readFile(filePath, 'utf8');
      expect(content).toContain('## Severity: P0');
    });

    it('adds resolution section', async () => {
      const bugId = await writeBug(makeBug(), '06');
      const updated = await updateBug(bugId, { resolution: 'Fixed the handler' }, '06');
      expect(updated).toBe(true);

      const filePath = resolve(TEST_SPRINT_DIR, 'BUGS', 'open', `${bugId}.md`);
      const content = await readFile(filePath, 'utf8');
      expect(content).toContain('## Resolution\nFixed the handler');
    });

    it('returns false for nonexistent bug', async () => {
      const updated = await updateBug('BUG-999', { status: 'resolved' }, '06');
      expect(updated).toBe(false);
    });
  });

  describe('closeBug', () => {
    it('moves bug from open/ to fixed/', async () => {
      const bugId = await writeBug(makeBug(), '06');
      const closed = await closeBug(bugId, 'Fixed the root cause', true, '06');
      expect(closed).toBe(true);

      // Should be in fixed/
      const fixedPath = resolve(TEST_SPRINT_DIR, 'BUGS', 'fixed', `${bugId}.md`);
      const content = await readFile(fixedPath, 'utf8');
      expect(content).toContain('## Status: FIXED');
      expect(content).toContain('## Resolution\nFixed the root cause');
      expect(content).toContain('Status: 🟢');

      // Should not be in open/
      const openDir = resolve(TEST_SPRINT_DIR, 'BUGS', 'open');
      const openFiles = await readdir(openDir).catch(() => []);
      expect(openFiles).not.toContain(`${bugId}.md`);
    });

    it('marks test as archived when keepTest is false', async () => {
      const bugId = await writeBug(makeBug(), '06');
      await closeBug(bugId, 'Not a real bug', false, '06');

      const fixedPath = resolve(TEST_SPRINT_DIR, 'BUGS', 'fixed', `${bugId}.md`);
      const content = await readFile(fixedPath, 'utf8');
      expect(content).toContain('Status: ⬜ (archived)');
    });

    it('returns false for nonexistent bug', async () => {
      const closed = await closeBug('BUG-999', 'Fixed', true, '06');
      expect(closed).toBe(false);
    });
  });
});

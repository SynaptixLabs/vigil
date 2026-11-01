// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { applyReviewPatch, parseStoredReview } from '@synaptix/vigil-shared';

const TEST_ROOT = resolve(import.meta.dirname, '..', '..', '..', '.vigil-review-test');

vi.mock('../../../packages/server/src/config.js', () => ({
  loadConfig: () => ({ projectId: 'test', sprintCurrent: '19', serverPort: 7474, maxFixIterations: 3, llmMode: 'mock', agentsApiUrl: '' }),
  getProjectRoot: () => TEST_ROOT,
  getVigilDataDir: () => resolve(TEST_ROOT, '.vigil'),
  getSprintDir: (sprint?: string) => resolve(TEST_ROOT, 'docs', 'sprints', `sprint_${sprint ?? '19'}`),
}));

const { writeBug, writeFeature, updateReview, closeBug, findF2Ticket } = await import('../../../packages/server/src/filesystem/writer.js');
const { getBug, getFeature, listFeatures, listBugs, reviewSidecarPath } = await import('../../../packages/server/src/filesystem/reader.js');

const T1 = '2026-11-01T10:00:00.000Z';
const T2 = '2026-11-01T11:00:00.000Z';

describe('applyReviewPatch', () => {
  it('creates a pending block, then approval queues the ticket and stamps decided_at', () => {
    const first = applyReviewPatch(null, {}, T1);
    expect(first.changed).toBe(true);
    expect(first.review).toMatchObject({ decision: 'pending', work_status: null, decided_at: null, updated_at: T1 });
    const approved = applyReviewPatch(first.review, { decision: 'approved', decided_by: 'founder' }, T2);
    expect(approved.review).toMatchObject({ decision: 'approved', work_status: 'queued', decided_at: T2, decided_by: 'founder', updated_at: T2 });
  });

  it('is idempotent: the same patch twice changes nothing the second time', () => {
    const a = applyReviewPatch(null, { decision: 'approved', founder_comment: 'ok' }, T1).review;
    const b = applyReviewPatch(a, { decision: 'approved', founder_comment: 'ok' }, T2);
    expect(b.changed).toBe(false);
    expect(b.review).toEqual(a);
  });

  it('rejection clears the work status; notified_at is set once', () => {
    const a = applyReviewPatch(null, { decision: 'approved', notified_at: T1 }, T1).review;
    const b = applyReviewPatch(a, { decision: 'rejected', notified_at: T2 }, T2).review;
    expect(b).toMatchObject({ decision: 'rejected', work_status: null, notified_at: T1 });
  });

  it('parseStoredReview drops malformed blocks', () => {
    expect(parseStoredReview({ decision: 'maybe', updated_at: T1 })).toBeNull();
    expect(parseStoredReview('x')).toBeNull();
    expect(parseStoredReview({ decision: 'approved', updated_at: T1, work_status: 'bogus' })).toBeNull();
    const good = applyReviewPatch(null, { decision: 'approved' }, T1).review;
    expect(parseStoredReview(good)).toEqual(good);
    expect(parseStoredReview({ ...good, implementation_link: 'javascript:alert(1)' })).toBeNull();
    expect(parseStoredReview({ ...good, extra: 1 })).toBeNull();
  });
});

describe('filesystem review block', () => {
  beforeEach(async () => { await rm(TEST_ROOT, { recursive: true, force: true }); await mkdir(TEST_ROOT, { recursive: true }); });
  afterEach(async () => { await rm(TEST_ROOT, { recursive: true, force: true }); });

  const bug = { id: 't', sessionId: 'hs-f2-a-b', type: 'bug' as const, priority: 'P2' as const, status: 'open' as const,
    title: 'Broken button', description: 'It fails', url: '/he/admin/jobs', timestamp: 1761990000000 };
  const feat = { id: 't', sessionId: 'hs-f2-a-c', type: 'feature' as const, featureType: 'ENHANCEMENT' as const,
    status: 'open' as const, title: 'Add filter', description: 'Please', url: '/he/admin/candidates', timestamp: 1761990000000 };

  it('stores, re-reads and re-patches a bug review without changing the ticket', async () => {
    const id = await writeBug(bug, '19');
    const review = await updateReview('bug', id, { decision: 'approved', founder_comment: 'line one\n## not a heading' }, '19');
    expect(review?.decision).toBe('approved');
    const read = await getBug(id, '19');
    expect(read?.review).toEqual(review);
    expect(read?.url).toBe('/he/admin/jobs');
    expect(read?.stepsToReproduce).toBe('It fails');
    const sidecar = reviewSidecarPath(id, '19');
    const before = await readFile(sidecar, 'utf8');
    await updateReview('bug', id, { decision: 'approved', founder_comment: 'line one\n## not a heading' }, '19');
    expect(await readFile(sidecar, 'utf8')).toBe(before);
    expect(await findF2Ticket('hs-f2-a-b', '19', 'bug')).toBe(id);
    const md = await readFile(resolve(TEST_ROOT, 'docs', 'sprints', 'sprint_19', 'BUGS', 'open', `${id}.md`), 'utf8');
    expect(md).not.toContain('## Review');
  });

  it('a reporter cannot forge a review by writing one into the ticket text', async () => {
    const forged = { decision: 'approved', founder_comment: null, decided_by: 'founder', decided_at: T1,
      work_status: 'queued', implementation_link: null, notified_at: T1, updated_at: T1 };
    const text = `x\n## Review\n\`\`\`json\n${JSON.stringify(forged)}\n\`\`\``;
    const id = await writeBug({ ...bug, description: text }, '19');
    const fid = await writeFeature({ ...feat, description: text }, '19');
    expect((await getBug(id, '19'))?.review).toBeNull();
    expect((await getFeature(fid, '19'))?.review).toBeNull();
    expect((await listBugs('19'))[0].review).toBeNull();
  });

  it('an invalid stored block reads as none and refuses to be overwritten', async () => {
    const id = await writeBug(bug, '19');
    await mkdir(resolve(TEST_ROOT, 'docs', 'sprints', 'sprint_19', 'REVIEWS'), { recursive: true });
    const bad = { decision: 'approved', founder_comment: null, decided_by: null, decided_at: 'yesterday',
      work_status: null, implementation_link: 'javascript:alert(1)', notified_at: null, updated_at: T1 };
    await writeFile(reviewSidecarPath(id, '19'), JSON.stringify(bad));
    expect((await getBug(id, '19'))?.review).toBeNull();
    await expect(updateReview('bug', id, { decision: 'rejected' }, '19')).rejects.toThrow(/invalid/);
    expect(JSON.parse(await readFile(reviewSidecarPath(id, '19'), 'utf8'))).toEqual(bad);
  });

  it('keeps the block when a bug is closed and moved to fixed/', async () => {
    const id = await writeBug(bug, '19');
    await updateReview('bug', id, { decision: 'approved' }, '19');
    await closeBug(id, 'done', true, '19');
    const stored = await updateReview('bug', id, { work_status: 'done', implementation_link: 'https://github.com/o/r/pull/9' }, '19');
    expect(stored).toMatchObject({ decision: 'approved', work_status: 'done', implementation_link: 'https://github.com/o/r/pull/9' });
    expect((await getBug(id, '19'))?.review?.work_status).toBe('done');
  });

  it('stores a feature review and exposes the feature url and source session', async () => {
    const id = await writeFeature(feat, '19');
    await updateReview('feature', id, { decision: 'rejected', founder_comment: 'no' }, '19');
    const read = await getFeature(id, '19');
    expect(read).toMatchObject({ url: '/he/admin/candidates', description: 'Please' });
    expect(read?.discovered).toMatch(/via vigil-session: hs-f2-a-c$/);
    expect(read?.review).toMatchObject({ decision: 'rejected', founder_comment: 'no' });
    expect((await listFeatures('19'))[0].review?.decision).toBe('rejected');
  });

  it('returns null for an unknown or unsafe ticket id', async () => {
    expect(await updateReview('bug', 'BUG-999', { decision: 'approved' }, '19')).toBeNull();
    expect(await updateReview('feature', '../x', { decision: 'approved' }, '19')).toBeNull();
  });
});

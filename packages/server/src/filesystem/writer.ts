import { writeFile, mkdir, readFile, unlink, readdir, rename } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { getSprintDir, getVigilDataDir, loadConfig } from '../config.js';
import { nextBugId, nextFeatId } from './counter.js';
import { TEST_STATUS } from '@synaptix/vigil-shared';
import { applyReviewPatch, parseStoredReviewForWrite } from '@synaptix/vigil-shared';
import type { Bug, Feature, VIGILSession, BugUpdate, TicketReview, TicketReviewPatch } from '@synaptix/vigil-shared';
import { readReviewSidecarRaw, reviewSidecarPath } from './reader.js';

/** Resolve sprint dir for bugs. Undefined → current sprint from config. */
function bugDir(sprint?: string, status: 'open' | 'fixed' = 'open'): string {
  return resolve(getSprintDir(sprint), 'BUGS', status);
}

/** Resolve sprint dir for features. Undefined → current sprint from config. */
function featDir(sprint?: string, status: 'open' | 'done' = 'open'): string {
  return resolve(getSprintDir(sprint), 'FEATURES', status);
}

/** Resolve the actual sprint label (e.g. "06") for writing into markdown. */
function resolveSprint(sprint?: string): string {
  return sprint ?? loadConfig().sprintCurrent;
}

function formatDate(ts: number): string {
  return new Date(ts).toISOString().split('T')[0];
}

function headingTitle(title: string): string {
  return title.replace(/\s+/g, ' ').trim();
}

/** One HappySeniors reporter session contains exactly one entity. Its source
 * session ID is already recorded in the existing markdown; find that receipt
 * before allocating another sequential ticket ID. */
export async function findF2Ticket(sessionId: string, sprint: string, kind: 'bug' | 'feature'): Promise<string | null> {
  if (!sessionId.startsWith('hs-f2-')) return null;
  const folders = kind === 'bug' ? [bugDir(sprint), bugDir(sprint, 'fixed')]
    : [featDir(sprint), featDir(sprint, 'done')];
  for (const folder of folders) {
    let names: string[];
    try { names = await readdir(folder); } catch { continue; }
    for (const name of names.filter(name => name.endsWith('.md'))) {
      const content = await readFile(resolve(folder, name), 'utf8');
      const lines = content.split('\n', 7);
      const discovered = lines[5]?.match(/^## Discovered: \d{4}-\d{2}-\d{2} via vigil-session: ([A-Za-z0-9-]+)$/);
      if (lines[0]?.startsWith(`# ${name.slice(0, -3)} — `) && lines[2]?.startsWith('## Status: ') &&
          lines[3]?.startsWith(kind === 'bug' ? '## Severity: ' : '## Priority: ') &&
          lines[4]?.startsWith('## Sprint: ') && discovered?.[1] === sessionId) {
        return name.slice(0, -3);
      }
    }
  }
  return null;
}

function bugToMarkdown(bugId: string, bug: Bug, sessionId: string, sprint: string): string {
  return `# ${bugId} — ${headingTitle(bug.title)}

## Status: OPEN
## Severity: ${bug.priority}
## Sprint: ${sprint}
## Discovered: ${formatDate(bug.timestamp)} via vigil-session: ${sessionId}

## Steps to Reproduce
${bug.description}

## Expected
_To be filled_

## Actual
_To be filled_

## URL
${bug.url}

## Regression Test
File: tests/e2e/regression/${bugId}.spec.ts
Status: ${TEST_STATUS.PENDING}
`;
}

function featureToMarkdown(featId: string, feat: Feature, sessionId: string, sprint: string): string {
  return `# ${featId} — ${headingTitle(feat.title)}

## Status: OPEN
## Priority: ${feat.featureType}
## Sprint: ${sprint}
## Discovered: ${formatDate(feat.timestamp)} via vigil-session: ${sessionId}

## Description
${feat.description}

## URL
${feat.url}
`;
}

export async function writeBug(bug: Bug, sprint?: string): Promise<string> {
  const s = resolveSprint(sprint);
  const existing = await findF2Ticket(bug.sessionId, s, 'bug');
  if (existing) return existing;
  const bugId = await nextBugId();
  const dir = bugDir(s);
  await mkdir(dir, { recursive: true });

  const filePath = resolve(dir, `${bugId}.md`);
  const content = bugToMarkdown(bugId, bug, bug.sessionId, s);
  await writeFile(filePath, content, 'utf8');

  return bugId;
}

export async function writeFeature(feat: Feature, sprint?: string): Promise<string> {
  const s = resolveSprint(sprint);
  const existing = await findF2Ticket(feat.sessionId, s, 'feature');
  if (existing) return existing;
  const featId = await nextFeatId();
  const dir = featDir(s);
  await mkdir(dir, { recursive: true });

  const filePath = resolve(dir, `${featId}.md`);
  const content = featureToMarkdown(featId, feat, feat.sessionId, s);
  await writeFile(filePath, content, 'utf8');

  return featId;
}

export async function writeSessionJson(session: VIGILSession): Promise<string> {
  const dir = resolve(getVigilDataDir(), 'sessions');
  await mkdir(dir, { recursive: true });

  const filePath = resolve(dir, `${session.id}.json`);
  await writeFile(filePath, JSON.stringify(session, null, 2), 'utf8');

  return filePath;
}

export async function updateBug(bugId: string, fields: BugUpdate, sprint?: string): Promise<boolean> {
  const openPath = resolve(bugDir(sprint), `${bugId}.md`);
  let filePath = openPath;
  let content: string;

  try {
    content = await readFile(filePath, 'utf8');
  } catch {
    // Try fixed directory
    const fixedPath = resolve(bugDir(sprint, 'fixed'), `${bugId}.md`);
    try {
      content = await readFile(fixedPath, 'utf8');
      filePath = fixedPath;
    } catch {
      return false;
    }
  }

  if (fields.status) {
    const status = fields.status.toUpperCase();
    content = content.replace(/## Status: \w+/, () => `## Status: ${status}`);
  }
  if (fields.severity) {
    const severity = fields.severity;
    content = content.replace(/## Severity: \w+/, () => `## Severity: ${severity}`);
  }
  if (fields.resolution) {
    if (content.includes('## Resolution')) {
      const resolutionText = fields.resolution;
      content = content.replace(/## Resolution\n[\s\S]*?(?=\n## |\n$|$)/, () => `## Resolution\n${resolutionText}\n`);
    } else {
      content += `\n## Resolution\n${fields.resolution}\n`;
    }
  }

  await writeFile(filePath, content, 'utf8');
  return true;
}

export async function closeBug(
  bugId: string,
  resolution: string,
  keepTest: boolean,
  sprint?: string,
): Promise<boolean> {
  const openPath = resolve(bugDir(sprint), `${bugId}.md`);
  let content: string;

  try {
    content = await readFile(openPath, 'utf8');
  } catch {
    return false;
  }

  // Update status and add resolution
  content = content.replace(/## Status: \w+/, '## Status: FIXED');

  if (content.includes('## Resolution')) {
    content = content.replace(/## Resolution\n[\s\S]*?(?=\n## |\n$|$)/, () => `## Resolution\n${resolution}\n`);
  } else {
    content += `\n## Resolution\n${resolution}\n`;
  }

  // Update regression test status — target only within Regression Test section
  content = content.replace(
    new RegExp(`(## Regression Test\\nFile: [^\\n]+\\nStatus: )${TEST_STATUS.PENDING.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
    `$1${keepTest ? TEST_STATUS.PASSING : TEST_STATUS.ARCHIVED}`,
  );

  // Move from open/ to fixed/
  const fixedDir = bugDir(sprint, 'fixed');
  await mkdir(fixedDir, { recursive: true });
  const fixedPath = resolve(fixedDir, `${bugId}.md`);

  await writeFile(fixedPath, content, 'utf8');

  // Remove from open/
  try {
    await unlink(openPath);
  } catch {
    // Already gone or never existed in open
  }

  return true;
}

// ── Founder review block (HappySeniors F3) ──────────────────────────────────

const reviewLocks = new Map<string, Promise<unknown>>();

/** Serialize read-modify-write per ticket inside this process. */
async function withReviewLock<T>(key: string, task: () => Promise<T>): Promise<T> {
  const previous = reviewLocks.get(key) ?? Promise.resolve();
  const run = previous.catch(() => undefined).then(task);
  reviewLocks.set(key, run);
  try { return await run; } finally { if (reviewLocks.get(key) === run) reviewLocks.delete(key); }
}

/** Apply a review patch to a bug (open/fixed) or feature (open/done) markdown file.
 * Returns the stored block, or null when the ticket is not in that sprint. */
export async function updateReview(
  kind: 'bug' | 'feature', id: string, patch: TicketReviewPatch, sprint?: string,
): Promise<TicketReview | null> {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) return null;
  const folders = kind === 'bug' ? [bugDir(sprint), bugDir(sprint, 'fixed')]
    : [featDir(sprint), featDir(sprint, 'done')];
  return withReviewLock(`${kind}:${id}`, async () => {
    let exists = false;
    for (const folder of folders) {
      try { await readFile(resolve(folder, `${id}.md`), 'utf8'); exists = true; break; } catch { continue; }
    }
    if (!exists) return null;
    const current = parseStoredReviewForWrite(await readReviewSidecarRaw(id, sprint));
    const { review, changed } = applyReviewPatch(current, patch, new Date().toISOString());
    if (changed) {
      const path = reviewSidecarPath(id, sprint);
      await mkdir(dirname(path), { recursive: true });
      const temp = `${path}.${process.pid}.tmp`;
      await writeFile(temp, JSON.stringify(review, null, 2), 'utf8');
      await rename(temp, path);
    }
    return review;
  });
}

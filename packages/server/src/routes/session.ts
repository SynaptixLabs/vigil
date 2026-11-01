import { Router } from 'express';
import { VIGILSessionSchema, normalizeSprint } from '@synaptix/vigil-shared';
import { loadConfig } from '../config.js';
import { getStorage } from '../storage/index.js';

export const sessionRouter = Router();

const f2Locks = new Map<string, Promise<void>>();

async function serializedF2<T>(id: string, task: () => Promise<T>): Promise<T> {
  const previous = f2Locks.get(id) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>(resolve => { release = resolve; });
  const tail = previous.then(() => current);
  f2Locks.set(id, tail);
  await previous;
  try { return await task(); }
  finally { release(); if (f2Locks.get(id) === tail) f2Locks.delete(id); }
}

function sameF2Submission(a: typeof VIGILSessionSchema._type, b: typeof VIGILSessionSchema._type): boolean {
  const entity = (session: typeof VIGILSessionSchema._type) =>
    session.bugs.length ? session.bugs[0] : session.features[0];
  const first = entity(a);
  const second = entity(b);
  return a.projectId === b.projectId && a.sprint === b.sprint &&
    a.bugs.length === b.bugs.length && a.features.length === b.features.length &&
    first?.id === second?.id && first?.type === second?.type &&
    first?.title === second?.title && first?.description === second?.description &&
    first?.url === second?.url && first?.screenshotId === second?.screenshotId &&
    (first?.type !== 'bug' || (second?.type === 'bug' &&
      first.priority === second.priority && first.status === second.status)) &&
    (first?.type !== 'feature' || (second?.type === 'feature' &&
      first.featureType === second.featureType && first.status === second.status)) &&
    a.snapshots.length === b.snapshots.length &&
    a.snapshots[0]?.screenshotDataUrl === b.snapshots[0]?.screenshotDataUrl &&
    JSON.stringify(a.annotations.map(item => item.rect)) === JSON.stringify(b.annotations.map(item => item.rect));
}

sessionRouter.get('/receipt/:id', async (req, res) => {
  const id = req.params.id;
  if (!/^hs-f2-[A-Za-z0-9-]{1,180}$/.test(id)) { res.status(404).json({ error: 'Not found' }); return; }
  try {
    const storage = getStorage();
    const session = await storage.getSession(id);
    const entity = session ? await storage.getSessionTicket(id) : null;
    if (!session || !entity) { res.status(404).json({ error: 'Not found' }); return; }
    res.json({ ...entity, sessionId: id, projectId: session.projectId, sprint: session.sprint ?? '' });
  } catch {
    res.status(503).json({ error: 'Receipt unavailable' });
  }
});

sessionRouter.post('/', async (req, res) => {
  // Validate session schema
  const result = VIGILSessionSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: 'Invalid session payload',
      details: result.error.issues,
    });
    return;
  }

  const session = result.data;
  const isF2 = session.id.startsWith('hs-f2-');
  if (isF2 && (session.bugs.length + session.features.length !== 1 ||
      session.recordings.length !== 0 || session.snapshots.length > 1 ||
      !/^hs-f2-[A-Za-z0-9-]{1,180}$/.test(session.id))) {
    res.status(400).json({ error: 'Invalid reporter session' });
    return;
  }
  const config = loadConfig();
  // Use session's own sprint (from extension) — fall back to server config only if absent
  // Normalize to bare number format (e.g. "sprint_10" → "10") for consistency
  const sprint = normalizeSprint(session.sprint ?? config.sprintCurrent);
  const storage = getStorage();

  const processSession = async () => {
    // Validate project exists (sessions can't be orphaned)
    const project = await storage.getProject(session.projectId);
    if (!project) {
      res.status(400).json({
        error: `Project '${session.projectId}' does not exist. Create it in the dashboard first.`,
      });
      return;
    }

    // F2 retries may follow a lost response or a partial normalized write.
    // Preserve the original snapshot and reject reuse of an ID for new content.
    const existing = isF2 ? await storage.getSession(session.id) : null;
    if (existing && !sameF2Submission(existing, session)) {
      res.status(409).json({ error: 'Reporter submission ID already used' });
      return;
    }
    if (!existing) await storage.writeSessionJson(session);

    // Write individual bug records (each in its own try/catch so
    // one failure doesn't prevent the rest from being written).
    const bugIds: string[] = [];
    const bugErrors: string[] = [];
    for (const bug of session.bugs) {
      try {
        const bugId = await storage.writeBug(bug, sprint);
        bugIds.push(bugId);
      } catch (bugErr) {
        const msg = bugErr instanceof Error ? bugErr.message : String(bugErr);
        console.error(`[vigil-server] writeBug failed for "${bug.title}" (session: ${session.id}, sprint: ${sprint}):`, msg);
        bugErrors.push(msg);
      }
    }

    // Write individual feature records
    const featIds: string[] = [];
    const featErrors: string[] = [];
    for (const feat of session.features) {
      try {
        const featId = await storage.writeFeature(feat, sprint);
        featIds.push(featId);
      } catch (featErr) {
        const msg = featErr instanceof Error ? featErr.message : String(featErr);
        console.error(`[vigil-server] writeFeature failed for "${feat.title}" (session: ${session.id}, sprint: ${sprint}):`, msg);
        featErrors.push(msg);
      }
    }

    const hasErrors = bugErrors.length > 0 || featErrors.length > 0;
    res.status(isF2 && hasErrors ? 503 : 201).json({
      sessionId: session.id,
      bugsWritten: bugIds.length,
      featuresWritten: featIds.length,
      bugIds,
      featIds,
      ...(hasErrors && {
        warnings: {
          bugErrors: bugErrors.length > 0 ? bugErrors : undefined,
          featErrors: featErrors.length > 0 ? featErrors : undefined,
        },
      }),
    });
  };
  try {
    if (isF2) await serializedF2(session.id, processSession);
    else await processSession();
  } catch (err) {
    console.error('[vigil-server] Error processing session:', err);
    res.status(500).json({ error: 'Failed to process session' });
  }
});

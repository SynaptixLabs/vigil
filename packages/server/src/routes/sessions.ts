import { Router } from 'express';
import { getStorage } from '../storage/index.js';
import type { VIGILSession } from '@synaptix/vigil-shared';

export const sessionsRouter = Router();

/** Map a VIGILSession to the summary shape expected by the dashboard. */
function toSummary(s: VIGILSession) {
  return {
    id: s.id,
    project: s.projectId,
    sprint: s.sprint ?? '',
    name: s.name,
    startedAt: s.startedAt,
    endedAt: s.endedAt,
    recordingCount: s.recordings.length,
    snapshotCount: s.snapshots.length,
    bugCount: s.bugs.length,
    featureCount: s.features.length,
    annotationCount: s.annotations.length,
    archivedAt: (s as VIGILSession & { archivedAt?: string | null }).archivedAt ?? null,
  };
}

/** Map a VIGILSession to the detail shape expected by the dashboard. */
function toDetail(s: VIGILSession) {
  return {
    id: s.id,
    project: s.projectId,
    sprint: s.sprint ?? '',
    description: s.description ?? '',
    name: s.name,
    startedAt: s.startedAt,
    endedAt: s.endedAt,
    clock: s.clock,
    recordings: s.recordings.map((r) => ({
      id: r.id,
      startedAt: r.startedAt,
      endedAt: r.endedAt,
      rrwebChunks: r.rrwebChunks,
      mouseTracking: r.mouseTracking,
    })),
    snapshots: s.snapshots.map((snap) => ({
      id: snap.id,
      capturedAt: snap.capturedAt,
      screenshotDataUrl: snap.screenshotDataUrl,
      url: snap.url,
      triggeredBy: snap.triggeredBy,
    })),
    bugs: s.bugs.map((b) => ({
      id: b.id,
      sessionId: b.sessionId,
      title: b.title,
      description: b.description,
      priority: b.priority,
      status: b.status,
      url: b.url,
      screenshotId: b.screenshotId,
      timestamp: b.timestamp,
    })),
    features: s.features.map((f) => ({
      id: f.id,
      sessionId: f.sessionId,
      title: f.title,
      description: f.description,
      featureType: f.featureType,
      status: f.status,
      url: f.url,
      timestamp: f.timestamp,
    })),
    annotations: s.annotations.map((a) => ({
      id: a.id,
      sessionId: a.sessionId,
      kind: a.kind,
      text: a.commentText,
      url: a.pageUrl,
      createdAt: a.createdAt,
    })),
  };
}

/** Format an epoch-ms timestamp as a human-readable ISO string. */
function fmtDate(ts: number | undefined): string {
  if (!ts) return '—';
  return new Date(ts).toISOString().replace('T', ' ').replace('Z', ' UTC');
}

/** Format duration between two epoch-ms timestamps. */
function fmtDuration(startMs: number, endMs: number | undefined): string {
  if (!endMs) return 'ongoing';
  const diffSec = Math.round((endMs - startMs) / 1000);
  if (diffSec < 60) return `${diffSec}s`;
  const mins = Math.floor(diffSec / 60);
  const secs = diffSec % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ${secs}s`;
}

/** Build a complete markdown report for a session. */
function buildSessionReport(s: VIGILSession): string {
  const lines: string[] = [];
  const push = (...args: string[]) => lines.push(...args);

  // ── Header & Metadata ──────────────────────────────────────────────────────
  push(`# Session Report: ${s.name}`);
  push('');
  push('## Metadata');
  push('');
  push(`| Field | Value |`);
  push(`|---|---|`);
  push(`| **Session ID** | \`${s.id}\` |`);
  push(`| **Project** | ${s.projectId} |`);
  push(`| **Sprint** | ${s.sprint ?? '—'} |`);
  push(`| **Description** | ${s.description ?? '—'} |`);
  push(`| **Started** | ${fmtDate(s.startedAt)} |`);
  push(`| **Ended** | ${fmtDate(s.endedAt)} |`);
  push(`| **Duration** | ${fmtDuration(s.startedAt, s.endedAt)} |`);
  push(`| **Session Clock** | ${s.clock}ms |`);
  push('');

  // ── Summary Counts ─────────────────────────────────────────────────────────
  push('## Summary');
  push('');
  push(`- **Bugs:** ${s.bugs.length}`);
  push(`- **Features:** ${s.features.length}`);
  push(`- **Snapshots:** ${s.snapshots.length}`);
  push(`- **Recordings:** ${s.recordings.length}`);
  push(`- **Annotations:** ${s.annotations.length}`);
  push('');

  // ── Bugs ────────────────────────────────────────────────────────────────────
  if (s.bugs.length > 0) {
    push('## Bugs');
    push('');
    push('| # | Title | Priority | Status | URL |');
    push('|---|---|---|---|---|');
    for (const b of s.bugs) {
      push(`| \`${b.id}\` | ${b.title} | ${b.priority} | ${b.status} | ${b.url || '—'} |`);
    }
    push('');
    for (const b of s.bugs) {
      push(`### ${b.id}: ${b.title}`);
      push('');
      push(`- **Priority:** ${b.priority}`);
      push(`- **Status:** ${b.status}`);
      push(`- **URL:** ${b.url || '—'}`);
      push(`- **Timestamp:** ${fmtDate(b.timestamp)}`);
      if (b.screenshotId) push(`- **Screenshot ID:** \`${b.screenshotId}\``);
      push('');
      if (b.description) {
        push('**Description:**');
        push('');
        push(b.description);
        push('');
      }
    }
  }

  // ── Features ────────────────────────────────────────────────────────────────
  if (s.features.length > 0) {
    push('## Features');
    push('');
    push('| # | Title | Type | Status | URL |');
    push('|---|---|---|---|---|');
    for (const f of s.features) {
      push(`| \`${f.id}\` | ${f.title} | ${f.featureType} | ${f.status} | ${f.url || '—'} |`);
    }
    push('');
    for (const f of s.features) {
      push(`### ${f.id}: ${f.title}`);
      push('');
      push(`- **Type:** ${f.featureType}`);
      push(`- **Status:** ${f.status}`);
      push(`- **URL:** ${f.url || '—'}`);
      push(`- **Timestamp:** ${fmtDate(f.timestamp)}`);
      push('');
      if (f.description) {
        push('**Description:**');
        push('');
        push(f.description);
        push('');
      }
    }
  }

  // ── Snapshots ───────────────────────────────────────────────────────────────
  if (s.snapshots.length > 0) {
    push('## Snapshots');
    push('');
    push('| # | Captured At | URL | Trigger |');
    push('|---|---|---|---|');
    for (const snap of s.snapshots) {
      push(`| \`${snap.id}\` | ${fmtDate(snap.capturedAt)} | ${snap.url || '—'} | ${snap.triggeredBy} |`);
    }
    push('');
  }

  // ── Annotations ─────────────────────────────────────────────────────────────
  if (s.annotations.length > 0) {
    push('## Annotations');
    push('');
    push('| # | Kind | Text | URL | Created |');
    push('|---|---|---|---|---|');
    for (const a of s.annotations) {
      const text = a.commentText ? a.commentText.replace(/\n/g, ' ').slice(0, 80) : '—';
      push(`| \`${a.id}\` | ${a.kind} | ${text} | ${a.pageUrl || '—'} | ${fmtDate(a.createdAt)} |`);
    }
    push('');
  }

  // ── Recordings ──────────────────────────────────────────────────────────────
  if (s.recordings.length > 0) {
    push('## Recordings');
    push('');
    for (const r of s.recordings) {
      const totalEvents = r.rrwebChunks.reduce((sum, c) => sum + (c.events?.length ?? 0), 0);
      push(`### Recording \`${r.id}\``);
      push('');
      push(`- **Started:** ${fmtDate(r.startedAt)}`);
      push(`- **Ended:** ${fmtDate(r.endedAt)}`);
      push(`- **Duration:** ${fmtDuration(r.startedAt, r.endedAt)}`);
      push(`- **Mouse Tracking:** ${r.mouseTracking ? 'yes' : 'no'}`);
      push(`- **Chunks:** ${r.rrwebChunks.length}`);
      push(`- **Total rrweb Events:** ${totalEvents}`);
      push('');
    }
  }

  // ── Timeline ────────────────────────────────────────────────────────────────
  interface TimelineEntry { ts: number; label: string; }
  const timeline: TimelineEntry[] = [];

  timeline.push({ ts: s.startedAt, label: 'Session started' });
  if (s.endedAt) timeline.push({ ts: s.endedAt, label: 'Session ended' });

  for (const b of s.bugs) {
    timeline.push({ ts: b.timestamp, label: `Bug logged: ${b.id} — ${b.title} [${b.priority}]` });
  }
  for (const f of s.features) {
    timeline.push({ ts: f.timestamp, label: `Feature logged: ${f.id} — ${f.title} [${f.featureType}]` });
  }
  for (const snap of s.snapshots) {
    timeline.push({ ts: snap.capturedAt, label: `Snapshot: ${snap.id} (${snap.triggeredBy})` });
  }
  for (const a of s.annotations) {
    timeline.push({ ts: a.createdAt, label: `Annotation: ${a.kind}${a.commentText ? ' — ' + a.commentText.replace(/\n/g, ' ').slice(0, 60) : ''}` });
  }
  for (const r of s.recordings) {
    timeline.push({ ts: r.startedAt, label: `Recording started: ${r.id}` });
    if (r.endedAt) timeline.push({ ts: r.endedAt, label: `Recording ended: ${r.id}` });
  }

  timeline.sort((a, b) => a.ts - b.ts);

  push('## Timeline');
  push('');
  push('| Time | Event |');
  push('|---|---|');
  for (const entry of timeline) {
    push(`| ${fmtDate(entry.ts)} | ${entry.label} |`);
  }
  push('');

  // ── Footer ──────────────────────────────────────────────────────────────────
  push('---');
  push(`*Report generated at ${new Date().toISOString()} by vigil-server*`);
  push('');

  return lines.join('\n');
}

// GET /api/sessions?project=X&sprint=Y&archived=true
sessionsRouter.get('/', async (req, res) => {
  const project = req.query.project as string | undefined;
  const sprint = req.query.sprint as string | undefined;
  const includeArchived = req.query.archived === 'true';
  const storage = getStorage();

  try {
    const sessions = await storage.listSessions(project, sprint, includeArchived);
    res.json({ sessions: sessions.map(toSummary) });
  } catch (err) {
    console.error('[vigil-server] Error listing sessions:', err);
    res.status(500).json({ error: 'Failed to list sessions' });
  }
});

// DELETE /api/sessions/:id — archive a session (soft-delete; cascades to bugs/features)
sessionsRouter.delete('/:id', async (req, res) => {
  const storage = getStorage();

  try {
    const archived = await storage.archiveSession(req.params.id);
    if (!archived) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    res.json({ ok: true, archivedId: req.params.id });
  } catch (err) {
    console.error('[vigil-server] Error archiving session:', err);
    res.status(500).json({ error: 'Failed to archive session' });
  }
});

// PATCH /api/sessions/:id/restore — restore an archived session
sessionsRouter.patch('/:id/restore', async (req, res) => {
  const storage = getStorage();

  try {
    const restored = await storage.restoreSession(req.params.id);
    if (!restored) {
      res.status(404).json({ error: 'Session not found or not archived' });
      return;
    }
    res.json({ ok: true, restoredId: req.params.id });
  } catch (err) {
    console.error('[vigil-server] Error restoring session:', err);
    res.status(500).json({ error: 'Failed to restore session' });
  }
});

// GET /api/sessions/:id/report — LLM-readable markdown report
sessionsRouter.get('/:id/report', async (req, res) => {
  const storage = getStorage();

  try {
    const session = await storage.getSession(req.params.id);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const md = buildSessionReport(session);
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(md);
  } catch (err) {
    console.error('[vigil-server] Error generating session report:', err);
    res.status(500).json({ error: 'Failed to generate session report' });
  }
});

// GET /api/sessions/:id
sessionsRouter.get('/:id', async (req, res) => {
  const storage = getStorage();

  try {
    const session = await storage.getSession(req.params.id);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    res.json({ session: toDetail(session) });
  } catch (err) {
    console.error('[vigil-server] Error getting session:', err);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

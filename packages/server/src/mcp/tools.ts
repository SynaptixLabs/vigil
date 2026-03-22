import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getStorage } from '../storage/index.js';
import { BugUpdateSchema } from '@synaptix/vigil-shared';
import type { VIGILSession } from '@synaptix/vigil-shared';

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

/**
 * Build a structured markdown report for a session (MCP-friendly).
 * Omits base64 screenshot data to keep output compact.
 */
function buildSessionReport(s: VIGILSession): string {
  const lines: string[] = [];
  const push = (...args: string[]) => lines.push(...args);

  // ── Header & Metadata
  push(`# Session Report: ${s.name}`);
  push('');
  push('## Metadata');
  push('');
  push('| Field | Value |');
  push('|---|---|');
  push(`| **Session ID** | \`${s.id}\` |`);
  push(`| **Project** | ${s.projectId} |`);
  push(`| **Sprint** | ${s.sprint ?? '—'} |`);
  push(`| **Description** | ${s.description ?? '—'} |`);
  push(`| **Started** | ${fmtDate(s.startedAt)} |`);
  push(`| **Ended** | ${fmtDate(s.endedAt)} |`);
  push(`| **Duration** | ${fmtDuration(s.startedAt, s.endedAt)} |`);
  push(`| **Session Clock** | ${s.clock}ms |`);
  push('');

  // ── Summary Counts
  push('## Summary');
  push('');
  push(`- **Bugs:** ${s.bugs.length}`);
  push(`- **Features:** ${s.features.length}`);
  push(`- **Snapshots:** ${s.snapshots.length}`);
  push(`- **Recordings:** ${s.recordings.length}`);
  push(`- **Annotations:** ${s.annotations.length}`);
  push('');

  // ── Bugs
  if (s.bugs.length > 0) {
    push('## Bugs');
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

  // ── Features
  if (s.features.length > 0) {
    push('## Features');
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

  // ── Snapshots (metadata only, no base64)
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

  // ── Annotations
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

  // ── Recordings (summary only, no raw rrweb events)
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

  push('---');
  push(`*Report generated at ${new Date().toISOString()} by vigil-mcp*`);
  push('');

  return lines.join('\n');
}

export function registerTools(server: McpServer): void {
  // 1. vigil_list_bugs
  server.tool(
    'vigil_list_bugs',
    'List bugs for a sprint, optionally filtered by status',
    {
      sprint: z.string().optional().describe('Sprint number (e.g. "06"). Defaults to current sprint.'),
      status: z.enum(['open', 'fixed']).optional().describe('Filter by status'),
    },
    async ({ sprint, status }) => {
      const bugs = await getStorage().listBugs(sprint, status);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ bugs, count: bugs.length }, null, 2),
          },
        ],
      };
    },
  );

  // 2. vigil_get_bug
  server.tool(
    'vigil_get_bug',
    'Get full details of a specific bug by ID',
    {
      bug_id: z.string().describe('Bug ID (e.g. "BUG-001")'),
    },
    async ({ bug_id }) => {
      const bug = await getStorage().getBug(bug_id);
      if (!bug) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: `Bug ${bug_id} not found` }) }],
          isError: true,
        };
      }
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(bug, null, 2) }],
      };
    },
  );

  // 3. vigil_update_bug
  server.tool(
    'vigil_update_bug',
    'Update fields on an existing bug (status, severity, resolution)',
    {
      bug_id: z.string().describe('Bug ID (e.g. "BUG-001")'),
      fields: BugUpdateSchema.describe('Fields to update'),
    },
    async ({ bug_id, fields }) => {
      const updated = await getStorage().updateBug(bug_id, fields);
      if (!updated) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: `Bug ${bug_id} not found` }) }],
          isError: true,
        };
      }
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ updated: true, bug_id }) }],
      };
    },
  );

  // 4. vigil_close_bug
  server.tool(
    'vigil_close_bug',
    'Close a bug with resolution and decide whether to keep regression test',
    {
      bug_id: z.string().describe('Bug ID (e.g. "BUG-001")'),
      resolution: z.string().describe('Resolution description'),
      keep_test: z.boolean().describe('Whether to keep the regression test'),
    },
    async ({ bug_id, resolution, keep_test }) => {
      const closed = await getStorage().closeBug(bug_id, resolution, keep_test);
      if (!closed) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: `Bug ${bug_id} not found in open/` }) }],
          isError: true,
        };
      }
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ closed: true, bug_id }) }],
      };
    },
  );

  // 5. vigil_list_features
  server.tool(
    'vigil_list_features',
    'List features for a sprint, optionally filtered by status',
    {
      sprint: z.string().optional().describe('Sprint number (e.g. "06"). Defaults to current sprint.'),
      status: z.enum(['open', 'done']).optional().describe('Filter by status'),
    },
    async ({ sprint, status }) => {
      const features = await getStorage().listFeatures(sprint, status);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ features, count: features.length }, null, 2),
          },
        ],
      };
    },
  );

  // 6. vigil_get_feature
  server.tool(
    'vigil_get_feature',
    'Get full details of a specific feature by ID',
    {
      feat_id: z.string().describe('Feature ID (e.g. "FEAT-001")'),
    },
    async ({ feat_id }) => {
      const feature = await getStorage().getFeature(feat_id);
      if (!feature) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: `Feature ${feat_id} not found` }) }],
          isError: true,
        };
      }
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(feature, null, 2) }],
      };
    },
  );

  // 7. vigil_list_sessions
  server.tool(
    'vigil_list_sessions',
    'List session summaries, optionally filtered by project',
    {
      project: z.string().optional().describe('Project ID to filter by'),
    },
    async ({ project }) => {
      const sessions = await getStorage().listSessions(project);
      const summaries = sessions.map((s) => ({
        id: s.id,
        name: s.name,
        project: s.projectId,
        sprint: s.sprint ?? '',
        startedAt: fmtDate(s.startedAt),
        endedAt: fmtDate(s.endedAt),
        duration: fmtDuration(s.startedAt, s.endedAt),
        bugCount: s.bugs.length,
        featureCount: s.features.length,
        snapshotCount: s.snapshots.length,
        recordingCount: s.recordings.length,
        annotationCount: s.annotations.length,
      }));
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ sessions: summaries, count: summaries.length }, null, 2),
          },
        ],
      };
    },
  );

  // 8. vigil_read_session
  server.tool(
    'vigil_read_session',
    'Read full session data as a structured markdown report (metadata, bugs, features, snapshots, annotations, recordings). No base64 image data is included.',
    {
      session_id: z.string().describe('Session ID to read'),
    },
    async ({ session_id }) => {
      const session = await getStorage().getSession(session_id);
      if (!session) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: `Session ${session_id} not found` }) }],
          isError: true,
        };
      }
      const report = buildSessionReport(session);
      return {
        content: [{ type: 'text' as const, text: report }],
      };
    },
  );
}

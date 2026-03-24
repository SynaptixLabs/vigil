/**
 * @file SessionList.tsx
 * @description Session list for the side panel, filtered to the selected project.
 * Shows server-side session summaries sorted newest first.
 */

import React from 'react';
import type { ServerSessionSummary } from '../api';

interface SessionListProps {
  sessions: ServerSessionSummary[];
  loading: boolean;
  error: string | null;
  projectId: string | null;
  projectName: string | null;
  onSelectSession: (id: string) => void;
}

/** Format epoch-ms to a readable date string. */
function formatDate(epochMs: number): string {
  const d = new Date(epochMs);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/** Format duration between two epoch-ms timestamps. */
function formatDuration(startMs: number, endMs?: number): string {
  if (!endMs) return 'ongoing';
  const diffSec = Math.round((endMs - startMs) / 1000);
  if (diffSec < 60) return `${diffSec}s`;
  const mins = Math.floor(diffSec / 60);
  const secs = diffSec % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ${secs}s`;
}

const SessionList: React.FC<SessionListProps> = ({
  sessions,
  loading,
  error,
  projectId,
  projectName,
  onSelectSession,
}) => {
  // No project selected
  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-2xl">
          &#x1F4C2;
        </div>
        <p className="text-sm font-medium text-gray-300">No project selected</p>
        <p className="text-xs text-gray-500">
          Select a project or create a new one to start.
        </p>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 text-gray-500 text-sm">
        Loading sessions...
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 text-center gap-2">
        <p className="text-sm text-red-400">{error}</p>
        <p className="text-xs text-gray-500">Is vigil-server running?</p>
      </div>
    );
  }

  // Empty — no sessions for this project
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-2xl">
          &#x1F3AC;
        </div>
        <p className="text-sm font-medium text-gray-300">No sessions yet</p>
        <p className="text-xs text-gray-500">
          No sessions yet for {projectName ?? projectId}. Start your first recording.
        </p>
      </div>
    );
  }

  // Session cards
  return (
    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
        Sessions ({sessions.length})
      </p>
      {sessions.map((s) => (
        <SessionCard key={s.id} session={s} onSelect={onSelectSession} />
      ))}
    </div>
  );
};

// ── Session card ─────────────────────────────────────────────────────────────

interface SessionCardProps {
  session: ServerSessionSummary;
  onSelect: (id: string) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onSelect }) => {
  const isOngoing = !session.endedAt;

  return (
    <div
      data-testid="sidepanel-session-card"
      onClick={() => onSelect(session.id)}
      style={{ cursor: 'pointer' }}
      className={`rounded-xl border p-3 transition-colors ${
        isOngoing
          ? 'border-indigo-700/60 bg-indigo-900/20 hover:bg-indigo-900/30'
          : 'border-gray-800 bg-gray-900/60 hover:bg-gray-800/60'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{session.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{formatDate(session.startedAt)}</p>
        </div>
        {isOngoing && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 bg-red-500/20 text-red-400 border-red-500/30">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 mr-1 animate-pulse" />
            RECORDING
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
        <span title="Duration">&#x23F1; {formatDuration(session.startedAt, session.endedAt)}</span>
        {session.bugCount > 0 && <span title="Bugs">&#x1F41B; {session.bugCount}</span>}
        {session.featureCount > 0 && <span title="Features">&#x2728; {session.featureCount}</span>}
        {session.snapshotCount > 0 && <span title="Snapshots">&#x1F4F7; {session.snapshotCount}</span>}
        {session.annotationCount > 0 && <span title="Annotations">&#x1F3F7; {session.annotationCount}</span>}
      </div>

      {session.sprint && (
        <p className="mt-1.5 text-[10px] text-gray-600">
          Sprint {session.sprint}
        </p>
      )}
    </div>
  );
};

export default SessionList;

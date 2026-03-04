import type { SessionSummary } from '../types';

interface SessionListProps {
  sessions: SessionSummary[];
  selectedId: string | null;
  onSelect: (sessionId: string) => void;
  onDelete?: (sessionId: string) => void;
}

function formatDuration(startedAt: number, endedAt?: number): string {
  if (!endedAt) return 'In progress';
  const ms = endedAt - startedAt;
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
}

function formatDate(epoch: number): string {
  return new Date(epoch).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SessionList({ sessions, selectedId, onSelect, onDelete }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div
        data-testid="session-list"
        className="bg-white rounded-xl border border-slate-200 p-12 text-center"
      >
        <div className="text-4xl mb-3">📹</div>
        <div className="text-sm font-medium text-slate-600 mb-1">No sessions found</div>
        <div className="text-xs text-slate-400">Start a Vigil session in the Chrome extension to see data here.</div>
      </div>
    );
  }

  return (
    <div data-testid="session-list" className="space-y-2">
      {sessions.map((session) => {
        const isActive = !session.endedAt;

        return (
          <div
            key={session.id}
            data-testid={`session-row-${session.id}`}
            className={`group bg-white rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer ${
              selectedId === session.id
                ? 'border-indigo-300 ring-2 ring-indigo-100 shadow-sm'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <button
              className="w-full text-left px-5 py-4"
              onClick={() => onSelect(session.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {isActive && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                      </span>
                    )}
                    <span className="text-sm font-semibold text-slate-900 truncate">
                      {session.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{formatDate(session.startedAt)}</span>
                    <span className="text-slate-300">|</span>
                    <span>{formatDuration(session.startedAt, session.endedAt)}</span>
                    {session.sprint && (
                      <>
                        <span className="text-slate-300">|</span>
                        <span className="text-indigo-400">Sprint {session.sprint}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Stats badges */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {session.bugCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                      🐛 {session.bugCount}
                    </span>
                  )}
                  {session.featureCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                      ✨ {session.featureCount}
                    </span>
                  )}
                  {session.snapshotCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      📸 {session.snapshotCount}
                    </span>
                  )}
                  {session.recordingCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                      🎥 {session.recordingCount}
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* Delete button — visible on hover */}
            {onDelete && (
              <div className="px-5 pb-3 -mt-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="text-xs text-slate-400 hover:text-red-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete session "${session.name}"?`)) {
                      onDelete(session.id);
                    }
                  }}
                >
                  Delete session
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

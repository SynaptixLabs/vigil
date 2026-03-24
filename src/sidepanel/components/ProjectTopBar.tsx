/**
 * @file ProjectTopBar.tsx
 * @description Top bar for the side panel: project dropdown + new project + new session.
 * Projects are sorted by most recent session activity (passed as prop).
 */

import React from 'react';
import type { ProjectInfo } from '@shared/types';

interface ProjectTopBarProps {
  projects: ProjectInfo[];
  selectedProjectId: string | null;
  autoDetected: boolean;
  loading: boolean;
  /** Map of projectId → most recent session startedAt (epoch ms). Used for sorting. */
  projectActivityMap: Record<string, number>;
  onSelectProject: (projectId: string) => void;
  onNewProject: () => void;
  onNewSession: () => void;
}

/** Sort projects: most recent session activity first, no-session projects at bottom, then alphabetical. */
function sortedProjects(
  projects: ProjectInfo[],
  activityMap: Record<string, number>,
): ProjectInfo[] {
  return [...projects].sort((a, b) => {
    const aActivity = activityMap[a.id] ?? 0;
    const bActivity = activityMap[b.id] ?? 0;
    // Both have activity → most recent first
    if (aActivity && bActivity) return bActivity - aActivity;
    // One has activity, the other doesn't → activity first
    if (aActivity && !bActivity) return -1;
    if (!aActivity && bActivity) return 1;
    // Neither has activity → alphabetical
    return a.name.localeCompare(b.name);
  });
}

const ProjectTopBar: React.FC<ProjectTopBarProps> = ({
  projects,
  selectedProjectId,
  autoDetected,
  loading,
  projectActivityMap,
  onSelectProject,
  onNewProject,
  onNewSession,
}) => {
  const sorted = sortedProjects(projects, projectActivityMap);

  return (
    <div className="px-3 py-2 border-b border-gray-800 bg-gray-900/50 flex flex-col gap-1.5">
      {/* Row 1: Project dropdown */}
      <div className="flex items-center gap-2">
        <select
          value={selectedProjectId ?? ''}
          onChange={(e) => {
            if (e.target.value) onSelectProject(e.target.value);
          }}
          disabled={loading}
          data-testid="sidepanel-project-select"
          className="flex-1 bg-gray-900 border border-gray-700 rounded-md px-2 py-1.5 text-sm text-white
                     focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors
                     disabled:opacity-50 truncate"
        >
          <option value="">-- Select project --</option>
          {sorted.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* + New Project */}
        <button
          onClick={onNewProject}
          data-testid="sidepanel-btn-new-project"
          title="Create new project"
          className="shrink-0 text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1.5 rounded-md
                     border border-gray-700 transition-colors"
        >
          + Project
        </button>

        {/* + New Session */}
        <button
          onClick={onNewSession}
          disabled={!selectedProjectId}
          data-testid="sidepanel-btn-new-session"
          title={selectedProjectId ? 'Start new session' : 'Select a project first'}
          className="shrink-0 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed
                     text-white px-2 py-1.5 rounded-md transition-colors"
        >
          + Session
        </button>
      </div>

      {/* Row 2: Auto-detect indicator */}
      {selectedProjectId && autoDetected && (
        <p
          data-testid="sidepanel-auto-indicator"
          className="text-[10px] text-indigo-400 px-0.5"
        >
          Auto-detected from current tab (auto)
        </p>
      )}
    </div>
  );
};

export default ProjectTopBar;

/**
 * @file useProjects.ts
 * @description Hook for loading projects and auto-detecting the current project
 * from the active tab URL. Persists URL→project mappings in chrome.storage.local.
 * Also fetches a project activity map (projectId → most recent session timestamp)
 * so the top bar can sort projects by recency.
 */

import { useState, useEffect, useCallback } from 'react';
import type { ProjectInfo } from '@shared/types';
import { fetchProjects as apiFetchProjects, fetchProjectActivityMap } from '../api';

const STORAGE_KEY = 'vigilSidePanelProjectMap'; // { [origin]: projectId }
const LAST_PROJECT_KEY = 'vigilSidePanelLastProject';

export interface UseProjectsResult {
  projects: ProjectInfo[];
  loading: boolean;
  error: string | null;
  selectedProjectId: string | null;
  autoDetected: boolean;
  currentTabUrl: string | null;
  /** Map of projectId → most recent session startedAt (epoch ms). */
  projectActivityMap: Record<string, number>;
  selectProject: (projectId: string) => void;
  refresh: () => void;
}

/** Extract origin from a URL, returning null on failure. */
function safeOrigin(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [autoDetected, setAutoDetected] = useState(false);
  const [currentTabUrl, setCurrentTabUrl] = useState<string | null>(null);
  const [projectActivityMap, setProjectActivityMap] = useState<Record<string, number>>({});

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, activityMap] = await Promise.all([
        apiFetchProjects(),
        fetchProjectActivityMap(),
      ]);
      setProjects(list);
      setProjectActivityMap(activityMap);
      return list;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-detect project on mount
  useEffect(() => {
    let cancelled = false;

    async function detect() {
      // 1. Get current tab URL
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tab = tabs.find(
        t => t.url && !t.url.startsWith('chrome-extension://') && !t.url.startsWith('chrome://'),
      );
      const tabUrl = tab?.url ?? null;
      if (!cancelled) setCurrentTabUrl(tabUrl);

      // 2. Fetch projects from server
      const projectList = await loadProjects();
      if (cancelled) return;

      // 3. Match by origin
      const tabOrigin = tabUrl ? safeOrigin(tabUrl) : null;
      let matchedProject: ProjectInfo | undefined;

      if (tabOrigin) {
        matchedProject = projectList.find(p => {
          if (!p.url) return false;
          return safeOrigin(p.url) === tabOrigin;
        });
      }

      if (matchedProject) {
        setSelectedProjectId(matchedProject.id);
        setAutoDetected(true);
        // Persist this mapping
        persistOriginMapping(tabOrigin!, matchedProject.id);
        return;
      }

      // 4. Fallback: check stored origin→project mapping
      if (tabOrigin) {
        const stored = await getStoredMapping(tabOrigin);
        if (stored && projectList.some(p => p.id === stored)) {
          setSelectedProjectId(stored);
          setAutoDetected(false); // not a URL match, just cached
          return;
        }
      }

      // 5. Fallback: last used project
      const lastProject = await getLastProject();
      if (lastProject && projectList.some(p => p.id === lastProject)) {
        setSelectedProjectId(lastProject);
        setAutoDetected(false);
        return;
      }

      // 6. No match — leave unselected
      setSelectedProjectId(null);
      setAutoDetected(false);
    }

    detect();
    return () => { cancelled = true; };
  }, [loadProjects]);

  const selectProject = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
    setAutoDetected(false);
    // Persist last-used project
    chrome.storage.local.set({ [LAST_PROJECT_KEY]: projectId });
    // If we have a tab origin, persist the mapping
    if (currentTabUrl) {
      const origin = safeOrigin(currentTabUrl);
      if (origin) persistOriginMapping(origin, projectId);
    }
  }, [currentTabUrl]);

  const refresh = useCallback(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    loading,
    error,
    selectedProjectId,
    autoDetected,
    currentTabUrl,
    projectActivityMap,
    selectProject,
    refresh,
  };
}

// ── chrome.storage.local helpers ─────────────────────────────────────────────

async function persistOriginMapping(origin: string, projectId: string): Promise<void> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const map: Record<string, string> = result[STORAGE_KEY] ?? {};
  map[origin] = projectId;
  await chrome.storage.local.set({ [STORAGE_KEY]: map });
  await chrome.storage.local.set({ [LAST_PROJECT_KEY]: projectId });
}

async function getStoredMapping(origin: string): Promise<string | null> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const map: Record<string, string> = result[STORAGE_KEY] ?? {};
  return map[origin] ?? null;
}

async function getLastProject(): Promise<string | null> {
  const result = await chrome.storage.local.get(LAST_PROJECT_KEY);
  return (result[LAST_PROJECT_KEY] as string) ?? null;
}

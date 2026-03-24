/**
 * @file api.ts
 * @description Server API helpers for the side panel.
 * Reads vigil.config.json from the extension bundle to derive the server URL,
 * then exposes typed fetch wrappers for projects and sessions.
 */

import type { ProjectInfo } from '@shared/types';

export interface ServerSessionSummary {
  id: string;
  project: string;
  sprint: string;
  name: string;
  startedAt: number;
  endedAt?: number;
  recordingCount: number;
  snapshotCount: number;
  bugCount: number;
  featureCount: number;
  annotationCount: number;
  archivedAt?: string | null;
}

const DEFAULT_SERVER_URL = 'http://localhost:7474';

let _serverUrl: string | null = null;

/** Resolve the vigil-server base URL from vigil.config.json (bundled in extension). */
async function getServerUrl(): Promise<string> {
  if (_serverUrl) return _serverUrl;
  try {
    const configUrl = chrome.runtime.getURL('vigil.config.json');
    const res = await fetch(configUrl);
    if (res.ok) {
      const config = await res.json();
      const url: string = config.serverUrl ?? `http://localhost:${config.serverPort ?? 7474}`;
      _serverUrl = url;
      return url;
    }
  } catch {
    // config not bundled — use default
  }
  _serverUrl = DEFAULT_SERVER_URL;
  return DEFAULT_SERVER_URL;
}

/** Fetch all (non-archived) projects from vigil-server. */
export async function fetchProjects(): Promise<ProjectInfo[]> {
  const serverUrl = await getServerUrl();
  const res = await fetch(`${serverUrl}/api/projects`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.projects ?? []).map((p: Record<string, unknown>) => ({
    id: p.id as string,
    name: p.name as string,
    currentSprint: (p.current_sprint ?? p.currentSprint) as string | undefined,
    url: (p.url as string | undefined) ?? undefined,
  }));
}

/** Fetch sessions for a given project from vigil-server. */
export async function fetchSessions(projectId: string): Promise<ServerSessionSummary[]> {
  const serverUrl = await getServerUrl();
  const res = await fetch(
    `${serverUrl}/api/sessions?project=${encodeURIComponent(projectId)}`,
    { signal: AbortSignal.timeout(5000) },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.sessions ?? []) as ServerSessionSummary[];
}

/**
 * Fetch all sessions (across all projects) to build a project activity map.
 * Returns a map of projectId → most recent startedAt timestamp.
 */
export async function fetchProjectActivityMap(): Promise<Record<string, number>> {
  const serverUrl = await getServerUrl();
  const res = await fetch(`${serverUrl}/api/sessions`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return {};
  const data = await res.json();
  const sessions = (data.sessions ?? []) as ServerSessionSummary[];
  const map: Record<string, number> = {};
  for (const s of sessions) {
    if (!s.project) continue;
    const current = map[s.project] ?? 0;
    if (s.startedAt > current) map[s.project] = s.startedAt;
  }
  return map;
}

/** Create a new project on vigil-server. */
export async function createProject(
  id: string,
  name: string,
  url?: string,
): Promise<ProjectInfo> {
  const serverUrl = await getServerUrl();
  const res = await fetch(`${serverUrl}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name, url }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  const data = await res.json();
  const p = data.project;
  return {
    id: p.id,
    name: p.name,
    currentSprint: p.currentSprint ?? p.current_sprint,
    url: p.url,
  };
}

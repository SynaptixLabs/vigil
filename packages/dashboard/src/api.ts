import type { BugItem, BugUpdate, FeatureItem, HealthStatus, SessionSummary, SessionDetail, ProjectItem } from './types';

const BASE = '/api';

// ── Projects ──────────────────────────────────────────────────────────────────

export async function fetchProjects(includeArchived = false): Promise<ProjectItem[]> {
  const params = new URLSearchParams();
  if (includeArchived) params.set('archived', 'true');
  const res = await fetch(`${BASE}/projects?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch projects: ${res.status}`);
  const data = await res.json();
  return data.projects ?? [];
}

export async function createProject(project: { id: string; name: string; description?: string; currentSprint?: string; url?: string }): Promise<ProjectItem> {
  const res = await fetch(`${BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `Failed to create project: ${res.status}`);
  }
  const data = await res.json();
  return data.project;
}

export async function updateProject(id: string, fields: { name?: string; description?: string; currentSprint?: string; url?: string }): Promise<ProjectItem> {
  const res = await fetch(`${BASE}/projects/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error(`Failed to update project: ${res.status}`);
  const data = await res.json();
  return data.project;
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`${BASE}/projects/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete project: ${res.status}`);
}

export async function detectProjectInfo(path: string): Promise<{ sprint: string | null; description: string | null; source: string }> {
  const res = await fetch(`${BASE}/projects/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `Failed to detect project info: ${res.status}`);
  }
  return res.json();
}

// ── Bugs ──────────────────────────────────────────────────────────────────────

export async function fetchBugs(sprint?: string, status?: string, includeArchived = false): Promise<BugItem[]> {
  const params = new URLSearchParams();
  if (sprint) params.set('sprint', sprint);
  if (status) params.set('status', status);
  if (includeArchived) params.set('archived', 'true');
  const res = await fetch(`${BASE}/bugs?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch bugs: ${res.status}`);
  const data = await res.json();
  return data.bugs ?? [];
}

export async function fetchFeatures(sprint?: string, status?: string, includeArchived = false): Promise<FeatureItem[]> {
  const params = new URLSearchParams();
  if (sprint) params.set('sprint', sprint);
  if (status) params.set('status', status);
  if (includeArchived) params.set('archived', 'true');
  const res = await fetch(`${BASE}/features?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch features: ${res.status}`);
  const data = await res.json();
  return data.features ?? [];
}

export interface SprintsResponse {
  sprints: Array<{ id: string; name: string }>;
  current: string;
}

export async function fetchSprints(): Promise<{ ids: string[]; current: string }> {
  const res = await fetch(`${BASE}/sprints`);
  if (!res.ok) throw new Error(`Failed to fetch sprints: ${res.status}`);
  const data: SprintsResponse = await res.json();
  return {
    ids: (data.sprints ?? []).map((s) => s.id),
    current: data.current,
  };
}

export async function patchBug(bugId: string, fields: BugUpdate): Promise<void> {
  const res = await fetch(`${BASE}/bugs/${bugId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error(`Failed to update bug: ${res.status}`);
}

export async function closeBug(bugId: string, resolution: string, keepTest: boolean): Promise<void> {
  const res = await fetch(`${BASE}/bugs/${bugId}/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resolution, keepTest }),
  });
  if (!res.ok) throw new Error(`Failed to close bug: ${res.status}`);
}

// ── Sprint 07: Session endpoints (S07-17a) ─────────────────────────────────
// Requires GET /api/sessions and GET /api/sessions/:id on vigil-server.
// These will be available once [DEV:server] builds the session reading routes.

export async function fetchSessions(
  project?: string,
  sprint?: string,
  includeArchived = false,
): Promise<SessionSummary[]> {
  const params = new URLSearchParams();
  if (project) params.set('project', project);
  if (sprint) params.set('sprint', sprint);
  if (includeArchived) params.set('archived', 'true');
  const res = await fetch(`${BASE}/sessions?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch sessions: ${res.status}`);
  const data = await res.json();
  return data.sessions ?? [];
}

export async function deleteSession(sessionId: string): Promise<void> {
  const res = await fetch(`${BASE}/sessions/${encodeURIComponent(sessionId)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete session: ${res.status}`);
}

export async function fetchSession(sessionId: string): Promise<SessionDetail> {
  const res = await fetch(`${BASE}/sessions/${encodeURIComponent(sessionId)}`);
  if (!res.ok) throw new Error(`Failed to fetch session: ${res.status}`);
  const data = await res.json();
  return data.session;
}

export async function fetchHealth(): Promise<HealthStatus> {
  try {
    const res = await fetch('/health');
    if (!res.ok) return { status: 'error' };
    return await res.json();
  } catch {
    return { status: 'error' };
  }
}

// ── Archive / Restore ────────────────────────────────────────────────────────

export async function restoreProject(id: string): Promise<void> {
  const res = await fetch(`${BASE}/projects/${encodeURIComponent(id)}/restore`, { method: 'PATCH' });
  if (!res.ok) throw new Error(`Failed to restore project: ${res.status}`);
}

export async function restoreSession(id: string): Promise<void> {
  const res = await fetch(`${BASE}/sessions/${encodeURIComponent(id)}/restore`, { method: 'PATCH' });
  if (!res.ok) throw new Error(`Failed to restore session: ${res.status}`);
}

export async function archiveBug(id: string): Promise<void> {
  const res = await fetch(`${BASE}/bugs/${encodeURIComponent(id)}/archive`, { method: 'PATCH' });
  if (!res.ok) throw new Error(`Failed to archive bug: ${res.status}`);
}

export async function restoreBug(id: string): Promise<void> {
  const res = await fetch(`${BASE}/bugs/${encodeURIComponent(id)}/restore`, { method: 'PATCH' });
  if (!res.ok) throw new Error(`Failed to restore bug: ${res.status}`);
}

export async function archiveFeature(id: string): Promise<void> {
  const res = await fetch(`${BASE}/features/${encodeURIComponent(id)}/archive`, { method: 'PATCH' });
  if (!res.ok) throw new Error(`Failed to archive feature: ${res.status}`);
}

export async function restoreFeature(id: string): Promise<void> {
  const res = await fetch(`${BASE}/features/${encodeURIComponent(id)}/restore`, { method: 'PATCH' });
  if (!res.ok) throw new Error(`Failed to restore feature: ${res.status}`);
}

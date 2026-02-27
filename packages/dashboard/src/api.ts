import type { BugItem, BugUpdate, FeatureItem, HealthStatus } from './types';

const BASE = '/api';

export async function fetchBugs(sprint?: string, status?: string): Promise<BugItem[]> {
  const params = new URLSearchParams();
  if (sprint) params.set('sprint', sprint);
  if (status) params.set('status', status);
  const res = await fetch(`${BASE}/bugs?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch bugs: ${res.status}`);
  const data = await res.json();
  return data.bugs ?? [];
}

export async function fetchFeatures(sprint?: string, status?: string): Promise<FeatureItem[]> {
  const params = new URLSearchParams();
  if (sprint) params.set('sprint', sprint);
  if (status) params.set('status', status);
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

export async function fetchHealth(): Promise<HealthStatus> {
  try {
    const res = await fetch('/health');
    if (!res.ok) return { status: 'error' };
    return await res.json();
  } catch {
    return { status: 'error' };
  }
}

/**
 * @file useSessions.ts
 * @description Hook for loading sessions from vigil-server, filtered by project.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchSessions as apiFetchSessions } from '../api';
import type { ServerSessionSummary } from '../api';

export interface UseSessionsResult {
  sessions: ServerSessionSummary[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useSessions(projectId: string | null): UseSessionsResult {
  const [sessions, setSessions] = useState<ServerSessionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!projectId) {
      setSessions([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await apiFetchSessions(projectId);
      // Sort newest first
      list.sort((a, b) => (b.startedAt ?? 0) - (a.startedAt ?? 0));
      setSessions(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    sessions,
    loading,
    error,
    refresh: load,
  };
}

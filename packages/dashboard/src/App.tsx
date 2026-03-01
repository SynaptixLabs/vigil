import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchBugs, fetchFeatures, fetchSprints, fetchHealth, fetchSessions, fetchSession } from './api';
import type { BugItem, FeatureItem, HealthStatus, SessionSummary, SessionDetail as SessionDetailType } from './types';
import { Sidebar } from './components/Sidebar';
import { SprintSelector } from './components/SprintSelector';
import { HealthIndicator } from './components/HealthIndicator';
import { BugList } from './views/BugList';
import { FeatureList } from './views/FeatureList';
import { SessionList } from './views/SessionList';
import { SessionDetail } from './views/SessionDetail';

type Tab = 'bugs' | 'features' | 'sessions';

export default function App() {
  // ── Global state ──────────────────────────────────────────────────────────
  const [sprints, setSprints] = useState<string[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<string>('');
  const [health, setHealth] = useState<HealthStatus>({ status: 'error' });
  const [activeTab, setActiveTab] = useState<Tab>('sessions');

  // ── Bugs & Features state ─────────────────────────────────────────────────
  const [bugs, setBugs] = useState<BugItem[]>([]);
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // ── Session state ─────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [sessionSprintFilter, setSessionSprintFilter] = useState<string>('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionDetail, setSessionDetail] = useState<SessionDetailType | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // ── Health polling ────────────────────────────────────────────────────────
  useEffect(() => {
    fetchHealth().then(setHealth);
    const interval = setInterval(() => fetchHealth().then(setHealth), 30_000);
    return () => clearInterval(interval);
  }, []);

  // ── Load sprints ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchSprints()
      .then(({ ids, current }) => {
        setSprints(ids);
        if (!selectedSprint) setSelectedSprint(current || ids[ids.length - 1] || '');
      })
      .catch(() => setDataError('Could not load sprints — is vigil-server running?'));
  }, [selectedSprint]);

  // ── Load bugs & features (for bugs/features tabs) ─────────────────────────
  const loadBugsAndFeatures = useCallback(async () => {
    if (!selectedSprint) return;
    setDataLoading(true);
    setDataError(null);
    try {
      const [b, f] = await Promise.all([
        fetchBugs(selectedSprint),
        fetchFeatures(selectedSprint),
      ]);
      setBugs(b);
      setFeatures(f);
    } catch {
      setDataError('Could not load data — is vigil-server running on port 7474?');
    } finally {
      setDataLoading(false);
    }
  }, [selectedSprint]);

  useEffect(() => {
    loadBugsAndFeatures();
  }, [loadBugsAndFeatures]);

  // ── Load sessions ─────────────────────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const list = await fetchSessions(
        selectedProject || undefined,
        sessionSprintFilter || undefined,
      );
      // Sort by startedAt descending
      list.sort((a, b) => b.startedAt - a.startedAt);
      setSessions(list);
    } catch {
      setSessionsError('Could not load sessions — is vigil-server running on port 7474?');
    } finally {
      setSessionsLoading(false);
    }
  }, [selectedProject, sessionSprintFilter]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // ── Load session detail ───────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedSessionId) {
      setSessionDetail(null);
      return;
    }
    setDetailLoading(true);
    setDetailError(null);
    fetchSession(selectedSessionId)
      .then(setSessionDetail)
      .catch(() => setDetailError('Could not load session details.'))
      .finally(() => setDetailLoading(false));
  }, [selectedSessionId]);

  // ── Derive unique project names from sessions ─────────────────────────────
  const projects = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach((s) => {
      if (s.project) set.add(s.project);
    });
    return Array.from(set).sort();
  }, [sessions]);

  // Also derive unique sprint ids from sessions for the session sprint filter
  const sessionSprints = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach((s) => {
      if (s.sprint) set.add(s.sprint);
    });
    return Array.from(set).sort();
  }, [sessions]);

  // ── Event handlers ────────────────────────────────────────────────────────
  function handleProjectSelect(project: string) {
    setSelectedProject(project);
    setSelectedSessionId(null);
    setSessionDetail(null);
  }

  function handleSessionSelect(sessionId: string) {
    setSelectedSessionId(sessionId);
  }

  function handleBackToList() {
    setSelectedSessionId(null);
    setSessionDetail(null);
  }

  // ── Render helpers ────────────────────────────────────────────────────────
  function renderSessionsContent() {
    if (selectedSessionId) {
      return (
        <div>
          <button
            data-testid="back-to-sessions"
            className="mb-3 text-sm text-blue-600 hover:text-blue-800 hover:underline"
            onClick={handleBackToList}
          >
            &larr; Back to sessions
          </button>
          {detailLoading ? (
            <div className="text-gray-500 py-8 text-center">Loading session...</div>
          ) : detailError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {detailError}
            </div>
          ) : sessionDetail ? (
            <SessionDetail session={sessionDetail} />
          ) : null}
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <SprintSelector
            sprints={sessionSprints}
            selected={sessionSprintFilter}
            onChange={setSessionSprintFilter}
            showAll
          />
          <span className="text-sm text-gray-500">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''}
          </span>
        </div>
        {sessionsLoading ? (
          <div className="text-gray-500 py-8 text-center">Loading sessions...</div>
        ) : sessionsError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {sessionsError}
          </div>
        ) : (
          <SessionList
            sessions={sessions}
            selectedId={selectedSessionId}
            onSelect={handleSessionSelect}
          />
        )}
      </div>
    );
  }

  return (
    <div data-testid="dashboard-root" className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">Vigil Dashboard</h1>
            {(activeTab === 'bugs' || activeTab === 'features') && (
              <SprintSelector
                sprints={sprints}
                selected={selectedSprint}
                onChange={setSelectedSprint}
              />
            )}
          </div>
          <HealthIndicator health={health} />
        </div>
      </header>

      {/* Body: Sidebar + Main */}
      <div className="flex flex-1 min-h-0">
        <Sidebar
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={handleProjectSelect}
        />

        <main className="flex-1 px-6 py-6 overflow-y-auto">
          {/* Tab bar */}
          <div className="flex gap-2 mb-4">
            <button
              data-testid="tab-sessions"
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'sessions'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('sessions')}
            >
              Sessions ({sessions.length})
            </button>
            <button
              data-testid="tab-bugs"
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'bugs'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('bugs')}
            >
              Bugs ({bugs.length})
            </button>
            <button
              data-testid="tab-features"
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'features'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('features')}
            >
              Features ({features.length})
            </button>
          </div>

          {/* Tab content */}
          {activeTab === 'sessions' ? (
            renderSessionsContent()
          ) : activeTab === 'bugs' ? (
            <>
              {dataError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {dataError}
                </div>
              )}
              {dataLoading ? (
                <div className="text-gray-500 py-8 text-center">Loading...</div>
              ) : (
                <BugList bugs={bugs} onRefresh={loadBugsAndFeatures} />
              )}
            </>
          ) : (
            <>
              {dataError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {dataError}
                </div>
              )}
              {dataLoading ? (
                <div className="text-gray-500 py-8 text-center">Loading...</div>
              ) : (
                <FeatureList features={features} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

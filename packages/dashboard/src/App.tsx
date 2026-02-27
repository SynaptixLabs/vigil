import { useState, useEffect, useCallback } from 'react';
import { fetchBugs, fetchFeatures, fetchSprints, fetchHealth } from './api';
import type { BugItem, FeatureItem, HealthStatus } from './types';
import { SprintSelector } from './components/SprintSelector';
import { HealthIndicator } from './components/HealthIndicator';
import { BugList } from './views/BugList';
import { FeatureList } from './views/FeatureList';

type Tab = 'bugs' | 'features';

export default function App() {
  const [sprints, setSprints] = useState<string[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<string>('');
  const [bugs, setBugs] = useState<BugItem[]>([]);
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [health, setHealth] = useState<HealthStatus>({ status: 'error' });
  const [activeTab, setActiveTab] = useState<Tab>('bugs');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth().then(setHealth);
    const interval = setInterval(() => fetchHealth().then(setHealth), 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchSprints()
      .then(({ ids, current }) => {
        setSprints(ids);
        if (!selectedSprint) setSelectedSprint(current || ids[ids.length - 1] || '');
      })
      .catch(() => setError('Could not load sprints — is vigil-server running?'));
  }, [selectedSprint]);

  const loadData = useCallback(async () => {
    if (!selectedSprint) return;
    setLoading(true);
    setError(null);
    try {
      const [b, f] = await Promise.all([
        fetchBugs(selectedSprint),
        fetchFeatures(selectedSprint),
      ]);
      setBugs(b);
      setFeatures(f);
    } catch {
      setError('Could not load data — is vigil-server running on port 7474?');
    } finally {
      setLoading(false);
    }
  }, [selectedSprint]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div data-testid="dashboard-root" className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">Vigil Dashboard</h1>
            <SprintSelector
              sprints={sprints}
              selected={selectedSprint}
              onChange={setSelectedSprint}
            />
          </div>
          <HealthIndicator health={health} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-2 mb-4">
          <button
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-500 py-8 text-center">Loading...</div>
        ) : activeTab === 'bugs' ? (
          <BugList bugs={bugs} onRefresh={loadData} />
        ) : (
          <FeatureList features={features} />
        )}
      </main>
    </div>
  );
}

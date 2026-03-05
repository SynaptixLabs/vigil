import { useState, useMemo } from 'react';
import type { FeatureItem } from '../types';
import { SearchInput } from '../components/SearchInput';

interface FeatureListProps {
  features: FeatureItem[];
}

export function FeatureList({ features }: FeatureListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'done'>('all');

  const filtered = useMemo(() => {
    let list = features;
    if (statusFilter !== 'all') {
      list = list.filter((f) =>
        statusFilter === 'open'
          ? f.status.toUpperCase() === 'OPEN'
          : f.status.toUpperCase() === 'DONE',
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (f) =>
          f.id.toLowerCase().includes(q) ||
          f.title.toLowerCase().includes(q) ||
          f.priority.toLowerCase().includes(q) ||
          f.sprint.includes(q),
      );
    }
    return list;
  }, [features, search, statusFilter]);

  return (
    <div>
      {/* Search + filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-72">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search features by ID, title, priority..."
          />
        </div>
        <select
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'open' | 'done')}
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="done">Done</option>
        </select>
        <span className="text-sm text-slate-500">
          {filtered.length} feature{filtered.length !== 1 ? 's' : ''}
          {filtered.length !== features.length && ` of ${features.length}`}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div data-testid="feature-list-table" className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="text-4xl mb-3">✨</div>
          <div className="text-sm font-medium text-slate-600 mb-1">No features found</div>
          <div className="text-xs text-slate-400">
            {features.length > 0 ? 'Try adjusting your search or filters.' : 'No feature requests for this sprint.'}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table data-testid="feature-list-table" className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">ID</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Title</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Priority</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Sprint</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((feat) => (
                <tr
                  key={feat.id}
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-5 py-3 font-mono text-xs text-indigo-600">{feat.id}</td>
                  <td className="px-5 py-3 font-medium text-slate-900">{feat.title}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        feat.priority === 'P0'
                          ? 'bg-red-50 text-red-800 ring-1 ring-red-200'
                          : feat.priority === 'P1'
                            ? 'bg-orange-50 text-orange-800 ring-1 ring-orange-200'
                            : feat.priority === 'P2'
                              ? 'bg-blue-50 text-blue-800 ring-1 ring-blue-200'
                              : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200'
                      }`}
                    >
                      {feat.priority}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        feat.status === 'OPEN'
                          ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
                          : feat.status === 'DONE'
                            ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
                            : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200'
                      }`}
                    >
                      {feat.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-indigo-500 text-xs font-medium">{feat.sprint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import type { BugItem, BugUpdate } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { patchBug, closeBug } from '../api';

interface BugListProps {
  bugs: BugItem[];
  onRefresh: () => void;
}

function parseRegressionStatus(raw?: string): 'GREEN' | 'RED' | null {
  if (!raw) return null;
  if (raw.includes('GREEN') || raw.includes('🟢')) return 'GREEN';
  if (raw.includes('RED') || raw.includes('🔴')) return 'RED';
  return null;
}

export function BugList({ bugs, onRefresh }: BugListProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  async function handleSeverityChange(bugId: string, severity: BugUpdate['severity']) {
    setUpdating(bugId);
    try {
      await patchBug(bugId, { severity });
      onRefresh();
    } catch {
      // Track B API not available yet — silently fail
    } finally {
      setUpdating(null);
    }
  }

  async function handleMarkFixed(bugId: string) {
    setUpdating(bugId);
    try {
      await closeBug(bugId, 'Marked fixed via dashboard', true);
      onRefresh();
    } catch {
      try {
        await patchBug(bugId, { status: 'resolved' });
        onRefresh();
      } catch { /* ignore */ }
    } finally {
      setUpdating(null);
    }
  }

  async function handleReopen(bugId: string) {
    setUpdating(bugId);
    try {
      await patchBug(bugId, { status: 'open' });
      onRefresh();
    } catch {
      // Track B API not available yet
    } finally {
      setUpdating(null);
    }
  }

  if (bugs.length === 0) {
    return (
      <div data-testid="bug-list-table" className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="text-4xl mb-3">🐛</div>
        <div className="text-sm font-medium text-slate-600 mb-1">No bugs found</div>
        <div className="text-xs text-slate-400">No bugs for this sprint. Nice work!</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <table data-testid="bug-list-table" className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">ID</th>
            <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Title</th>
            <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Severity</th>
            <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
            <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Discovered</th>
            <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Regression</th>
            <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bugs.map((bug) => {
            const regStatus = parseRegressionStatus(bug.regressionTest);
            const isOpen = bug.status.toUpperCase() === 'OPEN';

            return (
              <tr
                key={bug.id}
                data-testid={`bug-row-${bug.id}`}
                className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-5 py-3 font-mono text-xs text-indigo-600">{bug.id}</td>
                <td className="px-5 py-3 font-medium text-slate-900">{bug.title}</td>
                <td className="px-5 py-3">
                  <SeverityBadge bugId={bug.id} severity={bug.severity} />
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      isOpen
                        ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
                        : 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
                    }`}
                  >
                    {bug.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-500 text-xs">{bug.discovered}</td>
                <td className="px-5 py-3">
                  {regStatus ? (
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        regStatus === 'GREEN' ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        regStatus === 'GREEN' ? 'bg-emerald-500' : 'bg-red-500'
                      }`} />
                      {regStatus === 'GREEN' ? 'PASS' : 'FAIL'}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-300">N/A</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-1.5">
                    <select
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={bug.severity}
                      disabled={updating === bug.id}
                      onChange={(e) =>
                        handleSeverityChange(bug.id, e.target.value as BugUpdate['severity'])
                      }
                    >
                      <option value="P0">P0</option>
                      <option value="P1">P1</option>
                      <option value="P2">P2</option>
                      <option value="P3">P3</option>
                    </select>
                    {isOpen ? (
                      <button
                        className="text-xs px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50 font-medium transition-colors"
                        disabled={updating === bug.id}
                        onClick={() => handleMarkFixed(bug.id)}
                      >
                        Fix
                      </button>
                    ) : (
                      <button
                        className="text-xs px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 disabled:opacity-50 font-medium transition-colors"
                        disabled={updating === bug.id}
                        onClick={() => handleReopen(bug.id)}
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

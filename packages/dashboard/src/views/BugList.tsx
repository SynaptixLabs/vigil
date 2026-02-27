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
      // fallback: try PATCH if close endpoint unavailable
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
      <div data-testid="bug-list-table" className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
        No bugs found for this sprint.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table data-testid="bug-list-table" className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Severity</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Discovered</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Regression</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
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
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-mono text-xs">{bug.id}</td>
                <td className="px-4 py-3">{bug.title}</td>
                <td className="px-4 py-3">
                  <SeverityBadge bugId={bug.id} severity={bug.severity} />
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      isOpen
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {bug.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{bug.discovered}</td>
                <td className="px-4 py-3">
                  {regStatus ? (
                    <span
                      className={`text-xs ${
                        regStatus === 'GREEN' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {regStatus === 'GREEN' ? 'PASS' : 'FAIL'}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <select
                      className="text-xs border border-gray-300 rounded px-1 py-0.5"
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
                        className="text-xs px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 disabled:opacity-50"
                        disabled={updating === bug.id}
                        onClick={() => handleMarkFixed(bug.id)}
                      >
                        Mark Fixed
                      </button>
                    ) : (
                      <button
                        className="text-xs px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded hover:bg-yellow-100 disabled:opacity-50"
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

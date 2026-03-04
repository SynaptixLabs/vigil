import type { FeatureItem } from '../types';

interface FeatureListProps {
  features: FeatureItem[];
}

export function FeatureList({ features }: FeatureListProps) {
  if (features.length === 0) {
    return (
      <div data-testid="feature-list-table" className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="text-4xl mb-3">✨</div>
        <div className="text-sm font-medium text-slate-600 mb-1">No features found</div>
        <div className="text-xs text-slate-400">No feature requests for this sprint.</div>
      </div>
    );
  }

  return (
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
          {features.map((feat) => (
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
              <td className="px-5 py-3 text-slate-500 text-xs">{feat.sprint}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

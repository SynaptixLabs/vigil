import type { FeatureItem } from '../types';

interface FeatureListProps {
  features: FeatureItem[];
}

export function FeatureList({ features }: FeatureListProps) {
  if (features.length === 0) {
    return (
      <div data-testid="feature-list-table" className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
        No features found for this sprint.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table data-testid="feature-list-table" className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Priority</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Sprint</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feat) => (
            <tr
              key={feat.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="px-4 py-3 font-mono text-xs">{feat.id}</td>
              <td className="px-4 py-3">{feat.title}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    feat.priority === 'P0'
                      ? 'bg-red-100 text-red-800'
                      : feat.priority === 'P1'
                        ? 'bg-orange-100 text-orange-800'
                        : feat.priority === 'P2'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {feat.priority}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    feat.status === 'OPEN'
                      ? 'bg-yellow-100 text-yellow-800'
                      : feat.status === 'DONE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {feat.status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600">{feat.sprint}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

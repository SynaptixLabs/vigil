import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  filterValue?: string;
  filterKey?: keyof T;
  emptyMessage?: string;
}

function DataTable<T extends { id: string }>({
  columns,
  data,
  filterValue = '',
  filterKey,
  emptyMessage = 'No data found',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortAsc(prev => !prev);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const filtered = data.filter(row => {
    if (!filterValue || !filterKey) return true;
    return String(row[filterKey]).toLowerCase().includes(filterValue.toLowerCase());
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const av = String(a[sortKey]);
    const bv = String(b[sortKey]);
    return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm" data-testid="data-table">
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400" data-testid="data-table-empty">
          <p className="font-medium">{emptyMessage}</p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      data-testid={`sort-${String(col.key)}`}
                    >
                      {col.label}
                      {sortKey === col.key
                        ? sortAsc
                          ? <ArrowUp className="w-3 h-3" />
                          : <ArrowDown className="w-3 h-3" />
                        : <ArrowUpDown className="w-3 h-3 opacity-50" />
                      }
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {sorted.map(row => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors" data-testid={`data-table-row-${row.id}`}>
                {columns.map(col => (
                  <td key={String(col.key)} className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DataTable;

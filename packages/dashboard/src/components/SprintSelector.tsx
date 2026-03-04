interface SprintSelectorProps {
  sprints: string[];
  selected: string;
  onChange: (sprint: string) => void;
  /** When true, adds an "All sprints" option with value "" */
  showAll?: boolean;
  /** Dark mode for use on dark header backgrounds */
  dark?: boolean;
}

export function SprintSelector({ sprints, selected, onChange, showAll, dark }: SprintSelectorProps) {
  return (
    <select
      data-testid="sprint-selector"
      className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
        dark
          ? 'bg-indigo-800/50 border-indigo-700 text-indigo-100 focus:ring-indigo-500'
          : 'bg-white border-slate-200 text-slate-700 focus:ring-indigo-500 shadow-sm'
      } border focus:outline-none focus:ring-2 focus:ring-offset-0`}
      value={selected}
      onChange={(e) => onChange(e.target.value)}
    >
      {sprints.length === 0 && <option value="">No sprints</option>}
      {showAll && sprints.length > 0 && <option value="">All sprints</option>}
      {sprints.map((s) => (
        <option key={s} value={s}>
          Sprint {s}
        </option>
      ))}
    </select>
  );
}

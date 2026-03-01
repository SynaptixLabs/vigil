interface SprintSelectorProps {
  sprints: string[];
  selected: string;
  onChange: (sprint: string) => void;
  /** When true, adds an "All sprints" option with value "" */
  showAll?: boolean;
}

export function SprintSelector({ sprints, selected, onChange, showAll }: SprintSelectorProps) {
  return (
    <select
      data-testid="sprint-selector"
      className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
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

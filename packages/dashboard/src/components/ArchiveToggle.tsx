interface ArchiveToggleProps {
  showArchived: boolean;
  onChange: (show: boolean) => void;
}

export function ArchiveToggle({ showArchived, onChange }: ArchiveToggleProps) {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 13,
        color: '#94a3b8',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <input
        type="checkbox"
        checked={showArchived}
        onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: '#6366f1' }}
      />
      Show archived
    </label>
  );
}

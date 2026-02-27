interface SeverityBadgeProps {
  bugId: string;
  severity: string;
}

const SEVERITY_STYLES: Record<string, string> = {
  P0: 'bg-red-100 text-red-800',
  P1: 'bg-orange-100 text-orange-800',
  P2: 'bg-blue-100 text-blue-800',
  P3: 'bg-gray-100 text-gray-600',
};

export function SeverityBadge({ bugId, severity }: SeverityBadgeProps) {
  return (
    <span
      data-testid={`severity-badge-${bugId}`}
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${SEVERITY_STYLES[severity]}`}
    >
      {severity}
    </span>
  );
}

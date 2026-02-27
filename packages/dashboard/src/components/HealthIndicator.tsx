import type { HealthStatus } from '../types';

interface HealthIndicatorProps {
  health: HealthStatus;
}

export function HealthIndicator({ health }: HealthIndicatorProps) {
  const isOk = health.status === 'ok';

  return (
    <div data-testid="server-health-status" className="flex items-center gap-2 text-sm">
      <span
        className={`inline-block w-2 h-2 rounded-full ${isOk ? 'bg-green-500' : 'bg-red-500'}`}
      />
      <span className={isOk ? 'text-green-700' : 'text-red-700'}>
        {isOk ? `Server OK${health.version ? ` v${health.version}` : ''}` : 'Server offline'}
      </span>
      {isOk && health.llmMode && (
        <span className="text-gray-400 text-xs">({health.llmMode})</span>
      )}
    </div>
  );
}

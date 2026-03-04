import type { HealthStatus } from '../types';

interface HealthIndicatorProps {
  health: HealthStatus;
}

export function HealthIndicator({ health }: HealthIndicatorProps) {
  const isOk = health.status === 'ok';

  return (
    <div data-testid="server-health-status" className="flex items-center gap-2 text-sm">
      <span className="relative flex h-2.5 w-2.5">
        {isOk && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOk ? 'bg-emerald-400' : 'bg-red-400'}`}
        />
      </span>
      <span className={isOk ? 'text-emerald-300 font-medium' : 'text-red-300 font-medium'}>
        {isOk ? 'Connected' : 'Offline'}
      </span>
      {isOk && health.version && (
        <span className="text-indigo-300/60 text-xs">v{health.version}</span>
      )}
      {isOk && health.storage && (
        <span className="text-indigo-300/40 text-xs">{health.storage}</span>
      )}
    </div>
  );
}

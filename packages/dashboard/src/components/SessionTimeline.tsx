import { useMemo } from 'react';
import type { SessionDetail, TimelineEvent } from '../types';

export interface SessionTimelineProps {
  session: SessionDetail;
  onSeek?: (timeOffset: number) => void;
  onEventClick?: (event: TimelineEvent, index: number) => void;
  selectedIndex?: number | null;
}

function buildTimeline(session: SessionDetail): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  for (const rec of session.recordings) {
    const startOffset = rec.startedAt - session.startedAt;
    events.push({ type: 'recording-start', time: Math.max(0, startOffset), recordingId: rec.id });
    if (rec.endedAt) {
      const endOffset = rec.endedAt - session.startedAt;
      events.push({ type: 'recording-end', time: Math.max(0, endOffset), recordingId: rec.id });
    }
  }

  for (const snap of session.snapshots) {
    events.push({ type: 'snapshot', time: snap.capturedAt, snapshot: snap });
  }

  for (const bug of session.bugs) {
    const offset = bug.timestamp - session.startedAt;
    events.push({ type: 'bug', time: Math.max(0, offset), bug });
  }

  for (const feat of session.features) {
    const offset = feat.timestamp - session.startedAt;
    events.push({ type: 'feature', time: Math.max(0, offset), feature: feat });
  }

  events.sort((a, b) => a.time - b.time);
  return events;
}

function formatRelativeTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `+${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function eventIcon(type: TimelineEvent['type']): string {
  switch (type) {
    case 'recording-start': return '▶';
    case 'recording-end': return '■';
    case 'snapshot': return '📸';
    case 'bug': return '🐛';
    case 'feature': return '✨';
  }
}

function eventLabel(event: TimelineEvent): string {
  switch (event.type) {
    case 'recording-start': return 'Recording started';
    case 'recording-end': return 'Recording ended';
    case 'snapshot': return `Snapshot (${event.snapshot.triggeredBy})`;
    case 'bug': return `Bug: ${event.bug.title}`;
    case 'feature': return `Feature: ${event.feature.title}`;
  }
}

function eventBadgeStyle(type: TimelineEvent['type']): string {
  switch (type) {
    case 'recording-start': return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
    case 'recording-end': return 'bg-slate-50 text-slate-600 ring-1 ring-slate-200';
    case 'snapshot': return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';
    case 'bug': return 'bg-red-50 text-red-700 ring-1 ring-red-200';
    case 'feature': return 'bg-purple-50 text-purple-700 ring-1 ring-purple-200';
  }
}

export function SessionTimeline({ session, onSeek, onEventClick, selectedIndex }: SessionTimelineProps) {
  const events = useMemo(() => buildTimeline(session), [session]);

  if (events.length === 0) {
    return (
      <div
        data-testid="session-timeline"
        className="bg-white rounded-xl border border-slate-200 p-8 text-center"
      >
        <div className="text-3xl mb-2">📋</div>
        <div className="text-sm text-slate-500">No timeline events</div>
      </div>
    );
  }

  return (
    <div data-testid="session-timeline" className="bg-white rounded-xl border border-slate-200 flex flex-col h-full">
      <div className="px-5 py-3 border-b border-slate-100 shrink-0">
        <h3 className="text-sm font-semibold text-slate-900">
          Timeline
          <span className="ml-2 text-xs font-normal text-slate-400">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </span>
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {events.map((event, index) => {
          const isSelected = selectedIndex === index;
          return (
          <button
            key={`${event.type}-${index}`}
            data-testid={`timeline-event-${index}`}
            className={`w-full text-left px-5 py-3 transition-colors flex items-center gap-3 border-b border-slate-50 last:border-0 ${
              isSelected ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : 'hover:bg-slate-50'
            }`}
            onClick={() => {
              onSeek?.(event.time);
              onEventClick?.(event, index);
            }}
            type="button"
          >
            <span className="text-base shrink-0 w-6 text-center" aria-hidden="true">
              {eventIcon(event.type)}
            </span>
            <span className="text-xs font-mono text-slate-300 shrink-0 w-14 text-right">
              {formatRelativeTime(event.time)}
            </span>
            <span className="text-sm text-slate-700 truncate flex-1">
              {eventLabel(event)}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${eventBadgeStyle(event.type)}`}>
              {event.type === 'recording-start' || event.type === 'recording-end'
                ? 'rec'
                : event.type}
            </span>
          </button>
          );
        })}
      </div>
    </div>
  );
}

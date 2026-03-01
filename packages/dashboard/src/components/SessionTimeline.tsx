import { useMemo } from 'react';
import type { SessionDetail, TimelineEvent } from '../types';

export interface SessionTimelineProps {
  session: SessionDetail;
  onSeek?: (timeOffset: number) => void;
}

/**
 * Derive a sorted timeline of events from a session.
 * All times are relative to session.startedAt (in ms).
 */
function buildTimeline(session: SessionDetail): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Recording start/end markers
  for (const rec of session.recordings) {
    const startOffset = rec.startedAt - session.startedAt;
    events.push({
      type: 'recording-start',
      time: Math.max(0, startOffset),
      recordingId: rec.id,
    });
    if (rec.endedAt) {
      const endOffset = rec.endedAt - session.startedAt;
      events.push({
        type: 'recording-end',
        time: Math.max(0, endOffset),
        recordingId: rec.id,
      });
    }
  }

  // Snapshots (capturedAt is already relative to session start)
  for (const snap of session.snapshots) {
    events.push({
      type: 'snapshot',
      time: snap.capturedAt,
      snapshot: snap,
    });
  }

  // Bugs (timestamp is epoch ms)
  for (const bug of session.bugs) {
    const offset = bug.timestamp - session.startedAt;
    events.push({
      type: 'bug',
      time: Math.max(0, offset),
      bug,
    });
  }

  // Features (timestamp is epoch ms)
  for (const feat of session.features) {
    const offset = feat.timestamp - session.startedAt;
    events.push({
      type: 'feature',
      time: Math.max(0, offset),
      feature: feat,
    });
  }

  // Sort ascending by time
  events.sort((a, b) => a.time - b.time);
  return events;
}

/** Format a ms offset as "+M:SS" */
function formatRelativeTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `+${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function eventIcon(type: TimelineEvent['type']): string {
  switch (type) {
    case 'recording-start':
      return '\u25B6';  // play triangle
    case 'recording-end':
      return '\u25A0';  // stop square
    case 'snapshot':
      return '\uD83D\uDCF7';  // camera
    case 'bug':
      return '\uD83D\uDC1B';  // bug
    case 'feature':
      return '\u2728';  // sparkles
  }
}

function eventLabel(event: TimelineEvent): string {
  switch (event.type) {
    case 'recording-start':
      return 'Recording started';
    case 'recording-end':
      return 'Recording ended';
    case 'snapshot':
      return `Snapshot (${event.snapshot.triggeredBy})`;
    case 'bug':
      return `Bug: ${event.bug.title}`;
    case 'feature':
      return `Feature: ${event.feature.title}`;
  }
}

function eventBadgeColor(type: TimelineEvent['type']): string {
  switch (type) {
    case 'recording-start':
      return 'bg-green-100 text-green-700';
    case 'recording-end':
      return 'bg-gray-100 text-gray-600';
    case 'snapshot':
      return 'bg-blue-100 text-blue-700';
    case 'bug':
      return 'bg-red-100 text-red-700';
    case 'feature':
      return 'bg-purple-100 text-purple-700';
  }
}

export function SessionTimeline({ session, onSeek }: SessionTimelineProps) {
  const events = useMemo(() => buildTimeline(session), [session]);

  if (events.length === 0) {
    return (
      <div
        data-testid="session-timeline"
        className="bg-white rounded-lg border border-gray-200 p-6 text-center text-sm text-gray-500"
      >
        No timeline events for this session.
      </div>
    );
  }

  return (
    <div data-testid="session-timeline" className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">
          Timeline ({events.length} events)
        </h3>
      </div>
      <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
        {events.map((event, index) => (
          <button
            key={`${event.type}-${index}`}
            data-testid={`timeline-event-${index}`}
            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-3"
            onClick={() => onSeek?.(event.time)}
            type="button"
          >
            {/* Icon */}
            <span className="text-base shrink-0 w-6 text-center" aria-hidden="true">
              {eventIcon(event.type)}
            </span>

            {/* Timestamp badge */}
            <span className="text-xs font-mono text-gray-400 shrink-0 w-12 text-right">
              {formatRelativeTime(event.time)}
            </span>

            {/* Label */}
            <span className="text-sm text-gray-800 truncate flex-1">
              {eventLabel(event)}
            </span>

            {/* Type badge */}
            <span
              className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${eventBadgeColor(event.type)}`}
            >
              {event.type === 'recording-start'
                ? 'rec'
                : event.type === 'recording-end'
                  ? 'rec'
                  : event.type}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
